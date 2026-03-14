import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

const getAdminApp = () => {
  const existing = admin.apps.find((a) => a?.name === "account-delete");
  if (existing) return existing;

  const normalizePrivateKey = (value: string) =>
    value
      .trim()
      .replace(/^"([\s\S]*)"$/, "$1")
      .replace(/^'([\s\S]*)'$/, "$1")
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n");

  const serviceJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (serviceJson) {
    const parsed = JSON.parse(serviceJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    const projectId = parsed.project_id;
    return admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key?.replace(/\\n/g, "\n"),
        }),
        projectId,
      },
      "account-delete",
    );
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: normalizePrivateKey(privateKey),
        }),
        projectId,
      },
      "account-delete",
    );
  }

  try {
    return admin.initializeApp(
      {
        credential: admin.credential.applicationDefault(),
      },
      "account-delete",
    );
  } catch {
    throw new Error(
      "Firebase Admin not configured. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS).",
    );
  }
};

const chunk = <T,>(items: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 401 });
  }

  try {
    const app = getAdminApp();
    const auth = app.auth();
    const firestore = app.firestore();

    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const detailsRefCounts = new Map<string, number>();
    const cloudinaryPublicIds = new Set<string>();

    const collectFromList = async (path: "Collection" | "Wishlist") => {
      const snap = await firestore.collection("users").doc(uid).collection(path).get();
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as Record<string, unknown>;
        const source = typeof data.source === "string" ? data.source : "";
        const detailsRef = typeof data.detailsRef === "string" ? data.detailsRef : "";

        if (detailsRef && source !== "custom") {
          detailsRefCounts.set(detailsRef, (detailsRefCounts.get(detailsRef) ?? 0) + 1);
        }

        if (source === "custom") {
          const rawIds = data.cloudinaryPublicIds;
          if (Array.isArray(rawIds)) {
            for (const id of rawIds) {
              if (typeof id === "string" && id.length > 0) cloudinaryPublicIds.add(id);
            }
          }

          const detailsDocSnap = await firestore
            .collection("users")
            .doc(uid)
            .collection(path)
            .doc(docSnap.id)
            .collection("details")
            .doc("details")
            .get()
            .catch(() => null);

          if (detailsDocSnap && detailsDocSnap.exists) {
            const detailsData = (detailsDocSnap.data() ?? {}) as Record<string, unknown>;
            const storedIds = detailsData.cloudinaryPublicIds;
            if (Array.isArray(storedIds)) {
              for (const id of storedIds) {
                if (typeof id === "string" && id.length > 0) cloudinaryPublicIds.add(id);
              }
            }
          }
        }
      }
    };

    await Promise.all([collectFromList("Collection"), collectFromList("Wishlist")]);

    // Revoke outgoing/incoming friend requests + remove friend links.
    const [friendsSnap, outgoingSnap, incomingSnap] = await Promise.all([
      firestore.collection("users").doc(uid).collection("Friends").get(),
      firestore.collection("users").doc(uid).collection("FriendRequestsOutgoing").get(),
      firestore.collection("users").doc(uid).collection("FriendRequestsIncoming").get(),
    ]);

    await Promise.allSettled([
      ...friendsSnap.docs.map((friendDoc) =>
        firestore
          .collection("users")
          .doc(friendDoc.id)
          .collection("Friends")
          .doc(uid)
          .delete()
          .catch(() => undefined),
      ),
      ...outgoingSnap.docs.map((requestDoc) =>
        firestore
          .collection("users")
          .doc(requestDoc.id)
          .collection("FriendRequestsIncoming")
          .doc(uid)
          .delete()
          .catch(() => undefined),
      ),
      ...incomingSnap.docs.map((requestDoc) =>
        firestore
          .collection("users")
          .doc(requestDoc.id)
          .collection("FriendRequestsOutgoing")
          .doc(uid)
          .delete()
          .catch(() => undefined),
      ),
    ]);

    // Delete the entire Firestore tree under users/{uid}.
    const userRef = firestore.collection("users").doc(uid);
    if (typeof (firestore as unknown as { recursiveDelete?: unknown }).recursiveDelete === "function") {
      await (firestore as unknown as { recursiveDelete: (ref: admin.firestore.DocumentReference) => Promise<void> }).recursiveDelete(userRef);
    } else {
      // Fallback: best-effort deletes of known subcollections (does not guarantee deep deletion).
      const deleteKnown = async (sub: string) => {
        const snap = await userRef.collection(sub).get();
        await Promise.allSettled(snap.docs.map((d) => d.ref.delete().catch(() => undefined)));
      };
      await Promise.all([
        deleteKnown("Collection"),
        deleteKnown("Wishlist"),
        deleteKnown("Friends"),
        deleteKnown("FriendRequestsOutgoing"),
        deleteKnown("FriendRequestsIncoming"),
      ]);
      await userRef.delete().catch(() => undefined);
    }

    // Decrement refCount and delete AlbumDetails if no longer referenced.
    for (const [detailsRef, count] of detailsRefCounts.entries()) {
      const safeCount = Math.max(1, count);
      await firestore
        .collection("AlbumDetails")
        .doc(detailsRef)
        .set(
          {
            refCount: admin.firestore.FieldValue.increment(-safeCount),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
        .catch(() => undefined);

      const detailsDoc = await firestore
        .collection("AlbumDetails")
        .doc(detailsRef)
        .get()
        .catch(() => null);
      const detailsData =
        detailsDoc && detailsDoc.exists
          ? ((detailsDoc.data() ?? {}) as { id?: unknown; master_id?: unknown })
          : {};
      const detailsId =
        typeof detailsData.id === "number" ? detailsData.id : undefined;
      const detailsMasterId =
        typeof detailsData.master_id === "number" ? detailsData.master_id : undefined;

      const docMatches = (raw: admin.firestore.DocumentData | undefined) => {
        const data = raw ?? {};
        const dataDetailsRef =
          typeof data.detailsRef === "string" ? data.detailsRef : "";
        const dataId = typeof data.id === "number" ? data.id : undefined;
        const dataMasterId =
          typeof data.master_id === "number" ? data.master_id : undefined;

        if (dataDetailsRef === detailsRef) return true;
        if (detailsId !== undefined && dataId === detailsId) return true;
        if (detailsMasterId !== undefined && dataMasterId === detailsMasterId)
          return true;
        return false;
      };

      let stillReferenced = false;

      try {
        const [
          collectionRefSnap,
          wishlistRefSnap,
          collectionIdSnap,
          wishlistIdSnap,
          collectionMasterSnap,
          wishlistMasterSnap,
        ] = await Promise.all([
          firestore
            .collectionGroup("Collection")
            .where("detailsRef", "==", detailsRef)
            .limit(1)
            .get(),
          firestore
            .collectionGroup("Wishlist")
            .where("detailsRef", "==", detailsRef)
            .limit(1)
            .get(),
          detailsId !== undefined
            ? firestore
                .collectionGroup("Collection")
                .where("id", "==", detailsId)
                .limit(1)
                .get()
            : Promise.resolve(null),
          detailsId !== undefined
            ? firestore
                .collectionGroup("Wishlist")
                .where("id", "==", detailsId)
                .limit(1)
                .get()
            : Promise.resolve(null),
          detailsMasterId !== undefined
            ? firestore
                .collectionGroup("Collection")
                .where("master_id", "==", detailsMasterId)
                .limit(1)
                .get()
            : Promise.resolve(null),
          detailsMasterId !== undefined
            ? firestore
                .collectionGroup("Wishlist")
                .where("master_id", "==", detailsMasterId)
                .limit(1)
                .get()
            : Promise.resolve(null),
        ]);

        stillReferenced =
          !collectionRefSnap.empty ||
          !wishlistRefSnap.empty ||
          (collectionIdSnap !== null && !collectionIdSnap.empty) ||
          (wishlistIdSnap !== null && !wishlistIdSnap.empty) ||
          (collectionMasterSnap !== null && !collectionMasterSnap.empty) ||
          (wishlistMasterSnap !== null && !wishlistMasterSnap.empty);
      } catch (queryError) {
        const message =
          queryError instanceof Error ? queryError.message : String(queryError);

        if (!message.includes("FAILED_PRECONDITION")) {
          throw queryError;
        }

        // Fallback when collectionGroup indexes are missing.
        const usersSnap = await firestore.collection("users").get();
        for (const userDoc of usersSnap.docs) {
          const [collectionSnap, wishlistSnap] = await Promise.all([
            firestore
              .collection("users")
              .doc(userDoc.id)
              .collection("Collection")
              .get(),
            firestore
              .collection("users")
              .doc(userDoc.id)
              .collection("Wishlist")
              .get(),
          ]);

          const hasMatch =
            collectionSnap.docs.some((d) => docMatches(d.data())) ||
            wishlistSnap.docs.some((d) => docMatches(d.data()));

          if (hasMatch) {
            stillReferenced = true;
            break;
          }
        }
      }

      if (!stillReferenced) {
        await firestore
          .collection("AlbumDetails")
          .doc(detailsRef)
          .delete()
          .catch(() => undefined);
      }
    }

    // Cleanup Cloudinary custom images (safe path, chunked).
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret && cloudinaryPublicIds.size > 0) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      const safeIds = Array.from(cloudinaryPublicIds).filter((id) => id.includes("custom-albums/"));
      for (const ids of chunk(safeIds, 25)) {
        if (ids.length === 0) continue;
        await cloudinary.api
          .delete_resources(ids, {
            resource_type: "image",
            type: "upload",
            invalidate: true,
          })
          .catch(() => undefined);
      }
    }

    // Delete Auth user last.
    await auth.deleteUser(uid).catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 },
    );
  }
}

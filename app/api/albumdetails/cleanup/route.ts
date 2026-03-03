import { NextResponse } from "next/server";
import admin from "firebase-admin";

const getAdminApp = () => {
  if (admin.apps.length > 0) return admin.app();

  const serviceJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (serviceJson) {
    const parsed = JSON.parse(serviceJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key?.replace(/\\n/g, "\n"),
      }),
    });
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  try {
    // Fallback for environments using GOOGLE_APPLICATION_CREDENTIALS
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch {
    throw new Error(
      "Firebase Admin not configured. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS).",
    );
  }
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    detailsRef?: unknown;
  };

  const detailsRef = typeof body.detailsRef === "string" ? body.detailsRef : "";
  if (!detailsRef || !/^[rm]_/.test(detailsRef)) {
    return NextResponse.json({ ok: false, error: "Invalid detailsRef" }, { status: 400 });
  }

  try {
    const app = getAdminApp();
    const firestore = app.firestore();
    const detailsDoc = await firestore
      .collection("AlbumDetails")
      .doc(detailsRef)
      .get();
    const detailsData = detailsDoc.exists
      ? (detailsDoc.data() as { id?: unknown; master_id?: unknown })
      : {};
    const detailsId =
      typeof detailsData.id === "number" ? detailsData.id : undefined;
    const detailsMasterId =
      typeof detailsData.master_id === "number"
        ? detailsData.master_id
        : undefined;

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

      // Fallback when collectionGroup indexes are missing:
      // iterate user subcollections and check fields directly.
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

    if (stillReferenced) {
      return NextResponse.json({ ok: true, deleted: false, stillReferenced: true });
    }

    await firestore.collection("AlbumDetails").doc(detailsRef).delete();
    return NextResponse.json({ ok: true, deleted: true, stillReferenced: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Cleanup failed",
      },
      { status: 500 },
    );
  }
}


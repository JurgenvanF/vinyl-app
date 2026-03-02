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

  throw new Error("Firebase Admin not configured");
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

    const [collectionSnap, wishlistSnap] = await Promise.all([
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
    ]);

    const stillReferenced = !collectionSnap.empty || !wishlistSnap.empty;
    if (stillReferenced) {
      return NextResponse.json({ ok: true, deleted: false, stillReferenced: true });
    }

    await firestore.collection("AlbumDetails").doc(detailsRef).delete();
    return NextResponse.json({ ok: true, deleted: true, stillReferenced: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Cleanup failed" }, { status: 500 });
  }
}


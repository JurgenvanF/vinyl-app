import { db } from "./firebase";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  DiscogsReleaseDetails,
  fetchDiscogsReleaseDetails,
} from "./discogsRelease";

type SharedDetailsParams = {
  id?: number | null;
  masterId?: number | null;
  resultType?: string | null;
  detailsRef?: string | null;
};

const SHARED_DETAILS_COLLECTION = "AlbumDetails";
const CLEANUP_RETRY_MS = [0, 1200, 4000] as const;

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const getAlbumDetailsRef = ({
  id,
  masterId,
  resultType,
}: SharedDetailsParams): string => {
  const releaseId = id ?? masterId ?? 0;
  if (masterId) return `m_${masterId}`;
  if (resultType === "master" && releaseId) return `m_${releaseId}`;
  return `r_${releaseId}`;
};

export const getSharedAlbumDetails = async (
  detailsRef?: string | null,
): Promise<DiscogsReleaseDetails | null> => {
  if (!detailsRef) return null;
  const sharedRef = doc(db, SHARED_DETAILS_COLLECTION, detailsRef);
  const snapshot = await getDoc(sharedRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as { details?: DiscogsReleaseDetails };
  return data.details ?? null;
};

export const ensureSharedAlbumDetails = async (
  params: SharedDetailsParams,
): Promise<{ detailsRef: string; details: DiscogsReleaseDetails }> => {
  const detailsRef = params.detailsRef || getAlbumDetailsRef(params);
  const sharedRef = doc(db, SHARED_DETAILS_COLLECTION, detailsRef);
  const snapshot = await getDoc(sharedRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as { details?: DiscogsReleaseDetails };
    if (data.details) {
      return { detailsRef, details: data.details };
    }
  }

  const details = await fetchDiscogsReleaseDetails({
    id: params.id,
    masterId: params.masterId,
    resultType: params.resultType,
  });

  await setDoc(
    sharedRef,
    {
      details,
      id: params.id ?? null,
      master_id: params.masterId ?? null,
      resultType: params.resultType ?? null,
      detailsFetchedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { detailsRef, details };
};

export const incrementAlbumDetailsRefCount = async (detailsRef: string) => {
  const sharedRef = doc(db, SHARED_DETAILS_COLLECTION, detailsRef);
  await updateDoc(sharedRef, {
    refCount: increment(1),
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    await setDoc(
      sharedRef,
      { refCount: 1, updatedAt: serverTimestamp() },
      { merge: true },
    );
  });
};

export const decrementAlbumDetailsRefCountAndCleanup = async (
  detailsRef: string,
) => {
  const sharedRef = doc(db, SHARED_DETAILS_COLLECTION, detailsRef);
  try {
    await updateDoc(sharedRef, {
      refCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Refcount can drift for older data. Cleanup still relies on authoritative
    // collectionGroup checks on the server, so continue.
  }

  if (typeof window !== "undefined") {
    for (const delayMs of CLEANUP_RETRY_MS) {
      if (delayMs > 0) {
        await wait(delayMs);
      }

      try {
        const response = await fetch("/api/albumdetails/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ detailsRef }),
        });

        const body = (await response.json().catch(() => null)) as
          | { ok?: boolean; deleted?: boolean; stillReferenced?: boolean; error?: string }
          | null;

        if (!response.ok || !body?.ok) {
          console.warn("Album details cleanup failed", {
            detailsRef,
            status: response.status,
            body,
          });
          continue;
        }

        if (body.deleted) {
          return;
        }

        if (body.stillReferenced) {
          // Retry a few times in case this call raced a just-finished delete.
          continue;
        }
      } catch (error) {
        console.warn("Album details cleanup request error", {
          detailsRef,
          error,
        });
      }
    }
  }
};

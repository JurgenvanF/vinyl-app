import { db } from "./firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

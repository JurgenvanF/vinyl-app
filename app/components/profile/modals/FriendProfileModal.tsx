"use client";

import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Calendar, Disc, MicVocal, Music, X } from "lucide-react";

import { db } from "../../../../lib/firebase";
import { t } from "../../../../lib/translations";
import VinylSpinner from "../../spinner/VinylSpinner";
import AlbumCard from "../../albums/card/AlbumCard";
import AlbumDetailsModal from "../../albums/modal/AlbumDetailsModal";
import type { DiscogsReleaseDetails } from "../../../../lib/discogsRelease";
import type {
  CollectionAlbumLite,
  ProfilePrivacySettings,
  UserProfileDocument,
} from "../profileTypes";
import {
  getProfileIconStyle,
  getProfileInitials,
  isVariousArtistName,
  normalizeProfileIconColor,
} from "../profileDisplay";
import {
  acquireModalScrollLock,
  releaseModalScrollLock,
} from "../../../../lib/modalScrollLock";
import "../ProfilePage.scss";

const defaultPrivacy: ProfilePrivacySettings = {
  profile: "everyone",
  collection: "friends",
  wishlist: "friends",
};

type FriendProfileModalProps = {
  open: boolean;
  viewer: User;
  friendUid: string | null;
  locale: "en" | "nl";
  onClose: () => void;
};

function isAllowed(
  level: ProfilePrivacySettings[keyof ProfilePrivacySettings],
  viewerUid: string,
  ownerUid: string,
  isFriend: boolean,
) {
  if (viewerUid === ownerUid) return true;
  if (level === "everyone") return true;
  if (level === "friends") return isFriend;
  return false;
}

function normalizeFriendProfile(raw: unknown): UserProfileDocument | null {
  const base =
    typeof raw === "object" && raw ? (raw as Record<string, unknown>) : null;
  if (!base) return null;
  const firstName = typeof base.firstName === "string" ? base.firstName : "";
  const lastName = typeof base.lastName === "string" ? base.lastName : "";
  const email = typeof base.email === "string" ? base.email : "";
  return {
    firstName,
    lastName,
    email,
    bio: typeof base.bio === "string" ? base.bio : "",
    startedCollectingYear:
      typeof base.startedCollectingYear === "number"
        ? base.startedCollectingYear
        : null,
    favoriteAlbumId:
      typeof base.favoriteAlbumId === "number" ? base.favoriteAlbumId : null,
    favoriteGenres: Array.isArray(base.favoriteGenres)
      ? base.favoriteGenres
          .filter((g): g is string => typeof g === "string")
          .map((g) => g.trim())
          .filter(Boolean)
      : [],
    iconColor: normalizeProfileIconColor(base.iconColor),
    privacy: (typeof base.privacy === "object" && base.privacy
      ? (base.privacy as Record<string, unknown>)
      : {}) as never,
  };
}

export default function FriendProfileModal({
  open,
  viewer,
  friendUid,
  locale,
  onClose,
}: FriendProfileModalProps) {
  const statsScrollRef = useRef<HTMLDivElement | null>(null);
  const statsDragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isStatsDragging, setIsStatsDragging] = useState(false);

  const [profile, setProfile] = useState<UserProfileDocument | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(false);

  const [collectionAlbums, setCollectionAlbums] = useState<
    CollectionAlbumLite[]
  >([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<CollectionAlbumLite[]>(
    [],
  );
  const [viewerCollectionAlbums, setViewerCollectionAlbums] = useState<
    CollectionAlbumLite[]
  >([]);
  const [viewMode, setViewMode] = useState<
    "profile" | "collection" | "wishlist"
  >("profile");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsAlbum, setDetailsAlbum] = useState<{
    id: number;
    title: string;
    artist?: string;
    primaryArtist?: string;
    cover_image: string;
    genre?: string[];
    year?: number;
    catno?: string;
    master_id?: number;
    detailsRef?: string | null;
    source?: string;
    cloudinaryPublicIds?: string[];
  } | null>(null);
  const [detailsOverride, setDetailsOverride] =
    useState<DiscogsReleaseDetails | null>(null);
  const [detailsArtist, setDetailsArtist] = useState<string>("");
  const [detailsTitle, setDetailsTitle] = useState<string>("");
  const [detailsInViewerCollection, setDetailsInViewerCollection] =
    useState(false);

  useEffect(() => {
    if (!isStatsDragging) return;
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = prevCursor;
    };
  }, [isStatsDragging]);

  const onStatsPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (event.button !== 0) return;

    const container = statsScrollRef.current;
    if (!container) return;

    statsDragRef.current.active = true;
    statsDragRef.current.pointerId = event.pointerId;
    statsDragRef.current.startX = event.clientX;
    statsDragRef.current.startScrollLeft = container.scrollLeft;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsStatsDragging(true);
  };

  const onStatsPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (!statsDragRef.current.active) return;

    const container = statsScrollRef.current;
    if (!container) return;

    const dx = event.clientX - statsDragRef.current.startX;
    container.scrollLeft = statsDragRef.current.startScrollLeft - dx;

    event.preventDefault();
  };

  const endStatsDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (statsDragRef.current.pointerId !== event.pointerId) return;

    statsDragRef.current.active = false;
    statsDragRef.current.pointerId = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    setIsStatsDragging(false);
  };

  const openAlbumDetails = async (
    list: "Collection" | "Wishlist",
    albumId: number,
  ) => {
    if (!friendUid) return;

    const baseRef = doc(db, "users", friendUid, list, albumId.toString());
    const [albumSnap, detailsSnap] = await Promise.all([
      getDoc(baseRef),
      getDoc(doc(baseRef, "details", "details")),
    ]);

    if (!albumSnap.exists()) return;
    const data = (albumSnap.data() ?? {}) as Record<string, unknown>;

    const artist =
      typeof data.artist === "string"
        ? data.artist
        : typeof data.primaryArtist === "string"
          ? data.primaryArtist
          : "";

    const genre = Array.isArray(data.genre)
      ? data.genre.filter((v): v is string => typeof v === "string")
      : data.genre && typeof data.genre === "string"
        ? [data.genre]
        : undefined;

    const normalizedAlbum = {
      id: typeof data.id === "number" ? data.id : albumId,
      title: typeof data.title === "string" ? data.title : "",
      artist,
      primaryArtist:
        typeof data.primaryArtist === "string" ? data.primaryArtist : undefined,
      cover_image: typeof data.cover_image === "string" ? data.cover_image : "",
      genre,
      year: typeof data.year === "number" ? data.year : undefined,
      catno: typeof data.catno === "string" ? data.catno : undefined,
      master_id:
        typeof data.master_id === "number" ? data.master_id : undefined,
      detailsRef: typeof data.detailsRef === "string" ? data.detailsRef : null,
      source: typeof data.source === "string" ? data.source : undefined,
      cloudinaryPublicIds: Array.isArray(data.cloudinaryPublicIds)
        ? data.cloudinaryPublicIds.filter(
            (v): v is string => typeof v === "string",
          )
        : undefined,
    };

    let override: DiscogsReleaseDetails | null = null;
    if (normalizedAlbum.source === "custom") {
      const detailsData = detailsSnap.data() as
        | Record<string, unknown>
        | undefined;
      const maybeDetails = detailsData?.details;
      if (maybeDetails && typeof maybeDetails === "object") {
        override = maybeDetails as DiscogsReleaseDetails;
      }
    }

    setDetailsAlbum(normalizedAlbum);
    setDetailsOverride(override);
    setDetailsArtist(artist);
    setDetailsTitle(normalizedAlbum.title);
    setDetailsInViewerCollection(
      list === "Collection" &&
        viewerCollectionAlbums.some((album) => album.id === normalizedAlbum.id),
    );
    setDetailsOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    acquireModalScrollLock();
    return () => releaseModalScrollLock();
  }, [open]);

  useEffect(() => {
    if (!open || !friendUid) return;
    setLoading(true);

    const load = async () => {
      try {
        const [profileSnap, reverseFriendSnap] = await Promise.all([
          getDoc(doc(db, "users", friendUid)),
          getDoc(doc(db, "users", friendUid, "Friends", viewer.uid)),
        ]);
        setProfile(normalizeFriendProfile(profileSnap.data()));
        setIsFriend(reverseFriendSnap.exists());
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, friendUid, viewer.uid]);

  const privacy = useMemo(() => {
    const raw = (profile?.privacy ?? {}) as Partial<ProfilePrivacySettings>;
    return { ...defaultPrivacy, ...raw };
  }, [profile?.privacy]);

  const canSeeProfile = friendUid
    ? isAllowed(privacy.profile, viewer.uid, friendUid, isFriend)
    : false;
  const canSeeCollection = friendUid
    ? isAllowed(privacy.collection, viewer.uid, friendUid, isFriend)
    : false;
  const canSeeWishlist = friendUid
    ? isAllowed(privacy.wishlist, viewer.uid, friendUid, isFriend)
    : false;

  useEffect(() => {
    if (viewMode === "collection" && !canSeeCollection) setViewMode("profile");
    if (viewMode === "wishlist" && !canSeeWishlist) setViewMode("profile");
  }, [viewMode, canSeeCollection, canSeeWishlist]);

  useEffect(() => {
    if (!open || !friendUid) {
      setCollectionAlbums([]);
      return;
    }

    const ref = collection(db, "users", friendUid, "Collection");
    const q = query(ref, orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: CollectionAlbumLite[] = snapshot.docs
          .map((docSnap): CollectionAlbumLite | null => {
            const data = docSnap.data() as Record<string, unknown>;
            const id =
              typeof data.id === "number" ? data.id : Number(docSnap.id);
            if (!Number.isFinite(id)) return null;
            const genre = Array.isArray(data.genre)
              ? data.genre.filter((v): v is string => typeof v === "string")
              : data.genre && typeof data.genre === "string"
                ? [data.genre]
                : null;
            return {
              id,
              title: typeof data.title === "string" ? data.title : "",
              artist: typeof data.artist === "string" ? data.artist : undefined,
              primaryArtist:
                typeof data.primaryArtist === "string"
                  ? data.primaryArtist
                  : undefined,
              cover_image:
                typeof data.cover_image === "string"
                  ? data.cover_image
                  : undefined,
              genre,
              year: typeof data.year === "number" ? data.year : null,
            };
          })
          .filter((album): album is CollectionAlbumLite => album !== null);
        setCollectionAlbums(next);
      },
      () => setCollectionAlbums([]),
    );

    return () => unsubscribe();
  }, [open, friendUid]);

  useEffect(() => {
    if (!open || !viewer.uid) {
      setViewerCollectionAlbums([]);
      return;
    }

    const ref = collection(db, "users", viewer.uid, "Collection");
    const q = query(ref, orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: CollectionAlbumLite[] = snapshot.docs
          .map((docSnap): CollectionAlbumLite | null => {
            const data = docSnap.data() as Record<string, unknown>;
            const id =
              typeof data.id === "number" ? data.id : Number(docSnap.id);
            if (!Number.isFinite(id)) return null;
            const genre = Array.isArray(data.genre)
              ? data.genre.filter((v): v is string => typeof v === "string")
              : data.genre && typeof data.genre === "string"
                ? [data.genre]
                : null;
            return {
              id,
              title: typeof data.title === "string" ? data.title : "",
              artist: typeof data.artist === "string" ? data.artist : undefined,
              primaryArtist:
                typeof data.primaryArtist === "string"
                  ? data.primaryArtist
                  : undefined,
              cover_image:
                typeof data.cover_image === "string"
                  ? data.cover_image
                  : undefined,
              genre,
              year: typeof data.year === "number" ? data.year : null,
            };
          })
          .filter((album): album is CollectionAlbumLite => album !== null);
        setViewerCollectionAlbums(next);
      },
      () => setViewerCollectionAlbums([]),
    );

    return () => unsubscribe();
  }, [open, viewer.uid]);

  useEffect(() => {
    if (!open || !friendUid || !canSeeWishlist) {
      setWishlistAlbums([]);
      return;
    }

    const ref = collection(db, "users", friendUid, "Wishlist");
    const q = query(ref, orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: CollectionAlbumLite[] = snapshot.docs
          .map((docSnap): CollectionAlbumLite | null => {
            const data = docSnap.data() as Record<string, unknown>;
            const id =
              typeof data.id === "number" ? data.id : Number(docSnap.id);
            if (!Number.isFinite(id)) return null;
            const genre = Array.isArray(data.genre)
              ? data.genre.filter((v): v is string => typeof v === "string")
              : data.genre && typeof data.genre === "string"
                ? [data.genre]
                : null;
            return {
              id,
              title: typeof data.title === "string" ? data.title : "",
              artist: typeof data.artist === "string" ? data.artist : undefined,
              primaryArtist:
                typeof data.primaryArtist === "string"
                  ? data.primaryArtist
                  : undefined,
              cover_image:
                typeof data.cover_image === "string"
                  ? data.cover_image
                  : undefined,
              genre,
              year: typeof data.year === "number" ? data.year : null,
            };
          })
          .filter((album): album is CollectionAlbumLite => album !== null);
        setWishlistAlbums(next);
      },
      () => setWishlistAlbums([]),
    );

    return () => unsubscribe();
  }, [open, friendUid, canSeeWishlist]);

  const uniqueGenres = useMemo(() => {
    const all = new Set<string>();
    for (const album of collectionAlbums) {
      if (!Array.isArray(album.genre)) continue;
      for (const g of album.genre) {
        const normalized = g.trim();
        if (normalized) all.add(normalized);
      }
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [collectionAlbums]);

  const favoriteAlbum = useMemo(() => {
    if (!profile || typeof profile.favoriteAlbumId !== "number") return null;
    return (
      collectionAlbums.find((a) => a.id === profile.favoriteAlbumId) ?? null
    );
  }, [collectionAlbums, profile]);
  const favoriteGenres = useMemo(() => {
    const saved = (profile?.favoriteGenres ?? [])
      .map((genre) => genre.trim())
      .filter(Boolean);
    if (uniqueGenres.length === 0) return [];
    const currentGenres = new Set(uniqueGenres);
    return saved.filter((genre) => currentGenres.has(genre)).slice(0, 5);
  }, [profile?.favoriteGenres, uniqueGenres]);

  const currentYear = new Date().getFullYear();
  const startedYear =
    typeof profile?.startedCollectingYear === "number"
      ? profile.startedCollectingYear
      : null;
  const yearsCollecting =
    startedYear && startedYear > 0
      ? Math.max(0, currentYear - startedYear + 1)
      : 0;

  const topArtist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const album of collectionAlbums) {
      const name = (album.primaryArtist ?? album.artist ?? "").trim();
      if (!name || isVariousArtistName(name)) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    let best: { name: string; count: number } | null = null;
    for (const [name, count] of counts.entries()) {
      if (!best || count > best.count) best = { name, count };
    }
    return best;
  }, [collectionAlbums]);

  const sharedAlbums = useMemo(() => {
    const viewerIds = new Set(viewerCollectionAlbums.map((album) => album.id));
    return collectionAlbums.filter((album) => viewerIds.has(album.id));
  }, [collectionAlbums, viewerCollectionAlbums]);

  if (!open || !friendUid) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 profile__overlay flex items-center justify-center z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="profile__surface border rounded-xl p-4 sm:p-6 m-4 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {t(locale, "friendProfile")}
            </h2>
            {profile && (
              <p className="profile__muted mt-1">
                {profile.firstName} {profile.lastName}
              </p>
            )}
          </div>
          <button
            type="button"
            className="profile__btn--close px-3 py-2 cursor-pointer"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <VinylSpinner />
          </div>
        )}

        {!loading && !profile && (
          <p className="profile__muted mt-6">{t(locale, "profileLoadError")}</p>
        )}

        {!loading && profile && (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={`profile__modal__tab border px-4 py-2 rounded-lg cursor-pointer ${
                  viewMode === "profile" ? "profile__modal__tab--active" : ""
                }`}
                onClick={() => setViewMode("profile")}
              >
                {t(locale, "profile")}
              </button>
              {canSeeCollection && (
                <button
                  type="button"
                  className={`profile__modal__tab border px-4 py-2 rounded-lg cursor-pointer ${
                    viewMode === "collection"
                      ? "profile__modal__tab--active"
                      : ""
                  }`}
                  onClick={() => setViewMode("collection")}
                >
                  {t(locale, "collection")}
                </button>
              )}
              {canSeeWishlist && (
                <button
                  type="button"
                  className={`profile__modal__tab border px-4 py-2 rounded-lg cursor-pointer ${
                    viewMode === "wishlist" ? "profile__modal__tab--active" : ""
                  }`}
                  onClick={() => setViewMode("wishlist")}
                >
                  {t(locale, "wishlist")}
                </button>
              )}
            </div>

            {viewMode === "profile" && (
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <section className="profile__surface border rounded-xl p-4">
                  <h3 className="font-semibold">
                    {t(locale, "personalInformation")}
                  </h3>
                  {!canSeeProfile ? (
                    <p className="profile__muted mt-2">
                      {t(locale, "notAllowed")}
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {profile && (
                        <div
                          className="mt-3 w-12 h-12 rounded-full border profile__surface__usericon flex items-center justify-center font-semibold text-sm"
                          style={getProfileIconStyle(
                            profile.iconColor ?? "amber",
                          )}
                        >
                          {getProfileInitials(
                            profile.firstName,
                            profile.lastName,
                          )}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium mt-4">
                          {t(locale, "email")}
                        </div>
                        <div className="profile__muted">{profile.email}</div>
                      </div>
                      {profile.bio?.trim() && (
                        <div>
                          <div className="text-sm font-medium mt-4">
                            {t(locale, "biography")}
                          </div>
                          <div className="profile__muted whitespace-pre-wrap">
                            {profile.bio}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="profile__surface border rounded-xl p-4">
                  <h3 className="font-semibold">
                    {t(locale, "collectionStatsAndFavorites")}
                  </h3>
                  <div
                    className={`mt-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none ${isStatsDragging ? "cursor-grabbing" : "cursor-grab"} [&_*]:cursor-inherit`}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    ref={statsScrollRef}
                    onPointerDown={onStatsPointerDown}
                    onPointerMove={onStatsPointerMove}
                    onPointerUp={endStatsDrag}
                    onPointerCancel={endStatsDrag}
                  >
                    <div className="flex flex-nowrap gap-3 min-w-max">
                      <div className="mt-5 flex flex-wrap gap-3">
                        <div className="profile__surface flex items-center gap-4 border rounded-xl p-3 min-w-[180px]">
                          <div className="profile__surface__icon__collection p-2 rounded-full">
                            <Disc size={16} />
                          </div>
                          <div>
                            <div className="text-sm profile__muted">
                              {t(locale, "albumsInCollection")}
                            </div>
                            <div className="text-xl font-semibold mt-1">
                              {collectionAlbums.length}
                            </div>
                          </div>
                        </div>

                        {startedYear ? (
                          <div className="profile__surface flex items-center gap-4 border rounded-xl p-3 min-w-[180px]">
                            <div className="profile__surface__icon__years p-2 rounded-full">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <div className="text-sm profile__muted">
                                {t(locale, "yearsCollecting")}
                              </div>
                              <div className="text-xl font-semibold mt-1">
                                {yearsCollecting}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="profile__surface flex items-center gap-4 border rounded-xl p-3 min-w-[180px]">
                          <div className="profile__surface__icon__genres p-2 rounded-full">
                            <Music size={16} />
                          </div>
                          <div>
                            <div className="text-sm profile__muted">
                              {t(locale, "uniqueGenres")}
                            </div>
                            <div className="text-xl font-semibold mt-1">
                              {uniqueGenres.length}
                            </div>
                          </div>
                        </div>

                        {topArtist ? (
                          <div className="profile__surface flex items-center gap-4 border rounded-xl p-3 min-w-[220px]">
                            <div className="profile__surface__icon__artist p-2 rounded-full">
                              <MicVocal size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm profile__muted">
                                {t(locale, "topArtist")}
                              </div>
                              <div className="text-lg font-semibold mt-1 truncate">
                                {topArtist.name}
                                <span className="text-sm font-semibold ml-2">
                                  ({topArtist.count})
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {favoriteAlbum ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">
                        {t(locale, "favoriteAlbum")}
                      </div>
                      <div className="mt-2 grid grid-cols-[60px_1fr] gap-3 items-center">
                        <div className="w-[60px] h-[60px] rounded-lg overflow-hidden profile__surface border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              favoriteAlbum.cover_image || "/placeholder.png"
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {favoriteAlbum.title}
                          </div>
                          <div className="truncate profile__muted">
                            {favoriteAlbum.primaryArtist ??
                              favoriteAlbum.artist ??
                              ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {favoriteGenres.length > 0 ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">
                        {t(locale, "favoriteGenres")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {favoriteGenres.map((g) => (
                          <span
                            key={g}
                            className="profile__tag profile__tag--favorite px-3 py-1 rounded-[15px] text-sm"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {canSeeCollection && sharedAlbums.length > 0 && (
                    <div className="mt-8">
                      <div className="text-sm font-medium">
                        {t(locale, "albumsInCommon")}
                      </div>
                      <p className="profile__muted text-sm mt-1">
                        {t(locale, "albumsInCommonCount", sharedAlbums.length)}
                      </p>
                      <div className="mt-2 max-h-72 overflow-y-auto pr-1">
                        <div
                          className="grid gap-2 justify-start"
                          style={{
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(120px, 1fr))",
                          }}
                        >
                          {sharedAlbums.map((album) => (
                            <button
                              key={album.id}
                              type="button"
                              className="profile__surface border rounded-lg p-2 text-left cursor-pointer"
                              onClick={() =>
                                void openAlbumDetails("Collection", album.id)
                              }
                            >
                              <div className="w-full aspect-square rounded overflow-hidden border profile__surface">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={album.cover_image || "/placeholder.png"}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-1 text-xs font-semibold truncate">
                                {album.title}
                              </div>
                              <div className="text-[11px] profile__muted truncate">
                                {album.primaryArtist ?? album.artist ?? ""}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {viewMode === "collection" && (
              <div className="mt-5">
                {collectionAlbums.length === 0 && (
                  <p className="profile__muted">
                    {t(locale, "noAlbumsInTheirCollection")}
                  </p>
                )}
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] friend-profile-compact-cards">
                  {collectionAlbums.map((album) => {
                    const artist = album.primaryArtist ?? album.artist ?? "";
                    const discogsRelease = {
                      id: album.id,
                      title: album.title,
                      artist,
                      primaryArtist: album.primaryArtist,
                      cover_image: album.cover_image ?? "",
                      genre: Array.isArray(album.genre)
                        ? album.genre
                        : undefined,
                      year:
                        typeof album.year === "number" ? album.year : undefined,
                    };

                    return (
                      <div
                        key={album.id}
                        className="flex-shrink-0 flex-grow basis-[140px] max-w-[200px]"
                      >
                        <AlbumCard
                          album={discogsRelease}
                          artist={artist}
                          title={album.title}
                          mainGenre={
                            Array.isArray(album.genre)
                              ? album.genre[0]
                              : undefined
                          }
                          interactive
                          onCardClick={() =>
                            openAlbumDetails("Collection", album.id)
                          }
                          buttons={{}}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "wishlist" && (
              <div className="mt-5">
                {wishlistAlbums.length === 0 && (
                  <p className="profile__muted">
                    {t(locale, "noAlbumsInTheirWishlist")}
                  </p>
                )}
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] friend-profile-compact-cards">
                  {wishlistAlbums.map((album) => {
                    const artist = album.primaryArtist ?? album.artist ?? "";
                    const discogsRelease = {
                      id: album.id,
                      title: album.title,
                      artist,
                      primaryArtist: album.primaryArtist,
                      cover_image: album.cover_image ?? "",
                      genre: Array.isArray(album.genre)
                        ? album.genre
                        : undefined,
                      year:
                        typeof album.year === "number" ? album.year : undefined,
                    };

                    return (
                      <div
                        key={album.id}
                        className="flex-shrink-0 flex-grow basis-[140px] max-w-[140px]"
                      >
                        <AlbumCard
                          album={discogsRelease}
                          artist={artist}
                          title={album.title}
                          mainGenre={
                            Array.isArray(album.genre)
                              ? album.genre[0]
                              : undefined
                          }
                          interactive
                          onCardClick={() =>
                            openAlbumDetails("Wishlist", album.id)
                          }
                          buttons={{}}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AlbumDetailsModal
        open={detailsOpen}
        album={detailsAlbum}
        artist={detailsArtist}
        displayTitle={detailsTitle}
        detailsOverride={detailsOverride}
        sharedCollectionLabel={
          detailsInViewerCollection ? t(locale, "inBothCollections") : null
        }
        hideActions
        onClose={() => {
          setDetailsOpen(false);
          setDetailsAlbum(null);
          setDetailsOverride(null);
          setDetailsInViewerCollection(false);
        }}
      />
    </div>,
    document.body,
  );
}

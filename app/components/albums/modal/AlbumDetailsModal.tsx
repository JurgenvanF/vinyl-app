"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Heart,
  HeartOff,
} from "lucide-react";
import {
  DiscogsTrack,
  DiscogsReleaseDetails,
  fetchDiscogsReleaseDetails,
} from "../../../../lib/discogsRelease";
import { auth, db } from "../../../../lib/firebase";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { deriveArtists, derivePrimaryArtist } from "../../../../lib/artist";
import { fetchDiscogsArtists } from "../../../../lib/discogsArtists";
import {
  ensureSharedAlbumDetails,
  getSharedAlbumDetails,
} from "../../../../lib/sharedAlbumDetails";
import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";
import {
  getFlagEmoji,
  getLocalizedCountryName,
} from "../../../../lib/countryFlags";
import CollectionButton from "../card/buttons/CollectionButton";
import WishlistButton from "../card/buttons/WishlistButton";
import ToCollectionButton from "../card/buttons/ToCollectionButton";
import MessageModal from "../../modal/MessageModal";
import VinylSpinner from "../../spinner/VinylSpinner";
import "./AlbumDetailsModal.scss";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  artists?: Array<string | { name?: string }>;
  cover_image: string;
  master_id?: number;
  type?: string;
  format?: string[];
  genre?: string[];
  year?: number;
  catno?: string;
  have?: number;
  want?: number;
  detailsRef?: string | null;
};

type AlbumDetailsModalProps = {
  open: boolean;
  album: DiscogsRelease | null;
  artist?: string;
  displayTitle?: string;
  onClose: () => void;
};

export default function AlbumDetailsModal({
  open,
  album,
  artist,
  displayTitle,
  onClose,
}: AlbumDetailsModalProps) {
  const EXPANDBOX_PREVIEW_HEIGHT = 220;
  const { locale } = useLanguage();
  const [details, setDetails] = useState<DiscogsReleaseDetails | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [extraArtistsExpanded, setExtraArtistsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [albumState, setAlbumState] = useState<
    "none" | "collection" | "wishlist"
  >("none");
  const [removeCollectionOpen, setRemoveCollectionOpen] = useState(false);
  const [removeWishlistOpen, setRemoveWishlistOpen] = useState(false);
  const [moveToCollectionOpen, setMoveToCollectionOpen] = useState(false);
  const [wishlistRemoveHover, setWishlistRemoveHover] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [albumStateLoading, setAlbumStateLoading] = useState(false);
  const swipeStartXRef = useRef<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const extraArtistsBoxRef = useRef<HTMLDivElement | null>(null);
  const notesBoxRef = useRef<HTMLDivElement | null>(null);
  const [extraArtistsOverflow, setExtraArtistsOverflow] = useState(false);
  const [notesOverflow, setNotesOverflow] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbDragRef = useRef<{
    dragging: boolean;
    startX: number;
    startScrollLeft: number;
  }>({ dragging: false, startX: 0, startScrollLeft: 0 });

  useEffect(() => {
    if (!open || !album) return;

    let active = true;
    setDetailsLoading(true);

    const loadDetails = async () => {
      try {
        let releaseDetails: DiscogsReleaseDetails | null = null;

        if (album.detailsRef) {
          releaseDetails = await getSharedAlbumDetails(album.detailsRef);
        }

        if (!releaseDetails) {
          releaseDetails = await fetchDiscogsReleaseDetails({
            id: album.id,
            masterId: album.master_id,
            resultType:
              album.type ||
              (album.master_id && album.master_id === album.id
                ? "master"
                : null),
          });
        }

        if (!active) return;
        setDetails(releaseDetails);
        setImageIndex(0);
        setExtraArtistsExpanded(false);
        setNotesExpanded(false);
      } finally {
        if (active) setDetailsLoading(false);
      }
    };

    void loadDetails();

    return () => {
      active = false;
    };
  }, [open, album]);

  useEffect(() => {
    if (!open || !album) return;
    const user = auth.currentUser;
    if (!user) {
      setAlbumStateLoading(false);
      return;
    }

    let active = true;
    setAlbumStateLoading(true);

    const loadAlbumState = async () => {
      const collectionRef = doc(
        db,
        "users",
        user.uid,
        "Collection",
        album.id.toString(),
      );
      const wishlistRef = doc(
        db,
        "users",
        user.uid,
        "Wishlist",
        album.id.toString(),
      );
      const [collectionSnap, wishlistSnap] = await Promise.all([
        getDoc(collectionRef),
        getDoc(wishlistRef),
      ]);

      if (!active) return;
      if (collectionSnap.exists()) {
        setAlbumState("collection");
        setAlbumStateLoading(false);
        return;
      }
      if (wishlistSnap.exists()) {
        setAlbumState("wishlist");
        setAlbumStateLoading(false);
        return;
      }
      setAlbumState("none");
      setAlbumStateLoading(false);
    };

    void loadAlbumState();

    return () => {
      active = false;
    };
  }, [open, album]);

  useEffect(() => {
    document.body.classList.toggle("album-details-modal-open", open);

    return () => {
      document.body.classList.remove("album-details-modal-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const extraOverflow =
        (extraArtistsBoxRef.current?.scrollHeight ?? 0) >
        EXPANDBOX_PREVIEW_HEIGHT + 1;
      const noteOverflow =
        (notesBoxRef.current?.scrollHeight ?? 0) > EXPANDBOX_PREVIEW_HEIGHT + 1;

      setExtraArtistsOverflow(extraOverflow);
      setNotesOverflow(noteOverflow);

      if (!extraOverflow) setExtraArtistsExpanded(false);
      if (!noteOverflow) setNotesExpanded(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [open, details]);

  if (!open || !album) return null;

  const removeFromCollection = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(
      doc(db, "users", user.uid, "Collection", album.id.toString()),
    );
    setAlbumState("none");
    setRemoveCollectionOpen(false);
  };

  const removeFromWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(
      doc(db, "users", user.uid, "Wishlist", album.id.toString()),
    );
    setAlbumState("none");
    setRemoveWishlistOpen(false);
  };

  const moveToCollection = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const splitDiscogsTitle = (fullTitle: string, rawArtist?: string) => {
      if (rawArtist) return { artist: rawArtist, title: fullTitle };
      const [maybeArtist, ...titleParts] = fullTitle.split(" - ");
      const albumTitle = titleParts.join(" - ").trim() || fullTitle;
      const albumArtist = maybeArtist?.trim() || "Unknown";
      return { artist: albumArtist, title: albumTitle };
    };

    const { artist: albumArtist, title: albumTitle } = splitDiscogsTitle(
      album.title,
      album.artist,
    );
    const wishlistDocRef = doc(
      db,
      "users",
      user.uid,
      "Wishlist",
      album.id.toString(),
    );
    const wishlistDocSnap = await getDoc(wishlistDocRef);
    const existingDetailsRef =
      typeof wishlistDocSnap.data()?.detailsRef === "string"
        ? wishlistDocSnap.data()?.detailsRef
        : album.detailsRef || undefined;
    await deleteDoc(wishlistDocRef);

    const discogsArtistResult = await fetchDiscogsArtists({
      id: album.id,
      masterId: album.master_id,
    });
    const artists =
      discogsArtistResult.length > 0
        ? discogsArtistResult
        : deriveArtists(albumArtist, album.artists);
    const primaryArtist = derivePrimaryArtist(undefined, artists, albumArtist);
    const { detailsRef } = await ensureSharedAlbumDetails({
      id: album.id,
      masterId: album.master_id,
      resultType: album.type,
      detailsRef: existingDetailsRef,
    });

    await setDoc(
      doc(db, "users", user.uid, "Collection", album.id.toString()),
      {
        id: album.id,
        title: albumTitle,
        artist: albumArtist,
        artists,
        primaryArtist,
        cover_image: album.cover_image,
        releaseType: album.type || null,
        genre: album.genre || [],
        year: album.year || null,
        catno: album.catno || null,
        master_id: album.master_id || null,
        detailsRef,
        addedAt: serverTimestamp(),
      },
    );

    setAlbumState("collection");
    setMoveToCollectionOpen(false);
  };

  const images = details?.images?.map((img) => img.uri) || [album.cover_image];
  const toTitleCase = (value: string) =>
    value.replace(/\w\S*/g, (word) => {
      const first = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return `${first}${rest}`;
    });
  const formatReleasedDate = (value?: string) => {
    if (!value) return "";

    const trimmed = value.trim();
    if (!trimmed) return "";

    const localeTag = locale === "nl" ? "nl-NL" : "en-US";
    const capitalizeIfDutch = (label: string) =>
      locale === "nl" && label.length > 0
        ? `${label.charAt(0).toUpperCase()}${label.slice(1)}`
        : label;
    const asIsoFull = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (asIsoFull) {
      const [, yearRaw, monthRaw, dayRaw] = asIsoFull;
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      const day = Number(dayRaw);

      if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Intl.DateTimeFormat(localeTag, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, day));
      }
      if (year > 0 && month >= 1 && month <= 12) {
        return capitalizeIfDutch(
          new Intl.DateTimeFormat(localeTag, {
            month: "long",
            year: "numeric",
          }).format(new Date(year, month - 1, 1)),
        );
      }
      if (year > 0) return String(year);
      return trimmed;
    }

    const asIsoMonth = trimmed.match(/^(\d{4})-(\d{2})$/);
    if (asIsoMonth) {
      const [, yearRaw, monthRaw] = asIsoMonth;
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      if (year > 0 && month >= 1 && month <= 12) {
        return capitalizeIfDutch(
          new Intl.DateTimeFormat(localeTag, {
            month: "long",
            year: "numeric",
          }).format(new Date(year, month - 1, 1)),
        );
      }
      if (year > 0) return String(year);
      return trimmed;
    }

    const asLegacyFull = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (asLegacyFull) {
      const [, dayRaw, monthRaw, yearRaw] = asLegacyFull;
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      const day = Number(dayRaw);

      if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Intl.DateTimeFormat(localeTag, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, day));
      }
      if (year > 0 && month >= 1 && month <= 12) {
        return capitalizeIfDutch(
          new Intl.DateTimeFormat(localeTag, {
            month: "long",
            year: "numeric",
          }).format(new Date(year, month - 1, 1)),
        );
      }
      if (year > 0) return String(year);
      return trimmed;
    }

    const asLegacyMonth = trimmed.match(/^(\d{2})-(\d{4})$/);
    if (asLegacyMonth) {
      const [, monthRaw, yearRaw] = asLegacyMonth;
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      if (year > 0 && month >= 1 && month <= 12) {
        return capitalizeIfDutch(
          new Intl.DateTimeFormat(localeTag, {
            month: "long",
            year: "numeric",
          }).format(new Date(year, month - 1, 1)),
        );
      }
      if (year > 0) return String(year);
      return trimmed;
    }

    const asYearOnly = trimmed.match(/^(\d{4})$/);
    if (asYearOnly) return asYearOnly[1];

    return trimmed;
  };

  const nextImage = () => setImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const onMainPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    swipeStartXRef.current = event.clientX;
  };

  const onMainPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (images.length <= 1 || swipeStartXRef.current === null) return;
    const delta = event.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;

    if (Math.abs(delta) < 40) return;
    if (delta < 0) nextImage();
    if (delta > 0) prevImage();
  };

  const onThumbMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!thumbStripRef.current) return;
    thumbDragRef.current = {
      dragging: true,
      startX: event.clientX,
      startScrollLeft: thumbStripRef.current.scrollLeft,
    };
  };

  const onThumbMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!thumbStripRef.current || !thumbDragRef.current.dragging) return;
    const delta = event.clientX - thumbDragRef.current.startX;
    thumbStripRef.current.scrollLeft =
      thumbDragRef.current.startScrollLeft - delta;
  };

  const stopThumbDrag = () => {
    thumbDragRef.current.dragging = false;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return t(locale, "unknownValue");

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              rating >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-500"
            }
          />
        ))}
        <span className="ml-2 text-xs opacity-70">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const parseDurationSeconds = (value?: string) => {
    if (!value) return 0;
    const normalized = value.trim().replace(/\./g, ":").replace(/\s+/g, "");
    const parts = normalized.split(":").map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const getTrackDurationLabel = (track: DiscogsTrack) => {
    if (track.duration && track.duration.trim()) return track.duration.trim();
    const seconds = parseDurationSeconds(track.duration);
    return seconds > 0 ? formatSeconds(seconds) : null;
  };

  const formatSeconds = (seconds: number) => {
    if (seconds <= 0) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        remainSeconds,
      ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
  };

  const getTrackSide = (position?: string) => {
    if (!position) return "";
    const match = position.trim().match(/^[A-Z]/i);
    return match ? match[0].toUpperCase() : "";
  };

  const sideOrder = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const isVinylRelease =
    details?.format?.some((format) => /vinyl|lp|12"|10"|7"/i.test(format)) ??
    false;
  const sideGroups =
    details?.tracklist?.reduce(
      (acc, track) => {
        const side = isVinylRelease
          ? getTrackSide(track.position) || "Other"
          : "All";
        if (!acc[side]) acc[side] = [];
        acc[side].push(track);
        return acc;
      },
      {} as Record<string, DiscogsTrack[]>,
    ) || {};

  const orderedSides = Object.keys(sideGroups).sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return sideOrder.indexOf(a) - sideOrder.indexOf(b);
  });

  const totalSongs = details?.tracklist?.length ?? 0;
  const totalDurationSeconds =
    details?.tracklist?.reduce(
      (total, track) => total + parseDurationSeconds(track.duration),
      0,
    ) ?? 0;

  const sidedLetters = orderedSides.filter(
    (side) => side !== "Other" && side !== "All",
  );
  const estimatedRecordsFromSides = sidedLetters.reduce((maxRecord, side) => {
    const index = sideOrder.indexOf(side);
    if (index < 0) return maxRecord;
    const recordNumber = Math.floor(index / 2) + 1;
    return Math.max(maxRecord, recordNumber);
  }, 0);
  const estimatedRecords = isVinylRelease
    ? estimatedRecordsFromSides > 0
      ? estimatedRecordsFromSides
      : details?.qty || 0 || 1
    : 0;

  const metaRows: Array<{ label: string; value: string | number }> = [];
  const releasedLabel = formatReleasedDate(details?.released);
  if (releasedLabel)
    metaRows.push({
      label: t(locale, "albumDetailsReleased"),
      value: releasedLabel,
    });
  if (details?.country) {
    const countryName = getLocalizedCountryName(details.country, locale);
    metaRows.push({
      label: t(locale, "albumDetailsCountry"),
      value: `${getFlagEmoji(details.country)} ${countryName}`.trim(),
    });
  }
  if (album.catno)
    metaRows.push({
      label: t(locale, "albumDetailsCatalog"),
      value: album.catno,
    });
  if (typeof album.have === "number")
    metaRows.push({ label: t(locale, "albumDetailsHave"), value: album.have });
  if (typeof album.want === "number")
    metaRows.push({ label: t(locale, "albumDetailsWant"), value: album.want });
  if (details?.series)
    metaRows.push({
      label: t(locale, "albumDetailsSeries"),
      value: details.series,
    });
  if (totalSongs > 0)
    metaRows.push({ label: t(locale, "albumDetailsSongs"), value: totalSongs });
  if (totalDurationSeconds > 0) {
    metaRows.push({
      label: t(locale, "albumDetailsTotalDuration"),
      value: formatSeconds(totalDurationSeconds),
    });
  }
  if (isVinylRelease && estimatedRecords > 0) {
    metaRows.push({
      label: t(locale, "albumDetailsVinylRecords"),
      value: estimatedRecords,
    });
  }
  const isLoading = detailsLoading || albumStateLoading;

  return (
    <div
      className="album-details-modal-overlay fixed inset-0 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="album-details-modal-panel rounded-2xl shadow-2xl p-6 m-4 w-full max-w-5xl max-h-[85vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {displayTitle || album.title}
            </h2>
            <p className="album-details-modal-subtitle text-sm">
              {artist || album.artist || t(locale, "unknownArtist")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="album-details-modal-close cursor-pointer"
          >
            <X className="transition" />
          </button>
        </div>

        {isLoading ? (
          <div className="album-details-modal-loading">
            <VinylSpinner />
          </div>
        ) : (
          <>
            {/* Top Section */}
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
              {/* Image Carousel */}
              <div className="w-full md:w-[260px] md:shrink-0">
                <div className="relative group">
                  <div
                    className="touch-pan-y select-none cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                    onPointerDown={onMainPointerDown}
                    onPointerUp={onMainPointerUp}
                  >
                    <div
                      className="touch-pan-y select-none"
                      onPointerDown={onMainPointerDown}
                      onPointerUp={onMainPointerUp}
                    >
                      <img
                        src={images[imageIndex] || "/placeholder.png"}
                        alt={displayTitle || album.title}
                        className="rounded-xl w-full aspect-square object-contain shadow-lg"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {isLightboxOpen && (
                    <div
                      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                      onClick={() => setIsLightboxOpen(false)}
                    >
                      <div
                        className="relative max-w-[95vw] max-h-[95vh] overflow-auto cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={images[imageIndex] || "/placeholder.png"}
                          alt={displayTitle || album.title}
                          className="max-w-none max-h-none object-contain"
                          draggable={false}
                        />

                        <button
                          className="absolute top-4 right-4 text-white text-2xl mix-blend-difference"
                          onClick={() => setIsLightboxOpen(false)}
                        >
                          <X />
                        </button>
                      </div>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="album-details-modal-arrow absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={nextImage}
                        className="album-details-modal-arrow absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div
                    ref={thumbStripRef}
                    className="mt-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={onThumbMouseDown}
                    onMouseMove={onThumbMouseMove}
                    onMouseUp={stopThumbDrag}
                    onMouseLeave={stopThumbDrag}
                  >
                    <div className="flex gap-2 min-w-max">
                      {images.map((uri, index) => (
                        <button
                          key={`${uri}-${index}`}
                          onClick={() => setImageIndex(index)}
                          className={`w-14 h-14 rounded-md overflow-hidden border album-details-modal-thumb ${
                            index === imageIndex
                              ? "album-details-modal-thumb--active"
                              : ""
                          }`}
                          aria-label={t(
                            locale,
                            "albumDetailsImageAria",
                            index + 1,
                          )}
                        >
                          <img
                            src={uri || "/placeholder.png"}
                            alt={`Album image ${index + 1}`}
                            className="w-full h-full object-contain cursor-pointer"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-5 text-sm w-full">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {details?.genre.map((g) => (
                    <span
                      key={g}
                      className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs"
                    >
                      {g}
                    </span>
                  ))}
                  {details?.style.map((s) => (
                    <span
                      key={s}
                      className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                  {details?.format.map((f) => (
                    <span
                      key={f}
                      className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Grid info */}
                {metaRows.length > 0 && (
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                    {metaRows.map((row) => (
                      <p key={row.label}>
                        <span className="album-details-modal-muted">
                          {row.label}:
                        </span>{" "}
                        {row.value}
                      </p>
                    ))}
                  </div>
                )}

                {/* Labels */}
                {details?.labels && details.labels.length > 0 && (
                  <div>
                    <p className="album-details-modal-muted mb-1">
                      {t(locale, "albumDetailsLabels")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {details.labels.map((label, i) => (
                        <span
                          key={i}
                          className="album-details-modal-chip px-3 py-1 rounded-full text-xs"
                        >
                          {label.name} (
                          {label.catno || t(locale, "albumDetailsNoCatNo")})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                {details?.ratings &&
                  (details.ratings.average > 0 ||
                    details.ratings.count > 0) && (
                    <div>
                      <p className="album-details-modal-muted mb-1">
                        {t(locale, "albumDetailsRating")}
                      </p>
                      {renderStars(details.ratings.average)}
                      <p className="text-xs album-details-modal-muted mt-1">
                        {t(
                          locale,
                          "albumDetailsRatingsCount",
                          details.ratings.count,
                        )}
                      </p>
                    </div>
                  )}

                <div className="album-details-modal-actions">
                  {albumState === "none" && (
                    <>
                      <CollectionButton
                        album={album}
                        action="enabled"
                        onAdded={() => setAlbumState("collection")}
                      />
                      <WishlistButton
                        album={album}
                        action="enabled"
                        onAdded={() => setAlbumState("wishlist")}
                      />
                    </>
                  )}

                  {albumState === "collection" && (
                    <button
                      className="album-details-modal-action-btn album-details-modal-action-btn--danger"
                      onClick={() => setRemoveCollectionOpen(true)}
                    >
                      <Trash2 size={15} /> {t(locale, "remove")}
                    </button>
                  )}

                  {albumState === "wishlist" && (
                    <>
                      <ToCollectionButton
                        onClick={() => setMoveToCollectionOpen(true)}
                      />
                      <button
                        className="album-details-modal-action-btn album-details-modal-action-btn--danger"
                        onClick={() => setRemoveWishlistOpen(true)}
                        onMouseEnter={() => setWishlistRemoveHover(true)}
                        onMouseLeave={() => setWishlistRemoveHover(false)}
                      >
                        {wishlistRemoveHover ? (
                          <HeartOff size={15} />
                        ) : (
                          <Heart size={15} />
                        )}
                        {t(locale, "remove")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="album-details-modal-divider border-t my-8" />

            {/* Tracklist */}
            {details?.tracklist && details.tracklist.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  {t(locale, "albumDetailsTracklist")}
                </h3>
                <div className="space-y-4">
                  {orderedSides.map((side) => (
                    <div
                      key={side}
                      className="album-details-modal-side rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs uppercase tracking-wide album-details-modal-muted">
                          {side === "All"
                            ? t(locale, "albumDetailsTracks")
                            : side === "Other"
                              ? t(locale, "albumDetailsOtherTracks")
                              : t(locale, "albumDetailsSide", side)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {sideGroups[side].map((track, index) => {
                          const durationLabel = getTrackDurationLabel(track);
                          return (
                            <div
                              key={`${track.position}-${track.title}-${index}`}
                              className="album-details-modal-track-row flex justify-between px-4 py-2 rounded-lg"
                            >
                              <div>
                                <span className="album-details-modal-muted mr-2">
                                  {track.position}
                                </span>
                                {track.title}
                              </div>
                              {durationLabel && (
                                <span className="album-details-modal-muted text-xs">
                                  {durationLabel}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Artists */}
            {details?.artists && details.artists.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8 mb-2">
                  {t(locale, "albumDetailsArtists")}
                </h3>
                <div className="album-details-modal-artist-grid">
                  {details.artists.map((a, i) => (
                    <div
                      key={`${a.name}-${i}`}
                      className="album-details-modal-artist-card"
                    >
                      <p className="album-details-modal-artist-name">
                        {toTitleCase(a.name)}
                      </p>
                      <div className="album-details-modal-artist-meta">
                        {a.role && (
                          <span className="album-details-modal-artist-pill">
                            {a.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Extra Artists */}
            {details?.extraartists && details.extraartists.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  {t(locale, "albumDetailsExtraArtists")}
                </h3>
                <div
                  ref={extraArtistsBoxRef}
                  className={`album-details-modal-expandbox ${
                    extraArtistsExpanded
                      ? "album-details-modal-expandbox--expanded"
                      : ""
                  } ${
                    extraArtistsOverflow
                      ? "album-details-modal-expandbox--interactive"
                      : ""
                  }`}
                  onClick={() => setExtraArtistsExpanded((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setExtraArtistsExpanded((prev) => !prev);
                    }
                  }}
                >
                  <div className="album-details-modal-artist-grid">
                    {details.extraartists.map((a, i) => (
                      <div
                        key={`${a.name}-${a.role}-${i}`}
                        className="album-details-modal-artist-card"
                      >
                        <p className="album-details-modal-artist-name">
                          {toTitleCase(a.name)}
                        </p>
                        <div className="album-details-modal-artist-meta">
                          {a.role && (
                            <span className="album-details-modal-artist-pill">
                              {a.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Text */}
            {(details?.notes || details?.text) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">
                  {t(locale, "albumDetailsNotes")}
                </h3>
                <div
                  ref={notesBoxRef}
                  className={`album-details-modal-expandbox ${
                    notesExpanded
                      ? "album-details-modal-expandbox--expanded"
                      : ""
                  } ${
                    notesOverflow
                      ? "album-details-modal-expandbox--interactive"
                      : ""
                  }`}
                  onClick={() => setNotesExpanded((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setNotesExpanded((prev) => !prev);
                    }
                  }}
                >
                  {details.notes && (
                    <p className="text-sm album-details-modal-list whitespace-pre-line">
                      {details.notes}
                    </p>
                  )}
                  {details.text && (
                    <p className="text-sm album-details-modal-subtitle mt-4">
                      {details.text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <MessageModal
          open={removeCollectionOpen}
          title={`${t(locale, "remove")} ${album.title}?`}
          message={`${t(locale, "confirmRemoveFromCollection")}?`}
          background="red"
          color="white"
          onCancel={() => setRemoveCollectionOpen(false)}
          onConfirm={() => {
            void removeFromCollection();
          }}
        />

        <MessageModal
          open={removeWishlistOpen}
          title={`${t(locale, "remove")} ${album.title}?`}
          message={`${t(locale, "confirmRemoveFromWishlist")}?`}
          background="red"
          color="white"
          onCancel={() => setRemoveWishlistOpen(false)}
          onConfirm={() => {
            void removeFromWishlist();
          }}
        />

        <MessageModal
          open={moveToCollectionOpen}
          title={`${t(locale, "moveToCollection", album.title)}?`}
          message={`${t(locale, "moveToCollectionMessage")}?`}
          onCancel={() => setMoveToCollectionOpen(false)}
          onConfirm={() => {
            void moveToCollection();
          }}
        />
      </div>
    </div>
  );
}

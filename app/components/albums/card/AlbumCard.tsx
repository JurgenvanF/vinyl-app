"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import { useThemePlaceholder } from "../../../../lib/useThemePlaceholder";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";

import { Loader2, Plus } from "lucide-react";
import { deriveArtists, derivePrimaryArtist } from "../../../../lib/artist";
import { fetchDiscogsArtists } from "../../../../lib/discogsArtists";
import {
  decrementAlbumDetailsRefCountAndCleanup,
  ensureSharedAlbumDetails,
  incrementAlbumDetailsRefCount,
} from "../../../../lib/sharedAlbumDetails";

import CollectionButton from "./buttons/CollectionButton";
import WishlistButton from "./buttons/WishlistButton";
import RemoveCollectionButton from "./buttons/RemoveCollectionButton";
import RemoveWishlistButton from "./buttons/RemoveWishlistButton";
import ToCollectionButton from "./buttons/ToCollectionButton";
import ViewDetailsButton from "./buttons/ViewDetailsButton";
import ConfirmModal from "../../modal/MessageModal";

import "./AlbumCard.scss";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  artists?: Array<string | { name?: string }>;
  primaryArtist?: string;
  cover_image: string;
  type?: string;
  genre?: string[];
  year?: number;
  catno?: string;
  master_id?: number;
  have?: number;
  want?: number;
  format?: string[];
  source?: string;
  cloudinaryPublicIds?: string[];
};

type AlbumCardProps = {
  album: DiscogsRelease;
  mainGenre?: string;
  releaseType?: string;
  artist?: string;
  title?: string;
  interactive?: boolean;
  onCardClick?: () => void;
  collectionAction?: "enabled" | "disabled";
  wishlistAction?: "enabled" | "disabled";
  onAddedToCollection?: (albumId: string) => void;
  onAddedToWishlist?: (albumId: string) => void;
  buttons?: {
    collection?: boolean;
    wishlist?: boolean;
    removeCollection?: boolean;
    removeWishlist?: boolean;
    toCollection?: boolean;
    viewDetails?: boolean;
  };
};

export default function AlbumCard({
  album,
  mainGenre,
  releaseType,
  artist,
  title,
  interactive = true,
  onCardClick,
  collectionAction = "enabled",
  wishlistAction = "enabled",
  onAddedToCollection,
  onAddedToWishlist,
  buttons,
}: AlbumCardProps) {
  const { locale } = useLanguage();
  const placeholderSrc = useThemePlaceholder();
  const isClickable = interactive && typeof onCardClick === "function";

  const [isInCollection, setIsInCollection] = useState(
    collectionAction === "disabled",
  );
  const [isInWishlist, setIsInWishlist] = useState(
    wishlistAction === "disabled",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAlbum, setPendingAlbum] = useState<DiscogsRelease | null>(null);
  const [actionsLoading, setActionsLoading] = useState(false);

  useEffect(() => {
    setIsInCollection(collectionAction === "disabled");
  }, [collectionAction]);

  useEffect(() => {
    setIsInWishlist(wishlistAction === "disabled");
  }, [wishlistAction]);

  const reserveActionSpace = Boolean(buttons?.collection) && Boolean(buttons?.wishlist);

  return (
    <div
      className={`album-card flex flex-col items-center gap-2 border rounded-xl shadow-sm transition-all duration-300 max-w-[200px] overflow-hidden ${
        interactive ? "group hover:shadow-lg" : ""
      } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
      onClick={isClickable ? onCardClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onCardClick();
              }
            }
          : undefined
      }
    >
      {/* Album Image */}
      <div className="album-card__image w-10/12 aspect-square rounded-xl overflow-hidden mt-4 relative">
        <img
          src={album.cover_image || placeholderSrc}
          alt=""
          className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ${
            interactive ? "group-hover:scale-105" : ""
          }`}
        />
      </div>

      {/* Album Details */}
      <div className="album-card__details w-full px-3 pb-4 flex flex-col gap-1">
        {releaseType && (
          <p className="text-xs text-orange-400 uppercase tracking-wide">
            {releaseType}
          </p>
        )}

        <p className="text-sm font-semibold line-clamp-1">{artist}</p>
        <p className="text-sm line-clamp-1">{title}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2 items-center text-xs">
          {mainGenre && (
            <span className="bg-orange-500/20 px-2 py-0.5 rounded-full">
              {mainGenre}
            </span>
          )}

          {Array.from(new Set(album.format ?? []))
            .slice(0, 5)
            .map((f, idx) => (
              <span
                key={`${f}-${idx}`}
                className="bg-green-500/20 px-2 py-0.5 rounded-full"
              >
                {f}
              </span>
            ))}
        </div>

        {/* Year */}
        {album.year && (
          <div className="mt-1 text-xs opacity-60">{album.year}</div>
        )}

        {/* Catalog number */}
        {album.catno && album.catno.toLowerCase() !== "none" && (
          <p className="text-xs mt-1">{album.catno}</p>
        )}
      </div>

      {/* Buttons */}
      <div
        className={`buttons w-10/12 flex flex-col mt-auto mb-4 gap-2 transition duration-200 relative ${
          reserveActionSpace ? "min-h-[76px]" : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <ConfirmModal
          open={modalOpen}
          title={`${t(locale, "moveToCollection", pendingAlbum?.title || album.title)}?`}
          message={`${t(locale, "moveToCollectionMessage")}?`}
          onCancel={() => setModalOpen(false)}
          onConfirm={async () => {
            if (!pendingAlbum) return;
            const user = auth.currentUser;
            if (!user) return;

            if (pendingAlbum.source === "custom") {
              const wishlistRef = doc(
                db,
                "users",
                user.uid,
                "Wishlist",
                pendingAlbum.id.toString(),
              );
              const wishlistSnap = await getDoc(wishlistRef);
              const wishlistData = wishlistSnap.data();
              const detailsSnap = await getDoc(doc(wishlistRef, "details", "details"));
              const albumSnap = await getDoc(doc(wishlistRef, "album", "album"));

              await setDoc(
                doc(db, "users", user.uid, "Collection", pendingAlbum.id.toString()),
                { ...(wishlistData ?? {}), addedAt: serverTimestamp() },
              );
              await setDoc(
                doc(
                  db,
                  "users",
                  user.uid,
                  "Collection",
                  pendingAlbum.id.toString(),
                  "details",
                  "details",
                ),
                detailsSnap.data() ?? {},
                { merge: true },
              );
              await setDoc(
                doc(
                  db,
                  "users",
                  user.uid,
                  "Collection",
                  pendingAlbum.id.toString(),
                  "album",
                  "album",
                ),
                albumSnap.data() ?? {},
                { merge: true },
              );

              await deleteDoc(doc(wishlistRef, "details", "details")).catch(
                () => undefined,
              );
              await deleteDoc(doc(wishlistRef, "album", "album")).catch(
                () => undefined,
              );
              await deleteDoc(wishlistRef).catch(() => undefined);

              setModalOpen(false);
              setIsInCollection(true);
              setIsInWishlist(false);

              (
                window as Window & {
                  addToast?: (payload: {
                    message: string;
                    icon: typeof Plus;
                    bgColor: string;
                    textColor: string;
                    iconBgColor: string;
                    iconBorderColor: string;
                  }) => void;
                }
              ).addToast?.({
                message: `${pendingAlbum.title} ${t(locale, "movedToCollection")}!`,
                icon: Plus,
                bgColor: "bg-green-100",
                textColor: "text-green-900",
                iconBgColor: "bg-green-200",
                iconBorderColor: "border-green-400",
              });

              if (onAddedToCollection)
                onAddedToCollection(pendingAlbum.id.toString());
              return;
            }

            const wishlistDocRef = doc(
              db,
              "users",
              user.uid,
              "Wishlist",
              pendingAlbum.id.toString(),
            );
            const wishlistDocSnap = await getDoc(wishlistDocRef);
            const existingDetailsRef =
              typeof wishlistDocSnap.data()?.detailsRef === "string"
                ? wishlistDocSnap.data()?.detailsRef
                : undefined;

            await deleteDoc(wishlistDocRef);
            if (existingDetailsRef) {
              await decrementAlbumDetailsRefCountAndCleanup(existingDetailsRef);
            }

            const discogsArtistResult = await fetchDiscogsArtists({
              id: pendingAlbum.id,
              masterId: pendingAlbum.master_id,
            });
            const artists = deriveArtists(
              pendingAlbum.artist,
              discogsArtistResult.length > 0
                ? discogsArtistResult
                : pendingAlbum.artists,
            );
            const primaryArtist = derivePrimaryArtist(
              pendingAlbum.primaryArtist,
              artists,
              pendingAlbum.artist,
            );
            const { detailsRef } = await ensureSharedAlbumDetails({
              id: pendingAlbum.id,
              masterId: pendingAlbum.master_id,
              resultType: pendingAlbum.type,
              detailsRef: existingDetailsRef,
            });
            await incrementAlbumDetailsRefCount(detailsRef);
            await setDoc(
              doc(
                db,
                "users",
                user.uid,
                "Collection",
                pendingAlbum.id.toString(),
              ),
              {
                ...pendingAlbum,
                artists,
                primaryArtist,
                detailsRef,
                addedAt: serverTimestamp(),
              },
            );

            setModalOpen(false);
            setIsInCollection(true);
            setIsInWishlist(false);

            (
              window as Window & {
                addToast?: (payload: {
                  message: string;
                  icon: typeof Plus;
                  bgColor: string;
                  textColor: string;
                  iconBgColor: string;
                  iconBorderColor: string;
                }) => void;
              }
            ).addToast?.({
              message: `${pendingAlbum.title} ${t(locale, "movedToCollection")}!`,
              icon: Plus,
              bgColor: "bg-green-100",
              textColor: "text-green-900",
              iconBgColor: "bg-green-200",
              iconBorderColor: "border-green-400",
            });

            if (onAddedToCollection)
              onAddedToCollection(pendingAlbum.id.toString());
          }}
        />

        <div
          className={`flex flex-col gap-2 ${actionsLoading ? "invisible" : ""}`}
        >
          {buttons?.collection && (
            <CollectionButton
              album={album}
              releaseType={releaseType}
              action={isInCollection ? "disabled" : "enabled"}
              onAdded={(albumId) => {
                setIsInCollection(true);
                setIsInWishlist(false);
                onAddedToCollection?.(albumId);
              }}
              onConflict={() => {
                if (isInWishlist) {
                  setPendingAlbum(album);
                  setModalOpen(true);
                }
              }}
              onLoadingChange={setActionsLoading}
            />
          )}

          {buttons?.wishlist && !isInCollection && (
            <WishlistButton
              album={album}
              releaseType={releaseType}
              action={isInWishlist ? "disabled" : "enabled"}
              onAdded={(albumId) => {
                setIsInWishlist(true);
                setIsInCollection(false);
                onAddedToWishlist?.(albumId);
              }}
              onLoadingChange={setActionsLoading}
            />
          )}

          {buttons?.toCollection && (
            <ToCollectionButton
              onClick={() => {
                setPendingAlbum(album);
                setModalOpen(true);
              }}
            />
          )}
          {buttons?.viewDetails && <ViewDetailsButton />}
          {buttons?.removeCollection && <RemoveCollectionButton album={album} />}
          {buttons?.removeWishlist && <RemoveWishlistButton album={album} />}
        </div>

        {actionsLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin opacity-70" />
          </div>
        )}
      </div>
    </div>
  );
}

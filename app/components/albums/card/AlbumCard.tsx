"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";

import { Plus } from "lucide-react";
import { deriveArtists, derivePrimaryArtist } from "../../../../lib/artist";
import { fetchDiscogsArtists } from "../../../../lib/discogsArtists";
import { ensureSharedAlbumDetails } from "../../../../lib/sharedAlbumDetails";

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
};

type AlbumCardProps = {
  album: DiscogsRelease;
  mainGenre?: string;
  releaseType?: string;
  artist?: string;
  title?: string;
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
  onCardClick,
  collectionAction = "enabled",
  wishlistAction = "enabled",
  onAddedToCollection,
  onAddedToWishlist,
  buttons,
}: AlbumCardProps) {
  const { locale } = useLanguage();

  const [isInCollection, setIsInCollection] = useState(
    collectionAction === "disabled",
  );
  const [isInWishlist, setIsInWishlist] = useState(
    wishlistAction === "disabled",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAlbum, setPendingAlbum] = useState<DiscogsRelease | null>(null);

  useEffect(() => {
    setIsInCollection(collectionAction === "disabled");
  }, [collectionAction]);

  useEffect(() => {
    setIsInWishlist(wishlistAction === "disabled");
  }, [wishlistAction]);

  return (
    <div
      className="album-card group flex flex-col items-center gap-2 border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 max-w-[200px] cursor-pointer overflow-hidden"
      onClick={onCardClick}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={
        onCardClick
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
          src={album.cover_image || "/placeholder.png"}
          alt={title}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
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

        {/* Tags & Year */}
        <div className="flex flex-wrap gap-1 mt-2 items-center text-xs">
          {mainGenre && (
            <span className="bg-orange-500/20 px-2 py-0.5 rounded-full">
              {mainGenre}
            </span>
          )}
          {album.format?.map((f, idx) => (
            <span
              key={`${f}-${idx}`}
              className="bg-green-500/20 px-2 py-0.5 rounded-full"
            >
              {f}
            </span>
          ))}
          {album.year && <span className="opacity-60">{album.year}</span>}
        </div>

        {/* Catalog number */}
        {album.catno && album.catno.toLowerCase() !== "none" && (
          <p className="text-xs mt-1">{album.catno}</p>
        )}
      </div>

      {/* Buttons */}
      <div
        className="buttons w-10/12 flex flex-col mt-auto mb-4 gap-2 transition duration-200"
        onClick={(event) => event.stopPropagation()}
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
          />
        )}

        <ConfirmModal
          open={modalOpen}
          title={`${t(locale, "moveToCollection", pendingAlbum?.title || album.title)}?`}
          message={`${t(locale, "moveToCollectionMessage")}?`}
          onCancel={() => setModalOpen(false)}
          onConfirm={async () => {
            if (!pendingAlbum) return;
            const user = auth.currentUser;
            if (!user) return;

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
    </div>
  );
}

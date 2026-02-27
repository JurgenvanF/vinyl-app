"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";

import { Plus } from "lucide-react";
import { deriveArtists, derivePrimaryArtist } from "../../../../lib/artist";
import { fetchDiscogsArtists } from "../../../../lib/discogsArtists";

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
    <div className="album-card flex flex-col items-center gap-2 border rounded group max-w-[200px]">
      <div className="album-card__image w-9/10 aspect-square rounded mt-2 overflow-hidden">
        <img
          src={album.cover_image || "/placeholder.png"}
          alt={title}
          className="object-cover rounded group-hover:scale-110 transition"
        />
      </div>

      <div className="album-card__details w-full px-2 pb-4">
        {releaseType && <p className="text-xs text-gray-500">{releaseType}</p>}
        <p className="text-sm font-semibold mt-1">{artist}</p>
        <p className="text-sm">{title}</p>
        <div className="flex gap-1 text-xs text-gray-500 mt-2">
          {mainGenre && <span>{mainGenre}</span>}
          {mainGenre && album.year && <span>•</span>}
          {album.year && <span>{album.year}</span>}
        </div>
        {album.catno && album.catno.toLowerCase() !== "none" && (
          <p className="text-xs text-gray-500 mt-1">{album.catno}</p>
        )}
      </div>

      <div className="buttons w-9/10 flex flex-col mt-auto mb-4 gap-2 transition duration-200">
        {/* Collection button */}
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

        {/* Wishlist button (hidden if in collection) */}
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

        {/* Modal to confirm moving album from wishlist to collection */}
        <ConfirmModal
          open={modalOpen}
          title={`${t(locale, "moveToCollection", pendingAlbum?.title || album.title)}?`}
          message={`${t(locale, "moveToCollectionMessage")}?`}
          onCancel={() => setModalOpen(false)}
          onConfirm={async () => {
            if (!pendingAlbum) return;

            const user = auth.currentUser;
            if (!user) return;

            // Remove from wishlist
            await deleteDoc(
              doc(
                db,
                "users",
                user.uid,
                "Wishlist",
                pendingAlbum.id.toString(),
              ),
            );

            // Add to collection
            const discogsArtists = await fetchDiscogsArtists({
              id: pendingAlbum.id,
              masterId: pendingAlbum.master_id,
            });
            const artists = deriveArtists(
              pendingAlbum.artist,
              discogsArtists.length > 0 ? discogsArtists : pendingAlbum.artists,
            );
            const primaryArtist = derivePrimaryArtist(
              pendingAlbum.primaryArtist,
              artists,
              pendingAlbum.artist,
            );
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
                addedAt: serverTimestamp(),
              },
            );

            setModalOpen(false);
            setIsInCollection(true);
            setIsInWishlist(false);

            // toast
            (window as any).addToast?.({
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

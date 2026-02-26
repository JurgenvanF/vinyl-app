"use client";

import CollectionButton from "./buttons/CollectionButton";
import WishlistButton from "./buttons/WishlistButton";
import RemoveCollectionButton from "./buttons/RemoveCollectionButton";
import RemoveWishlistButton from "./buttons/RemoveWishlistButton";
import ViewDetailsButton from "./buttons/ViewDetailsButton";

import "./AlbumCard.scss";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
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
  buttons?: {
    collection?: boolean;
    wishlist?: boolean;
    removeCollection?: boolean;
    removeWishlist?: boolean;
    viewDetails?: boolean;
  };
};

export default function AlbumCard({
  album,
  mainGenre,
  releaseType,
  artist,
  title,
  buttons,
}: AlbumCardProps) {
  return (
    <div className="album-card flex flex-col items-center gap-2 border rounded group">
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
        {buttons?.collection && <CollectionButton />}
        {buttons?.wishlist && <WishlistButton />}
        {buttons?.removeCollection && <RemoveCollectionButton />}
        {buttons?.removeWishlist && <RemoveWishlistButton />}
        {buttons?.viewDetails && <ViewDetailsButton />}
      </div>
    </div>
  );
}

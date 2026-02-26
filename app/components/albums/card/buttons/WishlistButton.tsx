"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import { Heart } from "lucide-react";
import { auth, db } from "../../../../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
};

type WishlistButtonProps = {
  album: DiscogsRelease;
};

export default function WishlistButton({ album }: WishlistButtonProps) {
  const { locale } = useLanguage();

  const handleAddToWishlist = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    const splitDiscogsTitle = (fullTitle: string, artist?: string) => {
      if (artist) return { artist, title: fullTitle };

      const [maybeArtist, ...titleParts] = fullTitle.split(" - ");
      const albumTitle = titleParts.join(" - ").trim() || fullTitle;
      const albumArtist = maybeArtist?.trim() || "Unknown";

      return { artist: albumArtist, title: albumTitle };
    };

    const { artist: albumArtist, title: albumTitle } = splitDiscogsTitle(
      album.title,
      album.artist,
    );

    try {
      await setDoc(
        doc(db, "users", user.uid, "Wishlist", album.id.toString()),
        {
          id: album.id,
          title: albumTitle,
          artist: albumArtist,
          cover_image: album.cover_image,
          releaseType: album.type,
          genre: album.genre?.[0] || null,
          year: album.year || null,
          catno: album.catno || null,
          master_id: album.master_id || null,
          addedAt: serverTimestamp(),
        },
      );

      alert(`${albumTitle} added to your wishlist!`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong adding to wishlist.");
    }
  };

  return (
    <div className="buttons__wishlist w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button
        className="flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer"
        onClick={handleAddToWishlist}
      >
        <Heart size={15} className="buttons__wishlist__icon" />
        {t(locale, "addToWishlist")}
      </button>
    </div>
  );
}

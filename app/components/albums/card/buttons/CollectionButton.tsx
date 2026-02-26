"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import { Plus } from "lucide-react";
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

type CollectionButtonProps = {
  album: DiscogsRelease;
};

export default function CollectionButton({ album }: CollectionButtonProps) {
  const { locale } = useLanguage();

  const handleAddToCollection = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    const splitDiscogsTitle = (fullTitle: string, artist?: string) => {
      if (artist) return { artist, title: fullTitle }; // artist already present

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
        doc(db, "users", user.uid, "Collection", album.id.toString()),
        {
          id: album.id,
          title: albumTitle,
          artist: albumArtist,
          cover_image: album.cover_image,
          releaseType: album.type,
          genre: album.genre || [],
          year: album.year || null,
          catno: album.catno || null,
          master_id: album.master_id || null,
          addedAt: serverTimestamp(),
        },
      );

      alert(`${albumTitle} added to your collection!`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong adding to collection.");
    }
  };

  return (
    <div className="buttons__collection w-full text-center border rounded cursor-pointer">
      <button
        className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
        onClick={handleAddToCollection}
      >
        <Plus size={15} /> {t(locale, "addToCollection")}
      </button>
    </div>
  );
}

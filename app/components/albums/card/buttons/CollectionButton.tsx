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
      // show toast instead of alert
      (window as any).addToast?.({
        message: "Please log in first!",
        icon: Plus,
        bgColor: "bg-red-100",
        textColor: "text-red-900",
        iconBgColor: "bg-red-200",
        iconBorderColor: "border-red-400",
      });
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

      // toast success
      (window as any).addToast?.({
        message: `${albumTitle} added to your collection!`,
        icon: Plus,
        bgColor: "bg-green-100",
        textColor: "text-green-900",
        iconBgColor: "bg-green-200",
        iconBorderColor: "border-green-400",
      });
    } catch (err) {
      console.error(err);
      (window as any).addToast?.({
        message: "Something went wrong adding to collection.",
        icon: Plus,
        bgColor: "bg-red-100",
        textColor: "text-red-900",
        iconBgColor: "bg-red-200",
        iconBorderColor: "border-red-400",
      });
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

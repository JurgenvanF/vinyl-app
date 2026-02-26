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
  format?: string[];
  genre?: string[];
  year?: number;
  catno?: string;
  master_id?: number;
};

type CollectionButtonProps = {
  album: DiscogsRelease;
  releaseType?: string;
};

const getReleaseType = (formats?: string[]) => {
  if (!formats || formats.length === 0) return undefined;
  const meaningful = formats.find((f) =>
    /LP|Single|EP|CD|Compilation/i.test(f),
  );
  if (!meaningful) return undefined;
  if (/LP/i.test(meaningful)) return "Album";
  return meaningful;
};

export default function CollectionButton({
  album,
  releaseType,
}: CollectionButtonProps) {
  const { locale } = useLanguage();

  const handleAddToCollection = async () => {
    const user = auth.currentUser;
    if (!user) {
      if (typeof window !== "undefined") {
        (window as any).addToast?.({
          message: "Please log in first!",
          icon: Plus,
          bgColor: "bg-red-100",
          textColor: "text-red-900",
          iconBgColor: "bg-red-200",
          iconBorderColor: "border-red-400",
        });
      }
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

    const normalizedReleaseType = releaseType ?? getReleaseType(album.format);

    try {
      await setDoc(
        doc(db, "users", user.uid, "Collection", album.id.toString()),
        {
          id: album.id,
          title: albumTitle,
          artist: albumArtist,
          cover_image: album.cover_image,
          releaseType: normalizedReleaseType || null,
          genre: album.genre || [],
          year: album.year || null,
          catno: album.catno || null,
          master_id: album.master_id || null,
          addedAt: serverTimestamp(),
        },
      );

      if (typeof window !== "undefined") {
        (window as any).addToast?.({
          message: `${albumTitle} ${t(locale, "addedToCollection")?.toLowerCase()}!`,
          icon: Plus,
          bgColor: "bg-green-100",
          textColor: "text-green-900",
          iconBgColor: "bg-green-200",
          iconBorderColor: "border-green-400",
        });
      }
    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") {
        (window as any).addToast?.({
          message: `${t(locale, "errorAddToCollection")?.toLowerCase()}.`,
          icon: Plus,
          bgColor: "bg-red-100",
          textColor: "text-red-900",
          iconBgColor: "bg-red-200",
          iconBorderColor: "border-red-400",
        });
      }
    }
  };

  return (
    <div className="buttons__collection w-full text-center border rounded cursor-pointer">
      <button
        className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
        onClick={handleAddToCollection}
      >
        <Plus size={15} /> {t(locale, "collection")}
      </button>
    </div>
  );
}

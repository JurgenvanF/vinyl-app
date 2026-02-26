"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import { Trash2 } from "lucide-react";
import { auth, db } from "../../../../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  cover_image?: string;
};

type RemoveCollectionButtonProps = {
  album: DiscogsRelease;
};

export default function RemoveCollectionButton({
  album,
}: RemoveCollectionButtonProps) {
  const { locale } = useLanguage();

  const handleRemove = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "Collection", album.id.toString()),
      );
      alert(`${album.title} removed from your collection!`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong removing the album.");
    }
  };

  return (
    <div className="buttons__remove w-full text-center border rounded cursor-pointer">
      <button
        className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
        onClick={handleRemove}
      >
        <Trash2 size={15} /> {t(locale, "remove")}
      </button>
    </div>
  );
}

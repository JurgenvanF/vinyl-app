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
      (window as any).addToast?.({
        message: "Please log in first!",
        icon: Trash2,
        bgColor: "bg-red-100",
        textColor: "text-red-900",
        iconBgColor: "bg-red-200",
        iconBorderColor: "border-red-400",
      });
      return;
    }

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "Collection", album.id.toString()),
      );

      (window as any).addToast?.({
        message: `${album.title} removed from your collection!`,
        icon: Trash2,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-900",
        iconBgColor: "bg-yellow-200",
        iconBorderColor: "border-yellow-400",
      });
    } catch (err) {
      console.error(err);
      (window as any).addToast?.({
        message: "Something went wrong removing the album.",
        icon: Trash2,
        bgColor: "bg-red-100",
        textColor: "text-red-900",
        iconBgColor: "bg-red-200",
        iconBorderColor: "border-red-400",
      });
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

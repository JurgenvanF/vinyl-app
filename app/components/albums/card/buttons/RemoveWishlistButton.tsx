"use client";

import { useState } from "react";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import { HeartOff } from "lucide-react";
import { auth, db } from "../../../../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

import MessageModal from "../../../modal/MessageModal";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  cover_image?: string;
};

type RemoveWishlistButtonProps = {
  album: DiscogsRelease;
};

export default function RemoveWishlistButton({
  album,
}: RemoveWishlistButtonProps) {
  const { locale } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "Wishlist", album.id.toString()),
      );

      if (typeof window !== "undefined") {
        (window as any).addToast?.({
          message: `${album.title} ${t(locale, "removedFromWishlist")?.toLowerCase()}!`,
          icon: HeartOff,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-900",
          iconBgColor: "bg-yellow-200",
          iconBorderColor: "border-yellow-400",
        });
      }
    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") {
        (window as any).addToast?.({
          message: `${t(locale, "errorRemovedFromWishlist")?.toLowerCase()}.`,
          icon: HeartOff,
          bgColor: "bg-red-100",
          textColor: "text-red-900",
          iconBgColor: "bg-red-200",
          iconBorderColor: "border-red-400",
        });
      }
    }
  };

  return (
    <>
      <div className="buttons__remove w-full text-center border rounded cursor-pointer">
        <button
          className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <HeartOff size={15} /> {t(locale, "remove")}
        </button>
      </div>

      {modalOpen && (
        <MessageModal
          open={modalOpen}
          title={`${t(locale, "remove")} ${album.title}?`}
          message={`${t(locale, "confirmRemoveFromWishlist")}?`}
          background="red"
          color="white"
          onCancel={() => setModalOpen(false)}
          onConfirm={() => {
            handleRemove();
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

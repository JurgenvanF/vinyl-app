"use client";

import { useState } from "react";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import { devError } from "../../../../../lib/devLog";
import { Trash2, TriangleAlert } from "lucide-react";
import { auth, db } from "../../../../../lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import MessageModal from "../../../modal/MessageModal";
import { decrementAlbumDetailsRefCountAndCleanup } from "../../../../../lib/sharedAlbumDetails";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  cover_image?: string;
  source?: string;
  cloudinaryPublicIds?: string[];
};

type RemoveCollectionButtonProps = {
  album: DiscogsRelease;
};

type ToastWindow = Window & {
  addToast?: (toast: {
    message: string;
    icon: typeof Trash2;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
    iconBorderColor: string;
  }) => void;
};

export default function RemoveCollectionButton({
  album,
}: RemoveCollectionButtonProps) {
  const { locale } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const handleRemove = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    if (!user.emailVerified) {
      if (typeof window !== "undefined") {
        (window as ToastWindow).addToast?.({
          message: t(locale, "verifyAccountRequiredAction"),
          icon: TriangleAlert,
          bgColor: "bg-red-100",
          textColor: "text-red-900",
          iconBgColor: "bg-red-200",
          iconBorderColor: "border-red-400",
        });
      }
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid, "Collection", album.id.toString());
      const snap = await getDoc(docRef);
      const existingDetailsRef =
        typeof snap.data()?.detailsRef === "string"
          ? (snap.data()?.detailsRef as string)
          : undefined;
      const customDetailsSnap =
        album.source === "custom"
          ? await getDoc(doc(docRef, "details", "details")).catch(() => null)
          : null;
      const storedCustomPublicIds =
        customDetailsSnap && "exists" in customDetailsSnap && customDetailsSnap.exists()
          ? ((customDetailsSnap.data() as { cloudinaryPublicIds?: unknown })
              .cloudinaryPublicIds as unknown[])
              ?.filter((v): v is string => typeof v === "string" && v.length > 0) ?? []
          : [];

      if (album.source === "custom") {
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            "Collection",
            album.id.toString(),
            "details",
            "details",
          ),
        ).catch(() => undefined);
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            "Collection",
            album.id.toString(),
            "album",
            "album",
          ),
        ).catch(() => undefined);
      }

      await deleteDoc(docRef);

      if (typeof window !== "undefined") {
        (window as ToastWindow).addToast?.({
          message: `${album.title} ${t(locale, "removedFromCollection").toLowerCase()}!`,
          icon: Trash2,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-900",
          iconBgColor: "bg-yellow-200",
          iconBorderColor: "border-yellow-400",
        });
      }

      if (existingDetailsRef && album.source !== "custom") {
        void decrementAlbumDetailsRefCountAndCleanup(existingDetailsRef).catch((err) =>
          devError(err),
        );
      }

      if (
        album.source === "custom" &&
        ((Array.isArray(album.cloudinaryPublicIds) &&
          album.cloudinaryPublicIds.length > 0) ||
          storedCustomPublicIds.length > 0)
      ) {
        const ids =
          Array.isArray(album.cloudinaryPublicIds) && album.cloudinaryPublicIds.length > 0
            ? album.cloudinaryPublicIds
            : storedCustomPublicIds;
        void fetch("/api/cloudinary/destroy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds: ids }),
        }).catch(() => undefined);
      }
    } catch (err) {
      devError(err);
      if (typeof window !== "undefined") {
        (window as ToastWindow).addToast?.({
          message: `${t(locale, "errorRemovedFromCollection")?.toLowerCase()}.`,
          icon: Trash2,
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
          <Trash2 size={15} /> {t(locale, "remove")}
        </button>
      </div>

      {modalOpen && (
        <MessageModal
          open={modalOpen}
          title={`${t(locale, "remove")} ${album.title}?`}
          message={`${t(locale, "confirmRemoveFromCollection")}?`}
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

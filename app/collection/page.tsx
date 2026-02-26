"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import VinylSpinner from "../components/spinner/VinylSpinner";
import AlbumSearchModal from "../components/albums/search/AlbumSearchModal";

import { Plus, Disc3 } from "lucide-react";

import "./collection.scss";

export default function Dashboard() {
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        router.replace("/");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading)
    return (
      <div className="min-h-full flex items-center justify-center mt-10">
        <VinylSpinner />
      </div>
    );

  if (!user) return <p className="text-center mt-20">{t(locale, "loading")}</p>;

  return (
    <div className="collection-container flex flex-col min-h-full gap-4">
      <div className="flex justify-between">
        <h1 className="text-3xl sm:text-5xl">{t(locale, "myCollection")}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="collection-container__add rounded h-10 p-2"
          >
            <div className="flex gap-2 items-center">
              <Plus />
              <span className="hidden sm:inline">{t(locale, "addAlbum")}</span>
            </div>
          </button>
        </div>

        <AlbumSearchModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
      <p className="collection-container__count pl-1">0 albums</p>
    </div>
  );
}

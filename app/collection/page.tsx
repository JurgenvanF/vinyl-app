"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import VinylSpinner from "../components/spinner/VinylSpinner";
import AlbumCard from "../components/albums/card/AlbumCard";
import AlbumSearchModal from "../components/albums/search/AlbumSearchModal";

import { Plus } from "lucide-react";

import "./collection.scss";

type AlbumFromFirestore = {
  id: number;
  title: string;
  artist: string;
  cover_image?: string;
  releaseType?: string;
  genre?: string[];
  year?: number | null;
  catno?: string | null;
  master_id?: number | null;
};

export default function Dashboard() {
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [albums, setAlbums] = useState<AlbumFromFirestore[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

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

  // Real-time collection listener
  useEffect(() => {
    if (!user) return;

    const collectionRef = collection(db, "users", user.uid, "Collection");
    const q = query(collectionRef, orderBy("addedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const albumsData = snapshot.docs.map((doc) => {
        const data = doc.data() as AlbumFromFirestore;

        return {
          ...data,
          cover_image: data.cover_image || "/placeholder.png",
          genre: Array.isArray(data.genre)
            ? data.genre
            : data.genre
              ? [data.genre]
              : undefined,
          year: data.year ?? undefined,
          catno: data.catno ?? undefined,
          master_id: data.master_id ?? undefined,
        };
      });

      setAlbums(albumsData);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-full flex items-center justify-center mt-10">
        <VinylSpinner />
      </div>
    );

  if (!user) return <p className="text-center mt-20">{t(locale, "loading")}</p>;

  return (
    <div className="collection-container flex flex-col min-h-full gap-4">
      <div className="flex justify-between items-center">
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
      </div>

      <AlbumSearchModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <p className="collection-container__count pl-1">
        {albums.length} {albums.length === 1 ? "album" : "albums"}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6">
        {albums.map((album) => {
          // fallback for cover_image if missing
          const cover_image = album.cover_image || "/placeholder.png";

          return (
            <AlbumCard
              key={album.id}
              album={{
                ...album,
                cover_image: album.cover_image || "/placeholder.png",
                year: album.year ?? undefined,
                catno: album.catno ?? undefined,
                master_id: album.master_id ?? undefined,
              }}
              mainGenre={album.genre?.[0]}
              releaseType={album.releaseType}
              artist={album.artist}
              title={album.title}
              buttons={{
                collection: false,
                wishlist: false,
                removeCollection: true,
                removeWishlist: false,
                viewDetails: false,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

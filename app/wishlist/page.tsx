"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import { deriveArtists, derivePrimaryArtist } from "../../lib/artist";
import { fetchDiscogsArtists } from "../../lib/discogsArtists";
import VinylSpinner from "../components/spinner/VinylSpinner";
import AlbumCard from "../components/albums/card/AlbumCard";
import AlbumSearchModal from "../components/albums/search/AlbumSearchModal";
import Searchbar from "../components/albums/search/searchbar/Searchbar";
import DropDown from "../components/albums/search/searchbar/dropdown/DropDown";
import { Plus, SlidersHorizontal } from "lucide-react";

import "./wishlist.scss";

type AlbumFromFirestore = {
  id: number;
  title: string;
  artist: string;
  artists?: string[];
  primaryArtist?: string;
  cover_image?: string;
  releaseType?: string;
  genre?: string[] | null;
  year?: number | null;
  catno?: string | null;
  master_id?: number | null;
};

type WishlistSort = "recentlyAdded" | "artist" | "albumName" | "releaseDate";
const BACKFILL_BATCH_SIZE = 5;

export default function WishlistPage() {
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [albumsLoading, setAlbumsLoading] = useState<boolean>(true);
  const [albums, setAlbums] = useState<AlbumFromFirestore[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<WishlistSort>("recentlyAdded");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const sortOptions: { value: WishlistSort; label: string }[] = [
    { value: "recentlyAdded", label: t(locale, "recentlyAdded") },
    { value: "artist", label: t(locale, "artist") },
    { value: "albumName", label: t(locale, "albumName") },
    { value: "releaseDate", label: t(locale, "releaseDate") },
  ];

  // Check user auth
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

  // Real-time listener for Wishlist
  useEffect(() => {
    if (!user) {
      setAlbums([]);
      setAlbumsLoading(false);
      return;
    }

    setAlbumsLoading(true);

    const wishlistRef = collection(db, "users", user.uid, "Wishlist");
    const q = query(wishlistRef, orderBy("addedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const albumsData = snapshot.docs.map((doc) => {
          const data = doc.data() as AlbumFromFirestore;

          return {
            ...data,
            cover_image: data.cover_image || "/placeholder.png",
            artists: Array.isArray(data.artists)
              ? data.artists.filter(
                  (value): value is string => typeof value === "string",
                )
              : undefined,
            primaryArtist:
              typeof data.primaryArtist === "string"
                ? data.primaryArtist
                : undefined,
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
        setAlbumsLoading(false);
      },
      (error) => {
        console.error(error);
        setAlbums([]);
        setAlbumsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || albumsLoading || albums.length === 0 || sortBy !== "artist")
      return;

    const missingArtistMeta = albums
      .filter(
        (album) =>
          !album.primaryArtist ||
          !Array.isArray(album.artists) ||
          album.artists.length === 0,
      )
      .slice(0, BACKFILL_BATCH_SIZE);

    if (missingArtistMeta.length === 0) return;

    let cancelled = false;

    const backfillArtistData = async () => {
      for (const album of missingArtistMeta) {
        if (cancelled) return;

        const discogsArtistResult = await fetchDiscogsArtists({
          id: album.id,
          masterId: album.master_id,
        });
        const artists =
          discogsArtistResult.length > 0
            ? discogsArtistResult
            : deriveArtists(album.artist, album.artists);
        const primaryArtist = derivePrimaryArtist(
          album.primaryArtist,
          artists,
          album.artist,
        );

        try {
          await updateDoc(
            doc(db, "users", user.uid, "Wishlist", album.id.toString()),
            {
              artists,
              primaryArtist,
            },
          );
        } catch (error) {
          console.error(error);
        }
      }
    };

    void backfillArtistData();

    return () => {
      cancelled = true;
    };
  }, [user, albumsLoading, albums, sortBy]);

  const searchedAlbums = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return albums;

    return albums.filter((album) => {
      const title = album.title?.toLowerCase() ?? "";
      const artist = album.artist?.toLowerCase() ?? "";
      const catno = album.catno?.toLowerCase() ?? "";
      return (
        title.includes(term) || artist.includes(term) || catno.includes(term)
      );
    });
  }, [albums, searchValue]);

  const visibleAlbums = useMemo(() => {
    if (sortBy === "recentlyAdded") return searchedAlbums;

    const sorted = [...searchedAlbums];

    if (sortBy === "albumName") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      return sorted;
    }

    if (sortBy === "artist") {
      sorted.sort((a, b) => {
        const aArtist = derivePrimaryArtist(a.primaryArtist, a.artists, a.artist);
        const bArtist = derivePrimaryArtist(b.primaryArtist, b.artists, b.artist);
        const artistCompare = aArtist.localeCompare(bArtist);
        if (artistCompare !== 0) return artistCompare;
        return a.title.localeCompare(b.title);
      });
      return sorted;
    }

    sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    return sorted;
  }, [searchedAlbums, sortBy]);

  const groupedAlbums = useMemo(() => {
    if (sortBy !== "artist" && sortBy !== "releaseDate") return [];

    const groups = new Map<string, AlbumFromFirestore[]>();
    for (const album of visibleAlbums) {
      const key =
        sortBy === "artist"
          ? derivePrimaryArtist(
              album.primaryArtist,
              album.artists,
              album.artist,
            )
          : album.year
            ? album.year.toString()
            : t(locale, "unknownYear");

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(album);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  }, [visibleAlbums, sortBy, locale]);

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
        <h1 className="text-3xl sm:text-5xl">{t(locale, "wishlist")}</h1>
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

      {albumsLoading ? (
        <p className="collection-container__count pl-1">{t(locale, "loading")}</p>
      ) : (
        <p className="collection-container__count pl-1">
          {visibleAlbums.length < albums.length
            ? t(locale, "collectionCount", visibleAlbums.length, albums.length)
            : t(locale, "albumCount", albums.length)}
        </p>
      )}

      <div className="flex gap-4 h-10 items-stretch">
        <div className="w-full">
          <Searchbar
            value={searchValue}
            placeholder={t(locale, "searchAlbumArtistCatNo")}
            onChange={(value) => setSearchValue(value)}
            onClear={() => setSearchValue("")}
          />
        </div>
        <div className="flex items-center w-[22%] min-[501px]:w-[40%] max-w-[225px] gap-4">
          <SlidersHorizontal size={20} className="hidden lg:inline" />
          <div className="w-full h-full">
            <DropDown
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as WishlistSort)}
            />
          </div>
        </div>
      </div>

      {albumsLoading ? (
        <div className="flex items-center justify-center py-10 mt-6">
          <VinylSpinner />
        </div>
      ) : sortBy === "artist" || sortBy === "releaseDate" ? (
        <div className="mt-6 flex flex-col gap-8">
          {groupedAlbums.map((group) => (
            <section key={group.label} className="flex flex-col gap-4">
              <div className="wishlist-group-heading flex items-center gap-3">
                <span className="text-sm font-semibold whitespace-nowrap">
                  {group.label === "Unknown artist"
                    ? t(locale, "unknownArtist")
                    : group.label}
                </span>
                <div className="wishlist-group-line h-px w-full" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {group.items.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={{
                      ...album,
                      cover_image: album.cover_image || "/placeholder.png",
                      genre: album.genre?.length ? album.genre : undefined,
                      year: album.year ?? undefined,
                      catno: album.catno ?? undefined,
                      master_id: album.master_id ?? undefined,
                    }}
                    mainGenre={album.genre?.[0]}
                    releaseType={album.releaseType}
                    artist={album.artist}
                    title={album.title}
                    buttons={{
                      removeWishlist: true,
                      toCollection: true,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6">
          {visibleAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={{
                ...album,
                cover_image: album.cover_image || "/placeholder.png",
                genre: album.genre?.length ? album.genre : undefined,
                year: album.year ?? undefined,
                catno: album.catno ?? undefined,
                master_id: album.master_id ?? undefined,
              }}
              mainGenre={album.genre?.[0]}
              releaseType={album.releaseType}
              artist={album.artist}
              title={album.title}
              buttons={{
                removeWishlist: true,
                toCollection: true,
              }}
            />
          ))}
          {visibleAlbums.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-10">
              <p className="text-center">{t(locale, "noAlbumsFound")}</p>
              <button
                onClick={() => setModalOpen(true)}
                className="collection-container__add rounded h-10 px-3"
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  {t(locale, "addAlbum")}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {!albumsLoading &&
        (sortBy === "artist" || sortBy === "releaseDate") &&
        visibleAlbums.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-10">
            <p className="text-center">{t(locale, "noAlbumsFound")}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="collection-container__add rounded h-10 px-3"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} />
                {t(locale, "addAlbum")}
              </span>
            </button>
          </div>
        )}
    </div>
  );
}

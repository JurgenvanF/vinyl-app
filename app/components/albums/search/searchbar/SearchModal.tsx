"use client";

import { useState, useEffect, useRef } from "react";
import VinylSpinner from "../../../spinner/VinylSpinner";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import AlbumCard from "../../card/AlbumCard";
import Searchbar from "./Searchbar";
import AlbumDetailsModal from "../../modal/AlbumDetailsModal";
import { ArrowUp } from "lucide-react";

import { auth, db } from "../../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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
  have?: number;
  want?: number;
  format?: string[];
};

const splitDiscogsTitle = (fullTitle: string, artist?: string) => {
  if (artist) return { artist, title: fullTitle };

  const [maybeArtist, ...titleParts] = fullTitle.split(" - ");
  const albumTitle = titleParts.join(" - ").trim() || fullTitle;
  const albumArtist = maybeArtist?.trim() || "Unknown";

  return { artist: albumArtist, title: albumTitle };
};

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscogsRelease[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);
  const [searchNotice, setSearchNotice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [collectionIds, setCollectionIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const [selectedAlbum, setSelectedAlbum] = useState<{
    album: DiscogsRelease;
    artist: string;
    title: string;
  } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 40;
  const { locale } = useLanguage();

  const popularityScore = (release: DiscogsRelease) =>
    (release.have || 0) + (release.want || 0);

  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 500);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [searchResults]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const collectionSnap = await getDocs(
          collection(db, "users", user.uid, "Collection"),
        );
        const wishlistSnap = await getDocs(
          collection(db, "users", user.uid, "Wishlist"),
        );

        setCollectionIds(new Set(collectionSnap.docs.map((doc) => doc.id)));
        setWishlistIds(new Set(wishlistSnap.docs.map((doc) => doc.id)));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setPage(1);
      setTotalPages(1);
      setHasCompletedSearch(false);
      setSearchNotice("");
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      setHasCompletedSearch(false);
      setSearchNotice("");
      const slowSearchTimer = setTimeout(() => {
        setSearchNotice(t(locale, "searchTakingLonger"));
      }, 5000);
      try {
        const queryUrl = `/api/search?q=${encodeURIComponent(
          searchQuery,
        )}&page=${page}&per_page=${PER_PAGE}`;
        const res = await fetch(queryUrl);
        const data = await res.json();
        const results: DiscogsRelease[] = data.results ?? [];

        const uniqueResultsMap = new Map<string, DiscogsRelease>();
        for (const r of results) {
          const key = r.master_id
            ? `m${r.master_id}`
            : `${r.title}-${r.artist}`;
          if (!uniqueResultsMap.has(key)) {
            uniqueResultsMap.set(key, r);
          }
        }

        let uniqueResults = Array.from(uniqueResultsMap.values());

        const masters = uniqueResults.filter((r) => r.master_id);
        const nonMasters = uniqueResults.filter((r) => !r.master_id);

        masters.sort((a, b) => popularityScore(b) - popularityScore(a));
        nonMasters.sort((a, b) => popularityScore(b) - popularityScore(a));

        uniqueResults = [...masters, ...nonMasters];

        setSearchResults(uniqueResults);
        setTotalPages(Math.ceil(data.total / PER_PAGE));
        setHasCompletedSearch(true);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setHasCompletedSearch(true);
      } finally {
        clearTimeout(slowSearchTimer);
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, page]);

  const getMainGenre = (genres?: string[]) => {
    if (!genres || genres.length === 0) return undefined;
    return genres[0].split(/[,/]/)[0].trim();
  };

  const getReleaseType = (formats?: string[], type?: string) => {
    if (!formats || formats.length === 0) return undefined;
    const meaningful = formats.find((f) =>
      /LP|Single|EP|CD|Compilation/i.test(f),
    );
    if (!meaningful) return undefined;

    if (/LP/i.test(meaningful)) return "Album";
    return meaningful;
  };

  return (
    <>
      <div className="relative w-full">
        <Searchbar
          value={searchQuery}
          placeholder={t(locale, "searchAlbumArtistCatNo")}
          onChange={(value) => {
            setSearchQuery(value);
            setHasCompletedSearch(false);
            setPage(1);
          }}
          onClear={() => {
            setHasCompletedSearch(false);
            setPage(1);
          }}
        />
      </div>

      {searchLoading && (
        <div className="flex justify-center mt-4">
          <VinylSpinner />
        </div>
      )}

      {!searchLoading && searchResults.length > 0 && (
        <div className="relative">
          <div
            ref={resultsRef}
            className="mt-6 max-h-[40vh] md:max-h-[55vh] overflow-y-auto pr-2"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map((album) => {
                const mainGenre = getMainGenre(album.genre);
                const releaseType = getReleaseType(album.format, album.type);
                const { artist, title } = splitDiscogsTitle(
                  album.title,
                  album.artist,
                );

                const isInCollection = collectionIds.has(album.id.toString());
                const isInWishlist = wishlistIds.has(album.id.toString());

                return (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    mainGenre={mainGenre}
                    releaseType={releaseType}
                    artist={artist}
                    title={title}
                    onCardClick={() => {
                      setSelectedAlbum({ album, artist, title });
                    }}
                    collectionAction={isInCollection ? "disabled" : "enabled"}
                    wishlistAction={isInWishlist ? "disabled" : "enabled"}
                    onAddedToCollection={(albumId) => {
                      setCollectionIds((prev) => {
                        const next = new Set(prev);
                        next.add(albumId);
                        return next;
                      });
                      setWishlistIds((prev) => {
                        const next = new Set(prev);
                        next.delete(albumId);
                        return next;
                      });
                    }}
                    onAddedToWishlist={(albumId) => {
                      setWishlistIds((prev) => {
                        const next = new Set(prev);
                        next.add(albumId);
                        return next;
                      });
                      setCollectionIds((prev) => {
                        const next = new Set(prev);
                        next.delete(albumId);
                        return next;
                      });
                    }}
                    buttons={{
                      collection: true,
                      wishlist: true,
                      removeCollection: false,
                      removeWishlist: false,
                      viewDetails: false,
                    }}
                  />
                );
              })}
            </div>

            {!searchLoading && searchResults.length > 0 && (
              <p className="text-center mt-6 pt-4 border-t border-gray-200 text-sm">
                {t(locale, "noMatch")}
              </p>
            )}
          </div>

          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              className="absolute top-5 right-5 bg-slate-500 text-white w-12 h-12 rounded-full shadow hover:bg-slate-600 transition flex items-center justify-center cursor-pointer"
              onClick={() =>
                resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      )}

      <AlbumDetailsModal
        key={selectedAlbum?.album.id ?? 0}
        open={Boolean(selectedAlbum)}
        album={selectedAlbum?.album ?? null}
        artist={selectedAlbum?.artist}
        displayTitle={selectedAlbum?.title}
        onClose={() => setSelectedAlbum(null)}
      />

      {searchLoading && searchNotice && (
        <p className="text-center mt-3 text-sm text-amber-700">
          {searchNotice}
        </p>
      )}

      {!searchLoading &&
        hasCompletedSearch &&
        searchResults.length === 0 &&
        searchQuery && (
          <p className="text-center mt-4">{t(locale, "noResult")}.</p>
        )}
    </>
  );
}

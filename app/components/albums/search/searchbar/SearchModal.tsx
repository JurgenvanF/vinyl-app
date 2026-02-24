"use client";

import { useState, useEffect } from "react";
import VinylSpinner from "../../../spinner/VinylSpinner";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import AlbumCard from "../../card/AlbumCard";

import { Search } from "lucide-react";

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
  if (artist) return { artist, title: fullTitle }; // artist already present

  const [maybeArtist, ...titleParts] = fullTitle.split(" - ");
  const albumTitle = titleParts.join(" - ").trim() || fullTitle;
  const albumArtist = maybeArtist?.trim() || "Unknown";

  return { artist: albumArtist, title: albumTitle };
};

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscogsRelease[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PER_PAGE = 40;
  const { locale } = useLanguage();

  const popularityScore = (release: DiscogsRelease) =>
    (release.have || 0) + (release.want || 0);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setPage(1);
      setTotalPages(1);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${PER_PAGE}`,
        );
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
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

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
        <input
          type="text"
          placeholder={t(locale, "searchAlbumArtistCatNo")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="search-input rounded pl-10 py-2 w-full border border-transparent"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={15} />
        </span>
      </div>

      {searchLoading && (
        <div className="flex justify-center mt-4">
          <VinylSpinner />
        </div>
      )}

      {!searchLoading && searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {searchResults.map((album) => {
            const mainGenre = getMainGenre(album.genre);
            const releaseType = getReleaseType(album.format, album.type);
            const { artist, title } = splitDiscogsTitle(
              album.title,
              album.artist,
            );

            return (
              <AlbumCard
                key={album.id}
                album={album}
                mainGenre={mainGenre}
                releaseType={releaseType}
                artist={artist}
                title={title}
              />
            );
          })}
        </div>
      )}
      {!searchLoading && searchResults.length >= 1 && searchQuery && (
        <p className="text-center mt-4">{t(locale, "noMatch")}</p>
      )}

      {!searchLoading && searchResults.length === 0 && searchQuery && (
        <p className="text-center mt-4">No results found.</p>
      )}
    </>
  );
}

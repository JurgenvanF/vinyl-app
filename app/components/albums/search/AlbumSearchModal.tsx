"use client";

import { useState, useEffect } from "react";
import VinylSpinner from "../../spinner/VinylSpinner";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  cover_image: string;
  have?: number;
  want?: number;
  master_id?: number;
  catno?: string; // <-- added catalog number
};

type AlbumSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const cleanDiscogsTitle = (fullTitle: string) => {
  const [artistPart, ...titleParts] = fullTitle.split(" - ");

  const mainArtist =
    artistPart
      .split(" = ")
      .find((a) => /[A-Za-z]/.test(a))
      ?.trim() || artistPart.split(" = ")[0].trim();

  const mainTitle =
    titleParts
      .join(" - ")
      .split(" = ")
      .find((t) => /[A-Za-z0-9]/.test(t))
      ?.trim() || titleParts.join(" - ").split(" = ")[0].trim();

  return `${mainArtist} - ${mainTitle}`;
};

export default function AlbumSearchModal({
  open,
  onClose,
}: AlbumSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscogsRelease[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PER_PAGE = 40;

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

        // Deduplicate by master_id if exists, otherwise title+artist
        const uniqueResultsMap = new Map<string, DiscogsRelease>();
        for (const r of results) {
          const key = r.master_id
            ? `m${r.master_id}`
            : `${r.title}-${r.artist}`;
          if (!uniqueResultsMap.has(key)) uniqueResultsMap.set(key, r);
        }
        let uniqueResults = Array.from(uniqueResultsMap.values());

        // Separate masters vs non-masters
        const masters = uniqueResults.filter((r) => r.master_id);
        const nonMasters = uniqueResults.filter((r) => !r.master_id);

        // Sort each group by popularity
        masters.sort((a, b) => popularityScore(b) - popularityScore(a));
        nonMasters.sort((a, b) => popularityScore(b) - popularityScore(a));

        // Combine: masters first
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search Albums</h2>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by album, artist or catalog number..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 w-full mb-4"
        />

        {searchLoading && (
          <div className="flex justify-center mt-4">
            <VinylSpinner />
          </div>
        )}

        {!searchLoading && searchResults.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map((album) => (
                <div
                  key={album.id}
                  className="flex flex-col items-center gap-2"
                >
                  <img
                    src={album.cover_image || "/placeholder.png"}
                    alt={album.title}
                    className="w-24 h-24 object-cover"
                  />
                  <p className="text-sm text-center">
                    {cleanDiscogsTitle(album.title)}
                  </p>
                  <p className="text-xs text-gray-500">{album.artist}</p>
                  <p className="text-xs text-gray-500">
                    {album.artist} {album.catno && `${album.catno}`}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {!searchLoading && searchResults.length === 0 && searchQuery && (
          <p className="text-center mt-4">No results found.</p>
        )}
      </div>
    </div>
  );
}

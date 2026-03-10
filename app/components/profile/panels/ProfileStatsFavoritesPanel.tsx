"use client";

import { useEffect, useMemo, useState } from "react";
import type { CollectionAlbumLite, UserProfileDocument } from "../profileTypes";
import { Calendar, ChevronDown, Disc, MicVocal, Music } from "lucide-react";
import { isVariousArtistName } from "../profileDisplay";

type Labels = {
  title: string;
  statsAlbums: string;
  statsYears: string;
  statsUniqueGenres: string;
  statsTopArtist: string;
  yearStarted: string;
  favoriteAlbum: string;
  favoriteGenres: string;
  noFavoriteAlbumSet: string;
  noGenresSet: string;
  noneSelected: string;
};

type ProfileStatsFavoritesPanelProps = {
  draft: UserProfileDocument;
  editMode: boolean;
  onDraftChange: (next: UserProfileDocument) => void;
  collectionAlbums: CollectionAlbumLite[];
  uniqueGenres: string[];
  labels: Labels;
};

function clampYear(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export default function ProfileStatsFavoritesPanel({
  draft,
  editMode,
  onDraftChange,
  collectionAlbums,
  uniqueGenres,
  labels,
}: ProfileStatsFavoritesPanelProps) {
  const currentYear = new Date().getFullYear();
  const startedYear =
    typeof draft.startedCollectingYear === "number"
      ? draft.startedCollectingYear
      : null;

  const [startedYearInput, setStartedYearInput] = useState<string>(
    startedYear ? String(startedYear) : "",
  );

  useEffect(() => {
    setStartedYearInput(startedYear ? String(startedYear) : "");
  }, [startedYear, editMode]);

  const yearsCollecting =
    startedYear && startedYear > 0
      ? Math.max(0, currentYear - startedYear + 1)
      : 0;

  const favoriteGenres = useMemo(() => {
    return Array.isArray(draft.favoriteGenres)
      ? draft.favoriteGenres
          .filter((g): g is string => typeof g === "string")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];
  }, [draft.favoriteGenres]);

  const topArtist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const album of collectionAlbums) {
      const name = (album.primaryArtist ?? album.artist ?? "").trim();
      if (!name || isVariousArtistName(name)) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    let best: { name: string; count: number } | null = null;
    for (const [name, count] of counts.entries()) {
      if (!best || count > best.count) best = { name, count };
    }
    return best;
  }, [collectionAlbums]);

  const orderedGenres = useMemo(() => {
    const favoritesSet = new Set(favoriteGenres);
    const favorites = uniqueGenres.filter((g) => favoritesSet.has(g));
    const rest = uniqueGenres.filter((g) => !favoritesSet.has(g));
    return [...favorites, ...rest];
  }, [favoriteGenres, uniqueGenres]);
  const favoriteGenresCount =
    orderedGenres.length === 0 ? 0 : favoriteGenres.length;

  const favoriteAlbum = useMemo(() => {
    if (typeof draft.favoriteAlbumId !== "number") return null;
    return (
      collectionAlbums.find((album) => album.id === draft.favoriteAlbumId) ??
      null
    );
  }, [collectionAlbums, draft.favoriteAlbumId]);

  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);

  const setStartedYear = (value: number | null) => {
    onDraftChange({ ...draft, startedCollectingYear: value });
  };

  const toggleGenre = (genre: string) => {
    if (!editMode) return;
    const next = new Set(favoriteGenres);
    if (next.has(genre)) {
      next.delete(genre);
      onDraftChange({ ...draft, favoriteGenres: Array.from(next) });
      return;
    }

    if (next.size >= 5) return;
    next.add(genre);
    onDraftChange({ ...draft, favoriteGenres: Array.from(next) });
  };

  return (
    <section className="profile__surface border rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold">{labels.title}</h2>

      {!editMode && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="profile__surface flex items-center gap-4 border rounded-xl p-4">
            <div className="profile__surface__icon__collection p-2 rounded-full">
              <Disc size={25} />
            </div>
            <div>
              <div className="text-2xl font-semibold mt-1">
                {collectionAlbums.length}
              </div>
              <div className="text-sm profile__muted">{labels.statsAlbums}</div>
            </div>
          </div>
          <div className="profile__surface flex items-center gap-4 border rounded-xl p-4">
            <div className="profile__surface__icon__years p-2 rounded-full">
              <Calendar size={25} />
            </div>
            <div>
              <div className="text-2xl font-semibold mt-1">
                {startedYear ? yearsCollecting : "-"}
              </div>
              <div className="text-sm profile__muted">{labels.statsYears}</div>
            </div>
          </div>
          <div className="profile__surface flex items-center gap-4 border rounded-xl p-4">
            <div className="profile__surface__icon__genres p-2 rounded-full">
              <Music size={25} />
            </div>
            <div>
              <div className="text-2xl font-semibold mt-1">
                {uniqueGenres.length}
              </div>
              <div className="text-sm profile__muted">
                {labels.statsUniqueGenres}
              </div>
            </div>
          </div>
          <div className="profile__surface flex items-center gap-4 border rounded-xl p-4">
            <div className="profile__surface__icon__artist p-2 rounded-full">
              <MicVocal size={25} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center mt-1">
                <div
                  className="text-xl font-semibold profile truncate flex-1 min-w-0"
                  title={topArtist?.name}
                >
                  {topArtist ? topArtist.name : "-"}
                </div>
                <div className="text-sm font-semibold ml-1 shrink-0">
                  {topArtist ? `(${topArtist.count})` : ""}
                </div>
              </div>

              <div className="text-sm profile__muted">
                {labels.statsTopArtist}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{labels.yearStarted}</label>
          <input
            className={`profile__input ${editMode ? "" : "profile__input--disabled"} border rounded-lg px-3 py-2`}
            type={`${editMode ? "number" : "text"}`}
            value={startedYearInput}
            onChange={(event) => {
              const raw = event.target.value;
              if (!raw) {
                setStartedYearInput("");
                setStartedYear(null);
                return;
              }
              setStartedYearInput(raw);

              // Allow typing partial years (e.g. "2", "20", "202") without clamping.
              if (!/^\d{0,4}$/.test(raw)) return;
              if (raw.length < 4) return;

              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              setStartedYear(clampYear(parsed, 1900, currentYear));
            }}
            onBlur={() => {
              const raw = startedYearInput.trim();
              if (!raw) {
                setStartedYear(null);
                return;
              }
              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              const clamped = clampYear(parsed, 1900, currentYear);
              setStartedYear(clamped);
              setStartedYearInput(String(clamped));
            }}
            disabled={!editMode}
            min={1900}
            max={currentYear}
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium">{labels.favoriteAlbum}</label>

          {editMode && (
            <>
              <button
                type="button"
                className="profile-select__trigger border rounded-lg px-3 py-2 flex items-center justify-between gap-3  cursor-pointer"
                disabled={collectionAlbums.length === 0}
                onClick={() => setAlbumMenuOpen((prev) => !prev)}
              >
                <span className="truncate">
                  {favoriteAlbum
                    ? `${favoriteAlbum.title} - ${
                        favoriteAlbum.primaryArtist ??
                        favoriteAlbum.artist ??
                        ""
                      }`
                    : labels.noneSelected}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${albumMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`profile-select__menu border rounded-lg shadow-md absolute left-0 right-0 top-[calc(100%+0.25rem)] max-h-60 overflow-y-auto z-40 ${
                  albumMenuOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                } transition-opacity`}
              >
                {collectionAlbums.map((album) => {
                  return (
                    <button
                      type="button"
                      key={album.id}
                      className="profile-select__option w-full text-left px-3 py-2 flex items-center gap-3"
                      onClick={() => {
                        onDraftChange({ ...draft, favoriteAlbumId: album.id });
                        setAlbumMenuOpen(false);
                      }}
                    >
                      <div className="w-9 h-9 rounded overflow-hidden shrink-0 profile__surface border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={album.cover_image || "/placeholder.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {album.title}
                        </div>
                        <div className="truncate text-xs profile__muted">
                          {album.primaryArtist ?? album.artist ?? ""}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {favoriteAlbum ? (
            <div className="mt-3 grid grid-cols-[60px_1fr] gap-3 items-center">
              <div className="w-[60px] h-[60px] rounded-lg overflow-hidden profile__surface border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={favoriteAlbum.cover_image || "/placeholder.png"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {favoriteAlbum.title}
                </div>
                <div className="truncate profile__muted">
                  {favoriteAlbum.primaryArtist ?? favoriteAlbum.artist ?? ""}
                </div>
              </div>
            </div>
          ) : (
            !editMode && (
              <p className="profile__muted text-sm">
                {labels.noFavoriteAlbumSet}
              </p>
            )
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold">{labels.favoriteGenres}</h3>
            <p className="profile__muted text-xs mt-1">
              {editMode ? "Select up to 5." : ""}
            </p>
          </div>
          <div className="profile__muted text-xs">{favoriteGenresCount}/5</div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {orderedGenres.length === 0 && (
            <span className="profile__muted text-sm">{labels.noGenresSet}</span>
          )}
          {orderedGenres.map((genre) => {
            const isFav = favoriteGenres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                className={`profile__tag ${isFav ? "profile__tag--favorite" : ""} px-3 py-1 rounded-full text-sm border border-transparent transition-opacity ${
                  editMode ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => toggleGenre(genre)}
                disabled={!editMode}
                title={editMode ? "Toggle favorite genre" : undefined}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

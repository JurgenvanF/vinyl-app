"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Camera, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import {
  getLocalizedCountryName,
  SUPPORTED_COUNTRY_ISOS,
} from "../../../../../lib/countryFlags";
import { useThemePlaceholder } from "../../../../../lib/useThemePlaceholder";
import { auth, db, storage } from "../../../../../lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import AlbumCard from "../../card/AlbumCard";
import AlbumDetailsModal from "../../modal/AlbumDetailsModal";
import MessageModal from "../../../modal/MessageModal";
import ActionBar from "./components/ActionBar";
import SectionPanel from "./components/SectionPanel";
import ValueListEditor from "./components/ValueListEditor";
import { parseReleasedInputToISO, toReleasedDisplay } from "./customEntryDate";
import type {
  CustomExtraArtist,
  CustomLabel,
  CustomSideDraft,
  CustomTrackDraft,
  LocalImage,
  SaveTarget,
  TracklistMode,
} from "./customEntryTypes";
import type {
  DiscogsArtist,
  DiscogsImage,
  DiscogsLabel,
  DiscogsReleaseDetails,
  DiscogsTrack,
} from "../../../../../lib/discogsRelease";

import "./CustomEntry.scss";

const createCustomAlbumId = () => {
  const now = Date.now();
  const jitter = Math.floor(Math.random() * 1000);
  return -1 * (now + jitter);
};

export default function CustomEntry() {
  const { locale } = useLanguage();
  const placeholderSrc = useThemePlaceholder();

  const [saveTarget, setSaveTarget] = useState<SaveTarget>("collection");
  const [title, setTitle] = useState("");
  const [artists, setArtists] = useState<string[]>([""]);
  const [releaseType, setReleaseType] = useState("");

  const [mainGenre, setMainGenre] = useState("");
  const [otherGenres, setOtherGenres] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>(["Vinyl", "LP"]);
  const [catno, setCatno] = useState("");

  const [releasedInput, setReleasedInput] = useState<string>("");
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const [countryISO, setCountryISO] = useState("");
  const [series, setSeries] = useState("");
  const [notes, setNotes] = useState("");
  const [qtyInput, setQtyInput] = useState<string>("1");
  const [tracklistMode, setTracklistMode] =
    useState<TracklistMode>("continuous");

  const [labels, setLabels] = useState<CustomLabel[]>([]);
  const [extraArtists, setExtraArtists] = useState<CustomExtraArtist[]>([]);
  const [tracks, setTracks] = useState<CustomTrackDraft[]>([
    { title: "", duration: "" },
  ]);
  const [sides, setSides] = useState<CustomSideDraft[]>([
    { side: "A", tracks: [{ title: "", duration: "" }] },
    { side: "B", tracks: [{ title: "", duration: "" }] },
  ]);
  const [coverImage, setCoverImage] = useState<LocalImage | null>(null);
  const [extraImages, setExtraImages] = useState<LocalImage[]>([]);
  const imagesRef = useRef<{ cover: LocalImage | null; extra: LocalImage[] }>({
    cover: null,
    extra: [],
  });
  const coverLibraryInputRef = useRef<HTMLInputElement | null>(null);
  const coverCameraInputRef = useRef<HTMLInputElement | null>(null);
  const extraLibraryInputRef = useRef<HTMLInputElement | null>(null);
  const extraCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    imagesRef.current = { cover: coverImage, extra: extraImages };
  }, [coverImage, extraImages]);

  useEffect(() => {
    return () => {
      const current = imagesRef.current;
      if (current.cover) URL.revokeObjectURL(current.cover.previewUrl);
      for (const img of current.extra) URL.revokeObjectURL(img.previewUrl);
    };
  }, []);

  const releasedParsed = useMemo(
    () => parseReleasedInputToISO(releasedInput),
    [releasedInput],
  );
  const releasedISO = useMemo(() => releasedParsed.iso, [releasedParsed.iso]);
  const year = useMemo(() => releasedParsed.year, [releasedParsed.year]);

  const cleanedArtists = useMemo(
    () => artists.map((a) => a.trim()).filter(Boolean),
    [artists],
  );

  const artistDisplay = useMemo(() => {
    if (cleanedArtists.length === 0) return "";
    return cleanedArtists.join(" & ");
  }, [cleanedArtists]);

  const qty = useMemo((): number | undefined => {
    const trimmed = qtyInput.trim();
    if (!trimmed) return undefined;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [qtyInput]);

  const coverPreview = coverImage?.previewUrl || placeholderSrc;

  const genreList = useMemo(() => {
    const primary = mainGenre.trim();
    const rest = otherGenres.map((g) => g.trim()).filter(Boolean);
    if (!primary) return rest;
    return [primary, ...rest];
  }, [mainGenre, otherGenres]);

  const countryOptions = useMemo(() => {
    const localeTag = locale === "nl" ? "nl-NL" : "en-US";
    return SUPPORTED_COUNTRY_ISOS.map((iso) => ({
      iso,
      name: getLocalizedCountryName(iso, locale),
    })).sort((a, b) =>
      a.name.localeCompare(b.name, localeTag, { sensitivity: "base" }),
    );
  }, [locale]);

  const previewAlbum = useMemo(
    () => ({
      id: 0,
      title: title.trim() ? title.trim() : t(locale, "title"),
      artist: artistDisplay.trim() ? artistDisplay.trim() : t(locale, "artist"),
      artists: cleanedArtists.length ? cleanedArtists : undefined,
      primaryArtist: cleanedArtists[0] || undefined,
      cover_image: coverPreview,
      year,
      catno: catno.trim() || undefined,
      genre: genreList.length ? genreList : undefined,
    }),
    [
      artistDisplay,
      catno,
      cleanedArtists,
      coverPreview,
      genreList,
      locale,
      title,
      year,
    ],
  );

  const previewDetails = useMemo<DiscogsReleaseDetails>(() => {
    const mainArtists: DiscogsArtist[] = cleanedArtists.map((name) => ({
      name,
    }));

    const mappedExtraArtists: DiscogsArtist[] = extraArtists
      .map((a) => ({ name: a.name.trim(), role: a.role.trim() || undefined }))
      .filter((a) => a.name);

    const mappedLabels: DiscogsLabel[] = labels
      .map((l) => ({ name: l.name.trim(), catno: "" }))
      .filter((l) => l.name)
      .map((l) => ({
        name: l.name || t(locale, "unknownValue"),
        catno: "",
      }));

    const tracklist: DiscogsTrack[] =
      tracklistMode === "sides"
        ? sides
            .flatMap((sideDraft) => {
              const side = sideDraft.side.trim().toUpperCase() || "A";
              return sideDraft.tracks.map((trackDraft, index) => ({
                position: `${side}${index + 1}`,
                title: trackDraft.title.trim(),
                duration: trackDraft.duration.trim() || undefined,
              }));
            })
            .filter((track) => track.title)
        : tracks
            .map((trackDraft, index) => ({
              position: `${index + 1}`,
              title: trackDraft.title.trim(),
              duration: trackDraft.duration.trim() || undefined,
            }))
            .filter((track) => track.title);

    const allPreviewUris = [
      coverImage?.previewUrl,
      ...extraImages.map((img) => img.previewUrl),
    ].filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );

    const mappedImages: DiscogsImage[] = allPreviewUris.map((uri, index) => ({
      type: index === 0 ? "primary" : "secondary",
      uri,
      width: 0,
      height: 0,
    }));

    return {
      title: title.trim(),
      released: releasedISO.trim(),
      country: countryISO.trim().toUpperCase(),
      notes,
      artists: mainArtists,
      extraartists: mappedExtraArtists,
      genre: genreList,
      style: styles.map((s) => s.trim()).filter(Boolean),
      tracklist,
      format: formats.map((f) => f.trim()).filter(Boolean),
      text: "",
      qty: qty ?? 0,
      labels: mappedLabels,
      ratings: { average: 0, count: 0 },
      images: mappedImages,
      series: series.trim(),
    };
  }, [
    cleanedArtists,
    coverImage,
    countryISO,
    extraArtists,
    extraImages,
    formats,
    genreList,
    labels,
    locale,
    notes,
    qty,
    releasedISO,
    sides,
    series,
    styles,
    tracklistMode,
    tracks,
    title,
  ]);

  const onSelectCoverImage = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setCoverImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  };

  const clearCoverImage = () => {
    setCoverImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  };

  const onSelectExtraImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setExtraImages((prev) => {
      const next = [...prev];
      for (const file of Array.from(files)) {
        next.push({ file, previewUrl: URL.createObjectURL(file) });
      }
      return next;
    });
  };

  const removeExtraImageAt = (index: number) => {
    setExtraImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const validate = () => {
    const missing: string[] = [];
    if (!title.trim()) missing.push(t(locale, "title"));
    if (cleanedArtists.length === 0) missing.push(t(locale, "artist"));
    if (!releaseType.trim()) missing.push(t(locale, "releaseType"));
    if (!coverImage) missing.push(t(locale, "coverImage"));

    const numericIssues: string[] = [];
    if (qtyInput.trim() && qty === undefined)
      numericIssues.push(t(locale, "nrOfRecords"));
    if (releasedInput.trim() && !releasedParsed.valid) {
      setFormError(t(locale, "releasedInvalid"));
      return false;
    }

    if (missing.length > 0) {
      setFormError(t(locale, "customEntryMissingRequired", missing.join(", ")));
      return false;
    }

    if (numericIssues.length > 0) {
      setFormError(
        t(locale, "customEntryInvalidNumbers", numericIssues.join(", ")),
      );
      return false;
    }

    setFormError(null);
    return true;
  };

  const addTrack = () => {
    setTracks((prev) => [...prev, { title: "", duration: "" }]);
  };

  const removeTrack = (trackIndex: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== trackIndex));
  };

  const addSide = () => {
    setSides((prev) => [
      ...prev,
      { side: "", tracks: [{ title: "", duration: "" }] },
    ]);
  };

  const removeSideAt = (sideIndex: number) => {
    setSides((prev) => prev.filter((_, i) => i !== sideIndex));
  };

  const addSideTrack = (sideIndex: number) => {
    setSides((prev) => {
      const next = [...prev];
      next[sideIndex] = {
        ...next[sideIndex],
        tracks: [...next[sideIndex].tracks, { title: "", duration: "" }],
      };
      return next;
    });
  };

  const removeSideTrack = (sideIndex: number, trackIndex: number) => {
    setSides((prev) => {
      const next = [...prev];
      const current = next[sideIndex];
      next[sideIndex] = {
        ...current,
        tracks: current.tracks.filter((_, i) => i !== trackIndex),
      };
      return next;
    });
  };

  const persist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSubmitting(true);
    setFormError(null);

    const customId = createCustomAlbumId();
    const detailsRef = `c_${Math.abs(customId)}`;

    try {
      const uploadedUris: string[] = [];

      if (coverImage) {
        const safeName = coverImage.file.name.replaceAll("/", "_");
        const objectRef = storageRef(
          storage,
          `users/${user.uid}/custom-albums/${detailsRef}/cover-${safeName}`,
        );
        await uploadBytes(objectRef, coverImage.file);
        uploadedUris.push(await getDownloadURL(objectRef));
      }

      for (let index = 0; index < extraImages.length; index++) {
        const img = extraImages[index];
        const safeName = img.file.name.replaceAll("/", "_");
        const objectRef = storageRef(
          storage,
          `users/${user.uid}/custom-albums/${detailsRef}/extra-${index}-${safeName}`,
        );
        await uploadBytes(objectRef, img.file);
        uploadedUris.push(await getDownloadURL(objectRef));
      }

      const storedDetails: DiscogsReleaseDetails = {
        ...previewDetails,
        images: uploadedUris.map((uri, index) => ({
          type: index === 0 ? "primary" : "secondary",
          uri,
          width: 0,
          height: 0,
        })),
      };

      await setDoc(
        doc(db, "AlbumDetails", detailsRef),
        {
          details: storedDetails,
          custom: true,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const destination =
        saveTarget === "collection" ? "Collection" : "Wishlist";
      const storedArtists = cleanedArtists;
      const storedArtistDisplay = storedArtists.join(" & ");
      await setDoc(
        doc(db, "users", user.uid, destination, customId.toString()),
        {
          id: customId,
          title: title.trim(),
          artist: storedArtistDisplay,
          artists: storedArtists,
          primaryArtist: storedArtists[0] || "",
          cover_image: uploadedUris[0] || "",
          releaseType: releaseType.trim() || null,
          genre: genreList,
          year: year ?? null,
          catno: catno.trim() || null,
          master_id: null,
          detailsRef,
          addedAt: serverTimestamp(),
          source: "custom",
        },
      );

      setConfirmOpen(false);

      if (typeof window !== "undefined") {
        (
          window as Window & {
            addToast?: (payload: {
              message: string;
              icon: typeof Plus;
              bgColor: string;
              textColor: string;
              iconBgColor: string;
              iconBorderColor: string;
            }) => void;
          }
        ).addToast?.({
          message: t(
            locale,
            "customEntryAdded",
            title.trim(),
            cleanedArtists.join(" & "),
          ),
          icon: Plus,
          bgColor: "bg-green-100",
          textColor: "text-green-900",
          iconBgColor: "bg-green-200",
          iconBorderColor: "border-green-400",
        });
      }

      setTitle("");
      setArtists([""]);
      setReleaseType("");
      setMainGenre("");
      setOtherGenres([]);
      setStyles([]);
      setFormats(["Vinyl", "LP"]);
      setCatno("");
      setReleasedInput("");
      setCountryISO("");
      setSeries("");
      setNotes("");
      setQtyInput("1");
      setTracklistMode("continuous");
      setLabels([]);
      setExtraArtists([]);
      setTracks([{ title: "", duration: "" }]);
      setSides([
        { side: "A", tracks: [{ title: "", duration: "" }] },
        { side: "B", tracks: [{ title: "", duration: "" }] },
      ]);
      setCoverImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
      setExtraImages((prev) => {
        for (const img of prev) URL.revokeObjectURL(img.previewUrl);
        return [];
      });
    } catch (error) {
      console.error(error);
      setFormError(t(locale, "customEntrySaveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  return (
    <div className="custom-entry flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{t(locale, "customEntry")}</h3>
          <p className="text-sm custom-entry__hint">
            {t(locale, "customEntryHelp")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SectionPanel title={t(locale, "required")} className="space-y-8">
          {/* ===== BASIC INFO ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <label className="flex flex-col gap-2 text-sm">
              <span>{t(locale, "title")} *</span>
              <input
                className="border rounded px-3 py-2 custom-entry__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(locale, "title")}
              />
            </label>

            {/* Release type */}
            <label className="flex flex-col gap-2 text-sm">
              <span>{t(locale, "releaseType")} *</span>
              <select
                className="border rounded px-3 py-2 custom-entry__input"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value)}
              >
                <option value="">{t(locale, "select")}</option>
                <option value="Album">Album</option>
                <option value="EP">EP</option>
                <option value="Single">Single</option>
                <option value="Compilation">Compilation</option>
                <option value="CD">CD</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          {/* ===== ARTISTS ===== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t(locale, "artist")} *
              </span>
              <button
                type="button"
                className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                onClick={() => setArtists((prev) => [...prev, ""])}
                title={t(locale, "addArtist")}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  {t(locale, "addValue")}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {artists.map((value, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-2 sm:items-center"
                >
                  <input
                    className="flex-1 border rounded px-3 py-2 custom-entry__input"
                    value={value}
                    onChange={(e) =>
                      setArtists((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      })
                    }
                    placeholder={
                      index === 0
                        ? t(locale, "artist")
                        : t(locale, "artistAdditional")
                    }
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                    onClick={() =>
                      setArtists((prev) => prev.filter((_, i) => i !== index))
                    }
                    title={t(locale, "remove")}
                    disabled={artists.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <span className="text-xs custom-entry__hint">
              {t(locale, "artistsHelp")}
            </span>
          </div>

          {/* ===== COVER IMAGE ===== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t(locale, "coverImage")} *
                </span>
                <span className="text-xs custom-entry__hint">
                  {t(locale, "coverImagesHint")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                  onClick={() => coverLibraryInputRef.current?.click()}
                  title={t(locale, "addImage")}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">
                    {t(locale, "addValue")}
                  </span>
                </button>

                <button
                  type="button"
                  className="h-9 w-9 rounded cursor-pointer flex items-center justify-center custom-entry__btn__add sm:hidden"
                  onClick={() => coverCameraInputRef.current?.click()}
                  title={t(locale, "takePhoto")}
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={coverLibraryInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onSelectCoverImage(e.target.files)}
                />
                <input
                  ref={coverCameraInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onSelectCoverImage(e.target.files)}
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden custom-entry__thumb p-4 flex items-center gap-4">
              <img
                src={coverPreview}
                alt={t(locale, "coverImage")}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {coverImage
                    ? coverImage.file.name
                    : t(locale, "noImageSelected")}
                </p>
                <p className="text-xs custom-entry__hint">
                  {coverImage
                    ? t(locale, "coverSelected")
                    : t(locale, "coverRequired")}
                </p>
              </div>

              {coverImage && (
                <button
                  type="button"
                  className="h-9 w-9 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                  onClick={clearCoverImage}
                  title={t(locale, "remove")}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ===== EXTRA IMAGES ===== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Extra {t(locale, "images").toLowerCase()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                  onClick={() => extraLibraryInputRef.current?.click()}
                  title={t(locale, "addImages")}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">
                    {t(locale, "addValue")}
                  </span>
                </button>

                <button
                  type="button"
                  className="h-9 w-9 rounded cursor-pointer flex items-center justify-center custom-entry__btn__add sm:hidden"
                  onClick={() => extraCameraInputRef.current?.click()}
                  title={t(locale, "takePhoto")}
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={extraLibraryInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onSelectExtraImages(e.target.files)}
                />
                <input
                  ref={extraCameraInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onSelectExtraImages(e.target.files)}
                />
              </div>
            </div>

            {extraImages.length === 0 ? (
              <p className="text-xs custom-entry__hint">
                {t(locale, "customEntryOptional")}
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {extraImages.map((img, index) => (
                  <div
                    key={img.previewUrl}
                    className="relative rounded-lg overflow-hidden custom-entry__thumb"
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Extra ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-7 w-7 rounded flex items-center justify-center custom-entry__btn__delete"
                      onClick={() => removeExtraImageAt(index)}
                      title={t(locale, "remove")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionPanel>

        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionPanel title={t(locale, "optionalDetails")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>{t(locale, "albumDetailsReleased")}</span>
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded px-3 py-2 custom-entry__input flex-1"
                    value={releasedInput}
                    onChange={(e) => setReleasedInput(e.target.value)}
                    placeholder={t(locale, "releasedPlaceholder")}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="h-10 w-10 rounded cursor-pointer flex items-center justify-center custom-entry__btn__add"
                    onClick={() => {
                      const input = datePickerRef.current;
                      if (!input) return;
                      if (typeof input.showPicker === "function")
                        input.showPicker();
                      else input.click();
                    }}
                    title={t(locale, "fullDate")}
                  >
                    <Calendar size={16} />
                  </button>
                  <input
                    ref={datePickerRef}
                    className="hidden"
                    type="date"
                    onChange={(e) =>
                      setReleasedInput(toReleasedDisplay(e.target.value))
                    }
                  />
                </div>
                <span className="text-xs custom-entry__hint">
                  {t(locale, "releasedHelp")}
                </span>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span>{t(locale, "nrOfRecords")}</span>
                <input
                  className="border rounded px-3 py-2 custom-entry__input"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  type="number"
                  min={0}
                  step={1}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>{t(locale, "labelNr")}</span>
                <input
                  className="border rounded px-3 py-2 custom-entry__input"
                  value={catno}
                  onChange={(e) => setCatno(e.target.value)}
                  placeholder="CAT-001"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>{t(locale, "albumDetailsCountry")}</span>
                <select
                  className="border rounded px-3 py-2 custom-entry__input"
                  value={countryISO}
                  onChange={(e) => setCountryISO(e.target.value)}
                >
                  <option value="">{t(locale, "select")}</option>
                  {countryOptions.map((opt) => (
                    <option key={opt.iso} value={opt.iso}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs custom-entry__hint">
                  {t(locale, "countryHelp")}
                </span>
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>{t(locale, "albumDetailsSeries")}</span>
                <input
                  className="border rounded px-3 py-2 custom-entry__input"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  placeholder={t(locale, "seriesPlaceholder")}
                />
                <span className="text-xs custom-entry__hint">
                  {t(locale, "seriesHelp")}
                </span>
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>{t(locale, "albumDetailsNotes")}</span>
                <textarea
                  className="border rounded px-3 py-2 min-h-24 custom-entry__input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t(locale, "notesPlaceholder")}
                />
                <span className="text-xs custom-entry__hint">
                  {t(locale, "notesHelp")}
                </span>
              </label>
            </div>
          </SectionPanel>

          <SectionPanel title={t(locale, "genre")}>
            <p className="text-sm custom-entry__hint">
              {t(locale, "genreHelp")}
            </p>

            <label className="flex flex-col gap-1 text-sm">
              <span>{t(locale, "mainGenre")}</span>
              <input
                className="border rounded px-3 py-2 w-full custom-entry__input"
                value={mainGenre}
                onChange={(e) => setMainGenre(e.target.value)}
                placeholder="Rock"
              />
            </label>

            <div className="flex items-center justify-between gap-3 mt-2">
              <span className="text-sm font-medium">
                {t(locale, "otherGenres")}
              </span>
              <button
                type="button"
                className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                onClick={() => setOtherGenres((prev) => [...prev, ""])}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  {t(locale, "addValue")}
                </span>
              </button>
            </div>

            {otherGenres.length > 0 && (
              <div className="flex flex-col gap-2">
                {otherGenres.map((g, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      className="border rounded px-3 py-2 w-full custom-entry__input"
                      value={g}
                      onChange={(e) =>
                        setOtherGenres((prev) => {
                          const next = [...prev];
                          next[index] = e.target.value;
                          return next;
                        })
                      }
                      placeholder={t(locale, "customEntryAlternative")}
                    />
                    <button
                      type="button"
                      className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__remove"
                      onClick={() =>
                        setOtherGenres((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      title={t(locale, "remove")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          <ValueListEditor
            locale={locale}
            title={t(locale, "styles")}
            helpText={t(locale, "stylesHelp")}
            values={styles}
            setValues={setStyles}
            addLabel={t(locale, "addValue")}
            placeholder="Indie Rock"
          />

          <ValueListEditor
            locale={locale}
            title={t(locale, "formats")}
            helpText={t(locale, "formatsHelp")}
            values={formats}
            setValues={setFormats}
            addLabel={t(locale, "addValue")}
            placeholder="Vinyl"
            datalistId="custom-entry-format-suggestions"
            datalistOptions={[
              "Vinyl",
              "LP",
              "EP",
              "Single",
              '12"',
              '10"',
              '7"',
              "CD",
              "Cassette",
              "Compilation",
            ]}
          />

          <SectionPanel
            title={t(locale, "albumDetailsExtraArtists")}
            headerRight={
              <button
                type="button"
                className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                onClick={() =>
                  setExtraArtists((prev) => [...prev, { name: "", role: "" }])
                }
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  {t(locale, "addValue")}
                </span>
              </button>
            }
          >
            {extraArtists.length === 0 ? (
              <p className="text-sm custom-entry__hint">
                {t(locale, "customEntryOptional")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {extraArtists.map((a, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end"
                  >
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span>{t(locale, "artist")}</span>
                      <input
                        className="border rounded px-3 py-2 custom-entry__input"
                        value={a.name}
                        onChange={(e) =>
                          setExtraArtists((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              name: e.target.value,
                            };
                            return next;
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span>{t(locale, "role")}</span>
                      <input
                        className="border rounded px-3 py-2 custom-entry__input"
                        value={a.role}
                        onChange={(e) =>
                          setExtraArtists((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              role: e.target.value,
                            };
                            return next;
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                      onClick={() =>
                        setExtraArtists((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      title={t(locale, "remove")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          <SectionPanel
            title={t(locale, "albumDetailsLabels")}
            headerRight={
              <button
                type="button"
                className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                onClick={() => setLabels((prev) => [...prev, { name: "" }])}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  {t(locale, "addValue")}
                </span>
              </button>
            }
          >
            {labels.length === 0 ? (
              <p className="text-sm custom-entry__hint">
                {t(locale, "customEntryOptional")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {labels.map((l, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end"
                  >
                    <label className="flex flex-col gap-1 text-sm sm:col-span-5">
                      <span>{t(locale, "label")}</span>
                      <input
                        className="border rounded px-3 py-2 custom-entry__input"
                        value={l.name}
                        onChange={(e) =>
                          setLabels((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              name: e.target.value,
                            };
                            return next;
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                      onClick={() =>
                        setLabels((prev) => prev.filter((_, i) => i !== index))
                      }
                      title={t(locale, "remove")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          <SectionPanel className="lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <h4 className="font-semibold">
                  {t(locale, "albumDetailsTracklist")}
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className={`h-10 px-5 rounded-xl flex items-center justify-center gap-2 tracklist__btn ${
                      tracklistMode === "continuous"
                        ? "tracklist__btn--active"
                        : ""
                    }`}
                    onClick={() => setTracklistMode("continuous")}
                  >
                    {t(locale, "tracklistContinuous")}
                  </button>

                  <button
                    type="button"
                    className={`h-10 px-5 rounded-xl flex items-center justify-center gap-2 tracklist__btn ${
                      tracklistMode === "sides" ? "tracklist__btn--active" : ""
                    }`}
                    onClick={() => setTracklistMode("sides")}
                  >
                    {t(locale, "tracklistSides")}
                  </button>
                </div>
              </div>

              {tracklistMode === "continuous" ? (
                <button
                  type="button"
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                  onClick={addTrack}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">
                    {t(locale, "addValue")}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                  onClick={addSide}
                  title={t(locale, "addSide")}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">
                    {t(locale, "addValue")}
                  </span>
                </button>
              )}
            </div>

            {tracklistMode === "continuous" ? (
              <div className="flex flex-col gap-2">
                {tracks.map((track, trackIndex) => (
                  <div
                    key={trackIndex}
                    className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end rounded-lg p-3 custom-entry__thumb"
                  >
                    <label className="flex flex-col gap-1 text-sm sm:col-span-4">
                      <span>{t(locale, "title")}</span>
                      <input
                        className="border rounded px-3 py-2 custom-entry__input"
                        value={track.title}
                        onChange={(e) =>
                          setTracks((prev) => {
                            const next = [...prev];
                            next[trackIndex] = {
                              ...next[trackIndex],
                              title: e.target.value,
                            };
                            return next;
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-1">
                      <span>{t(locale, "duration")}</span>
                      <input
                        className="border rounded px-3 py-2 custom-entry__input"
                        value={track.duration}
                        onChange={(e) =>
                          setTracks((prev) => {
                            const next = [...prev];
                            next[trackIndex] = {
                              ...next[trackIndex],
                              duration: e.target.value,
                            };
                            return next;
                          })
                        }
                        placeholder="3:45"
                      />
                    </label>
                    <button
                      type="button"
                      className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                      onClick={() => removeTrack(trackIndex)}
                      title={t(locale, "remove")}
                      disabled={tracks.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sides.map((sideDraft, sideIndex) => (
                  <div
                    key={`${sideIndex}-${sideDraft.side}`}
                    className="rounded-lg p-3 custom-entry__thumb flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="custom-entry__hint">
                          {t(locale, "side")}
                        </span>
                        <input
                          className="border rounded px-3 py-2 w-20 custom-entry__input"
                          value={sideDraft.side}
                          onChange={(e) =>
                            setSides((prev) => {
                              const next = [...prev];
                              next[sideIndex] = {
                                ...next[sideIndex],
                                side: e.target.value,
                              };
                              return next;
                            })
                          }
                          placeholder="A"
                          autoComplete="off"
                        />
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
                          onClick={() => addSideTrack(sideIndex)}
                          title={t(locale, "addTrack")}
                        >
                          <Plus size={16} />
                          <span className="hidden sm:inline">
                            {t(locale, "addValue")}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                          onClick={() => removeSideAt(sideIndex)}
                          title={t(locale, "remove")}
                          disabled={sides.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {sideDraft.tracks.map((track, trackIndex) => (
                        <div
                          key={trackIndex}
                          className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end"
                        >
                          <label className="flex flex-col gap-1 text-sm sm:col-span-4">
                            <span>{t(locale, "title")}</span>
                            <input
                              className="border rounded px-3 py-2 custom-entry__input"
                              value={track.title}
                              onChange={(e) =>
                                setSides((prev) => {
                                  const next = [...prev];
                                  const current = next[sideIndex];
                                  const nextTracks = [...current.tracks];
                                  nextTracks[trackIndex] = {
                                    ...nextTracks[trackIndex],
                                    title: e.target.value,
                                  };
                                  next[sideIndex] = {
                                    ...current,
                                    tracks: nextTracks,
                                  };
                                  return next;
                                })
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm sm:col-span-1">
                            <span>{t(locale, "duration")}</span>
                            <input
                              className="border rounded px-3 py-2 custom-entry__input"
                              value={track.duration}
                              onChange={(e) =>
                                setSides((prev) => {
                                  const next = [...prev];
                                  const current = next[sideIndex];
                                  const nextTracks = [...current.tracks];
                                  nextTracks[trackIndex] = {
                                    ...nextTracks[trackIndex],
                                    duration: e.target.value,
                                  };
                                  next[sideIndex] = {
                                    ...current,
                                    tracks: nextTracks,
                                  };
                                  return next;
                                })
                              }
                              placeholder="3:45"
                            />
                          </label>
                          <button
                            type="button"
                            className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                            onClick={() =>
                              removeSideTrack(sideIndex, trackIndex)
                            }
                            title={t(locale, "remove")}
                            disabled={sideDraft.tracks.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        </div>

        <div className="flex flex-col gap-4 lg:row-start-1 lg:col-start-2">
          <SectionPanel title={t(locale, "customEntryPreviewCard")}>
            <div className="flex justify-center">
              <div className="w-[200px] max-w-[200px]">
                <AlbumCard
                  album={previewAlbum}
                  releaseType={releaseType || t(locale, "releaseType")}
                  mainGenre={genreList[0]}
                  artist={previewAlbum.artist}
                  title={previewAlbum.title}
                  interactive={false}
                  collectionAction="disabled"
                  wishlistAction="disabled"
                  buttons={{}}
                />
              </div>
            </div>
            <p className="text-sm custom-entry__hint">
              {t(locale, "customEntryPreviewHint")}
            </p>
          </SectionPanel>
        </div>
      </div>

      {formError && (
        <div className="custom-entry__error p-3 rounded text-sm">
          {formError}
        </div>
      )}

      <ActionBar
        locale={locale}
        saveTarget={saveTarget}
        setSaveTarget={setSaveTarget}
        onOpenPreview={() => setPreviewOpen(true)}
        onSubmit={submit}
        submitting={submitting}
      />

      <AlbumDetailsModal
        open={previewOpen}
        album={previewAlbum}
        artist={previewAlbum.artist}
        displayTitle={previewAlbum.title}
        detailsOverride={previewDetails}
        hideActions={true}
        onClose={() => setPreviewOpen(false)}
      />

      <MessageModal
        open={confirmOpen}
        title={t(
          locale,
          "customEntryConfirmTitle",
          title.trim() || t(locale, "title"),
          artistDisplay.trim() || t(locale, "artist"),
          saveTarget === "collection"
            ? t(locale, "collection")
            : t(locale, "wishlist"),
        )}
        message={t(locale, "customEntryConfirmMessage")}
        background="green"
        color="black"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (submitting) return;
          void persist();
        }}
      />
    </div>
  );
}

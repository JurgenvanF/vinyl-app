"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";
import AlbumDetailsModal from "../../modal/AlbumDetailsModal";
import VinylSpinner from "../../../spinner/VinylSpinner";
import AlbumCard from "../../card/AlbumCard";
import { auth, db } from "../../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Scan, ScanBarcode } from "lucide-react";

import "./Barcode.scss";

type DiscogsRelease = {
  id: number;
  title: string;
  artist?: string;
  artists?: Array<string | { name?: string }>;
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

export default function Barcode() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasScannedRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [scanResults, setScanResults] = useState<DiscogsRelease[]>([]);

  const [collectionIds, setCollectionIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const { locale } = useLanguage();
  const [selectedAlbum, setSelectedAlbum] = useState<{
    album: DiscogsRelease;
    artist: string;
    title: string;
  } | null>(null);

  const popularityScore = (release: DiscogsRelease) =>
    (release.have || 0) + (release.want || 0);

  const getMainGenre = (genres?: string[]) => {
    if (!genres || genres.length === 0) return undefined;
    return genres[0].split(/[,/]/)[0].trim();
  };

  const getReleaseType = (formats?: string[], type?: string) => {
    if (type === "master") return "Album";
    if (!formats || formats.length === 0) return undefined;
    const meaningful = formats.find((f) =>
      /LP|Single|EP|CD|Compilation/i.test(f),
    );
    if (!meaningful) return undefined;

    if (/LP/i.test(meaningful)) return "Album";
    return meaningful;
  };

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

    void fetchUserData();
  }, []);

  const startScanner = async () => {
    if (isRunning) return;

    setError(null);
    setScannedText(null);
    setIsRunning(true);
    hasScannedRef.current = false;
    setScanResults([]);
    setSelectedAlbum(null);

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (!videoRef.current) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      }

      const videoElement = videoRef.current;
      if (!videoElement) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setError(t(locale, "barcodeErrorPreviewMountFailed"));
        setIsRunning(false);
        return;
      }
      videoElement.srcObject = stream;

      try {
        await videoElement.play();
      } catch {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setError(t(locale, "barcodeErrorAutoplayBlocked"));
        setIsRunning(false);
        return;
      }

      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoElement,
        async (result) => {
          if (!result || hasScannedRef.current) return;
          hasScannedRef.current = true;

          const scanned = result.getText();
          setScannedText(scanned);
          const cleanBarcode = scanned.replace(/\D/g, "");

          // Stop scanning immediately
          controls.stop();
          scannerControlsRef.current = null;
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (videoRef.current) videoRef.current.srcObject = null;
          codeReaderRef.current = null;
          setIsRunning(false);

          try {
            setLookupLoading(true);
            const res = await fetch(
              `/api/discogs-barcode?barcode=${cleanBarcode}`,
            );
            const data = (await res.json()) as { results?: DiscogsRelease[] };
            const results = data.results ?? [];

            if (results.length === 0) {
              setError(t(locale, "barcodeErrorNoAlbumFound"));
              return;
            }

            const uniqueResultsMap = new Map<string, DiscogsRelease>();
            for (const r of results) {
              const key = r.master_id ? `m${r.master_id}` : `r${r.id}`;
              if (!uniqueResultsMap.has(key)) {
                uniqueResultsMap.set(key, r);
              }
            }

            let uniqueResults = Array.from(uniqueResultsMap.values());
            const masters = uniqueResults.filter((r) => r.type === "master");
            const nonMasters = uniqueResults.filter((r) => r.type !== "master");

            masters.sort((a, b) => popularityScore(b) - popularityScore(a));
            nonMasters.sort((a, b) => popularityScore(b) - popularityScore(a));
            uniqueResults = [...masters, ...nonMasters];

            setScanResults(uniqueResults);

            if (uniqueResults.length === 1) {
              const only = uniqueResults[0];
              const { artist, title } = splitDiscogsTitle(
                only.title,
                only.artist,
              );
              setSelectedAlbum({ album: only, artist, title });
            }
          } catch (err) {
            console.error(err);
            setError(t(locale, "barcodeErrorFetchAlbumData"));
          } finally {
            setLookupLoading(false);
          }
        },
      );

      scannerControlsRef.current = controls;
    } catch {
      setError(t(locale, "barcodeErrorCameraDenied"));
      setIsRunning(false);
    }
  };

  const stopScanner = () => {
    if (scannerControlsRef.current) {
      scannerControlsRef.current.stop();
      scannerControlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
    codeReaderRef.current = null;
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="scanner w-full max-w-md mx-auto space-y-4">
        {/* Scanner Card */}
        <div className="scanner__card relative border rounded-2xl shadow-lg overflow-hidden aspect-video flex items-center justify-center transition-all duration-300">
          {isRunning ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />

              {/* Overlay */}
              <div className="scanner__overlay-border absolute inset-0 border-4 rounded-2xl pointer-events-none" />
              <div className="scanner__overlay-bg absolute inset-0 animate-pulse pointer-events-none" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="scanner__empty-icon p-6 rounded-full shadow-inner">
                <ScanBarcode size={60} />
              </div>

              <div>
                <p className="scanner__title text-lg font-semibold">
                  {t(locale, "readyToScan")}
                </p>
                <p className="scanner__subtitle text-sm">
                  {t(locale, "clickBelowToStartCamera")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center">
          {!isRunning ? (
            <button
              onClick={startScanner}
              className="scanner__btn--start flex items-center gap-2 px-6 py-2.5 active:scale-95 transition-all duration-200 font-medium rounded-xl shadow-md cursor-pointer"
            >
              <Scan size={20} />
              {t(locale, "startScanner")}
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="scanner__btn--stop px-6 py-2.5 active:scale-95 transition-all duration-200 font-medium rounded-xl shadow-md cursor-pointer"
            >
              {t(locale, "stopScanner")}
            </button>
          )}
        </div>

        {/* Feedback Section */}
        <div className="flex flex-col items-center gap-3 min-h-[24px]">
          {scannedText && (
            <p className="scanner__badge text-sm rounded-lg px-3 py-2 inline-block">
              <span className="font-medium">{t(locale, "barcode")}:</span>{" "}
              {scannedText}
            </p>
          )}

          {error && (
            <p className="scanner__error text-sm rounded-lg px-3 py-2 inline-block">
              {error}
            </p>
          )}
        </div>

        {/* Loader */}
        {lookupLoading && (
          <div className="flex justify-center pt-2">
            <VinylSpinner />
          </div>
        )}
      </div>

      {!lookupLoading && scanResults.length > 0 && (
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {scanResults.map((album) => {
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
                  key={`${album.type ?? ""}-${album.id}`}
                  album={album}
                  mainGenre={mainGenre}
                  releaseType={releaseType}
                  artist={artist}
                  title={title}
                  onCardClick={() => setSelectedAlbum({ album, artist, title })}
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
    </div>
  );
}

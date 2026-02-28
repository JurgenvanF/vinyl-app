"use client";

import { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Barcode() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [jsonResult, setJsonResult] = useState<any>(null);

  const startScanner = async () => {
    if (isRunning) return;

    setError(null);
    setScannedText(null);
    setJsonResult(null);
    setIsRunning(true);
    setHasScanned(false);

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      const videoElement = videoRef.current!;
      videoElement.srcObject = stream;

      try {
        await videoElement.play();
      } catch {
        setError("Browser blocked camera autoplay. Tap Start again.");
        setIsRunning(false);
        return;
      }

      codeReader.decodeFromVideoDevice(
        undefined,
        videoElement,
        async (result) => {
          if (!result || hasScanned) return;
          setHasScanned(true);

          const scanned = result.getText();
          setScannedText(scanned);
          const cleanBarcode = scanned.replace(/\D/g, "");

          // STOP scanner and release camera immediately
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (videoRef.current) videoRef.current.srcObject = null;
          codeReaderRef.current = null;
          setIsRunning(false);

          try {
            // FIRST: Discogs
            const discogsRes = await fetch(
              `/api/search?barcode=${cleanBarcode}`,
            );
            const discogsData = await discogsRes.json();

            if (discogsData.results && discogsData.results.length > 0) {
              setJsonResult({ source: "Discogs", data: discogsData });
            } else {
              // FALLBACK: MusicBrainz
              const mbRes = await fetch(
                `https://musicbrainz.org/ws/2/release/?query=barcode:${cleanBarcode}&fmt=json&limit=5`,
                {
                  headers: {
                    "User-Agent": "MijnNedbase/1.0 (email@example.com)",
                  },
                },
              );
              const mbData = await mbRes.json();
              setJsonResult({ source: "MusicBrainz", data: mbData });
            }
          } catch {
            setError("Error fetching album data.");
          }
        },
      );
    } catch {
      setError("Camera access denied or unavailable.");
      setIsRunning(false);
    }
  };

  const stopScanner = () => {
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
      <video
        ref={videoRef}
        className="w-full max-w-md border border-gray-300 rounded"
      />

      {!isRunning ? (
        <button
          onClick={startScanner}
          className="px-4 py-2 bg-orange-500 text-white rounded"
        >
          Start Scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop Scanner
        </button>
      )}

      {scannedText && <p className="text-gray-700">Scanned: {scannedText}</p>}

      {jsonResult && (
        <div className="flex flex-col items-start gap-2 max-w-md w-full">
          <p className="text-gray-600 font-semibold">
            Source: {jsonResult.source}
          </p>
          <pre className="text-sm text-gray-800 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(jsonResult.data, null, 2)}
          </pre>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

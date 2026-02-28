"use client";

import { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";

export default function Barcode() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null); // NEW
  const [isRunning, setIsRunning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const startScanner = async () => {
    if (isRunning) return;

    setError(null);
    setScannedText(null);
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
      } catch (e) {
        setError("Browser blocked camera autoplay. Tap Start again.");
        setIsRunning(false);
        return;
      }

      await codeReader.decodeFromVideoDevice(
        undefined,
        videoElement,
        async (result) => {
          if (result && !hasScanned) {
            setHasScanned(true);

            const scanned = result.getText();
            setScannedText(scanned); // set scanned text
            const cleanBarcode = scanned.replace(/\D/g, "");

            try {
              const res = await fetch(`/api/search?barcode=${cleanBarcode}`);
              const data = await res.json();

              if (data.results && data.results.length > 0) {
                const releaseId = data.results[0].id;
                router.push(`/album/${releaseId}`);
              } else {
                setError("Album not found.");
              }
            } catch {
              setError("Error fetching album.");
            } finally {
              stopScanner();
            }
          }
        },
      );
    } catch (err) {
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
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

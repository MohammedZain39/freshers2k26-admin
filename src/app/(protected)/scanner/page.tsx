// src/app/scanner/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  UserRound,
  MapPin,
  Clock3,
  QrCode,
} from 'lucide-react';
import PageShell from '@/components/PageShell';
import AuthGuard from "@/components/AuthGuard";

type ScanResult = {
  authorized: boolean;
  reason: string;
  volunteer?: {
    id: string;
    name: string;
    collegeId: string;
    department?: string | null;
    year?: string | null;
    role: string;
  };
  duty?: {
    team: string;
    location: string;
    startTime: string;
    endTime: string;
    description?: string | null;
  };
};

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] =
    useState<ScanResult | null>(null);

  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const scanIntervalRef =
    useRef<NodeJS.Timeout | null>(null);

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const verifyToken = async (token: string) => {
    if (!token.trim() || loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        '/api/scanner/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrToken: token.trim(),
          }),
        }
      );

      const data = await response.json();

      setResult(data);

      if (data.authorized) {
        stopScanner();
      }
    } catch (error) {
      console.error(error);

      setResult({
        authorized: false,
        reason:
          'Unable to connect to the verification server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setResult(null);

      if (
        !('BarcodeDetector' in window)
      ) {
        alert(
          'QR camera scanning is not supported by this browser. Use the manual QR token field for testing.'
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      const detector =
        new (
          window as any
        ).BarcodeDetector({
          formats: ['qr_code'],
        });

      scanIntervalRef.current =
        setInterval(async () => {
          if (
            !videoRef.current ||
            videoRef.current.readyState <
              2
          ) {
            return;
          }

          try {
            const codes =
              await detector.detect(
                videoRef.current
              );

            if (
              codes.length > 0 &&
              codes[0].rawValue
            ) {
              const value =
                codes[0].rawValue;

              await verifyToken(value);
            }
          } catch (error) {
            console.error(
              'QR detection error:',
              error
            );
          }
        }, 500);
    } catch (error) {
      console.error(error);

      alert(
        'Camera access was denied or unavailable.'
      );
    }
  };

  const reset = () => {
    stopScanner();
    setResult(null);
    setManualToken('');
  };

  return (
    <AuthGuard>
    <PageShell
      title="Verify QR"
      subtitle="Scan a volunteer ID card and verify their current event authorization."
    >
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">

        {/* Scanner */}

        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02]">

          <div className="border-b border-white/[0.06] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-300/10 bg-violet-300/[0.06]">
                <QrCode
                  size={19}
                  className="text-violet-200/70"
                />
              </div>

              <div>
                <p className="text-sm font-medium">
                  QR Scanner
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Point the camera at a volunteer ID card.
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/[0.07] bg-black">

              {scanning ? (
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center">

                  <div className="relative grid h-64 w-52 place-items-center border border-white/[0.08]">

                    <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-violet-300/70" />
                    <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-violet-300/70" />
                    <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-violet-300/70" />
                    <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-violet-300/70" />

                    <Camera
                      size={42}
                      className="text-white/10"
                    />

                  </div>

                  <p className="mt-7 text-xs text-white/25">
                    Camera scanner ready
                  </p>

                </div>
              )}

              {scanning && (
                <div className="pointer-events-none absolute inset-0">

                  <div className="absolute left-1/2 top-1/2 h-64 w-52 -translate-x-1/2 -translate-y-1/2">

                    <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-violet-300" />
                    <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-violet-300" />
                    <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-violet-300" />
                    <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-violet-300" />

                    <div className="absolute left-0 right-0 top-1/2 h-px animate-pulse bg-violet-300/60" />

                  </div>

                </div>
              )}

            </div>

            <div className="mt-5 flex gap-3">

              {!scanning ? (
                <button
                  onClick={startScanner}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition hover:bg-violet-100"
                >
                  <Camera size={17} />
                  Start scanner
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-300/10 bg-red-300/[0.04] text-sm text-red-200/70"
                >
                  <ShieldX size={17} />
                  Stop scanner
                </button>
              )}

              <button
                onClick={reset}
                className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.07] text-white/30 transition hover:text-white"
              >
                <RefreshCw size={16} />
              </button>

            </div>

            {/* Manual testing */}

            <div className="mt-6 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-4">

              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-yellow-200/50">
                Development testing
              </p>

              <p className="mt-1 text-[10px] text-white/20">
                Paste the QR token here to test the real database verification.
              </p>

              <div className="mt-3 flex gap-2">

                <input
                  value={manualToken}
                  onChange={(e) =>
                    setManualToken(
                      e.target.value
                    )
                  }
                  placeholder="QR token..."
                  className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-black/20 px-3 text-xs text-white outline-none placeholder:text-white/15"
                />

                <button
                  onClick={() =>
                    verifyToken(
                      manualToken
                    )
                  }
                  disabled={
                    loading ||
                    !manualToken.trim()
                  }
                  className="rounded-xl bg-white px-4 text-xs font-medium text-black disabled:opacity-30"
                >
                  {loading
                    ? 'Checking...'
                    : 'Verify'}
                </button>

              </div>

            </div>

          </div>
        </section>

        {/* Verification Result */}

        <section>

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Verification Result
          </p>

          {!result ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] px-6 text-center">

              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">

                <ShieldCheck
                  size={27}
                  className="text-white/10"
                />

              </div>

              <p className="mt-5 text-sm text-white/30">
                Awaiting QR verification
              </p>

              <p className="mt-2 max-w-xs text-[10px] leading-5 text-white/15">
                Scan an ID card. The server will check the QR token against the database and verify today's duty.
              </p>

            </div>
          ) : (
            <VerificationCard
              result={result}
              onReset={reset}
            />
          )}

        </section>

      </div>
    </PageShell>
    </AuthGuard>
  );
}

function VerificationCard({
  result,
  onReset,
}: {
  result: ScanResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">

      {/* Authorization */}

      <div
        className={`rounded-3xl border p-6 ${
          result.authorized
            ? 'border-emerald-300/10 bg-emerald-300/[0.035]'
            : 'border-red-300/10 bg-red-300/[0.035]'
        }`}
      >

        <div className="flex items-center gap-4">

          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl ${
              result.authorized
                ? 'bg-emerald-300/[0.08]'
                : 'bg-red-300/[0.08]'
            }`}
          >
            {result.authorized ? (
              <ShieldCheck
                size={27}
                className="text-emerald-200/70"
              />
            ) : (
              <ShieldX
                size={27}
                className="text-red-200/70"
              />
            )}
          </div>

          <div>

            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                result.authorized
                  ? 'text-emerald-200/60'
                  : 'text-red-200/60'
              }`}
            >
              {result.authorized
                ? 'Access Permitted'
                : 'Access Denied'}
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {result.authorized
                ? 'AUTHORIZED'
                : 'NOT AUTHORIZED'}
            </p>

          </div>

        </div>

      </div>

      {/* Person */}

      {result.volunteer && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">

          <div className="flex items-center gap-4">

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-violet-300/10 bg-violet-300/[0.05] text-sm font-semibold text-violet-100">
              {getInitials(
                result.volunteer.name
              )}
            </div>

            <div className="min-w-0">

              <p className="text-lg font-medium">
                {result.volunteer.name}
              </p>

              <p className="mt-1 text-xs text-white/25">
                {result.volunteer.collegeId}
              </p>

              {result.volunteer.role && (
                <p className="mt-1 text-[10px] text-violet-200/40">
                  {result.volunteer.role}
                </p>
              )}

            </div>

          </div>

          <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">

            {result.duty && (
              <>
                <Info
                  icon={UserRound}
                  label="Assignment"
                  value={result.duty.team}
                />

                <Info
                  icon={MapPin}
                  label="Location"
                  value={result.duty.location}
                />

                <Info
                  icon={Clock3}
                  label="Duty Time"
                  value={`${formatTime(
                    result.duty.startTime
                  )} – ${formatTime(
                    result.duty.endTime
                  )}`}
                />
              </>
            )}

          </div>

        </div>
      )}

      {/* Reason */}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">

        <p className="text-[9px] uppercase tracking-[0.15em] text-white/20">
          Verification reason
        </p>

        <p className="mt-2 text-xs leading-5 text-white/45">
          {result.reason}
        </p>

      </div>

      <button
        onClick={onReset}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] text-xs text-white/40 transition hover:bg-white/[0.025] hover:text-white"
      >
        <RefreshCw size={14} />
        Scan another ID
      </button>

    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div>

      <div className="flex items-center gap-2">

        <Icon
          size={13}
          className="text-white/20"
        />

        <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
          {label}
        </span>

      </div>

      <p className="mt-2 text-xs text-white/50">
        {value}
      </p>

    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

declare global {
  interface Window {
    BarcodeDetector: any;
  }
}
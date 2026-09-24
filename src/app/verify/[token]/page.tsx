"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldX,
  Clock3,
  MapPin,
  UserRound,
  CalendarDays,
} from "lucide-react";

interface Duty {
  id: string;
  team: string;
  location: string;
  description: string | null;
  startTimeFormatted: string;
  endTimeFormatted: string;
}

interface VerificationData {
  success: boolean;
  authorized: boolean;
  scannedAt: string;
  scannedAtFormatted: string;

  volunteer: {
    id: string;
    name: string;
    collegeId: string;
    department: string | null;
    year: string | null;
    role: string;
  };

  duty: Duty | null;

  todaysDuties: Duty[];

  reason: string;
}

export default function VerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const { token } = await params;

        const response = await fetch(`/api/verify/${token}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setData({
            success: false,
            authorized: false,
            scannedAt: new Date().toISOString(),
            scannedAtFormatted: new Intl.DateTimeFormat("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }).format(new Date()),
            volunteer: {
              id: "",
              name: "Unknown Volunteer",
              collegeId: "",
              department: null,
              year: null,
              role: "Unknown",
            },
            duty: null,
            todaysDuties: [],
            reason: result.error || "Verification failed.",
          });

          return;
        }

        setData(result);
      } catch (error) {
        console.error("VERIFICATION PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050507] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-300" />

            <p className="mt-5 text-sm text-white/40">
              Verifying volunteer...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#050507] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-white/50">
            Unable to verify this QR code.
          </p>
        </div>
      </main>
    );
  }

  const authorized = data.authorized;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050507] text-white">

      {/* Ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[150px] ${
            authorized
              ? "bg-emerald-500/[0.07]"
              : "bg-red-500/[0.06]"
          }`}
        />

        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-violet-600/[0.04] blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-5 py-8 sm:px-8">

        {/* Header */}
        <header className="text-center">

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/[0.08] shadow-[0_0_40px_rgba(139,92,246,.08)]">
            <ShieldCheck
              size={25}
              className="text-violet-200"
            />
          </div>

          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.35em] text-violet-200/60">
            FRESHERS 2026
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Volunteer Verification
          </h1>

        </header>

        {/* Authorization result */}
        <section
          className={`mt-8 rounded-[28px] border p-6 ${
            authorized
              ? "border-emerald-400/25 bg-emerald-400/[0.045]"
              : "border-red-400/20 bg-red-400/[0.045]"
          }`}
        >
          <div className="flex items-center gap-5">

            <div
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${
                authorized
                  ? "bg-emerald-400/[0.10]"
                  : "bg-red-400/[0.10]"
              }`}
            >
              {authorized ? (
                <ShieldCheck
                  size={31}
                  className="text-emerald-300"
                />
              ) : (
                <ShieldX
                  size={31}
                  className="text-red-300"
                />
              )}
            </div>

            <div>
              <p
                className={`text-[12px] font-semibold uppercase tracking-[0.28em] ${
                  authorized
                    ? "text-emerald-300/80"
                    : "text-red-300/80"
                }`}
              >
                {authorized
                  ? "ACCESS AUTHORIZED"
                  : "ACCESS NOT AUTHORIZED"}
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {authorized
                  ? "AUTHORIZED"
                  : "NOT AUTHORIZED"}
              </h2>
            </div>

          </div>
        </section>

        {/* Volunteer information */}
        <section className="mt-5 rounded-[28px] border border-white/[0.08] bg-white/[0.018] p-6">

          <div className="flex items-center gap-4">

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-violet-300/10 bg-violet-500/[0.10] text-xl font-semibold text-violet-100">
              {data.volunteer.name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold">
                {data.volunteer.name}
              </h3>

              <p className="mt-1 text-sm text-white/35">
                {data.volunteer.collegeId}
              </p>
            </div>

          </div>

          <div className="my-5 h-px bg-white/[0.07]" />

          <div className="grid grid-cols-2 gap-5">

            <div>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/30">
                <UserRound size={14} />
                Role
              </p>

              <p className="mt-1.5 text-sm text-white/80">
                {data.volunteer.role || "—"}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/30">
                <UserRound size={14} />
                Department
              </p>

              <p className="mt-1.5 text-sm text-white/80">
                {data.volunteer.department || "—"}
              </p>
            </div>

          </div>

          {/* Today's duty */}
          <div className="mt-7">

            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/30">
              TODAY'S DUTY
            </p>

            {data.duty ? (
              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">

                <p className="text-base font-medium text-white">
                  {data.duty.team}
                </p>

                {data.duty.description && (
                  <p className="mt-1 text-sm text-white/40">
                    {data.duty.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">

                  <div className="flex items-center gap-2 text-sm text-white/65">
                    <Clock3 size={15} className="text-violet-300/60" />
                    {data.duty.startTimeFormatted} —{" "}
                    {data.duty.endTimeFormatted}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/65">
                    <MapPin size={15} className="text-violet-300/60" />
                    {data.duty.location}
                  </div>

                </div>

              </div>
            ) : (
              <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.035] p-5">

                <p className="text-sm font-medium text-red-200/80">
                  No active duty at this time.
                </p>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  {data.reason}
                </p>

              </div>
            )}

          </div>

        </section>

        {/* Scan timestamp */}
        <section className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.018] p-5">

          <div className="flex items-center gap-4">

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-400/[0.08]">
              <Clock3
                size={19}
                className="text-violet-200/70"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                QR SCANNED AT
              </p>

              <p className="mt-1 text-sm font-medium text-white/80">
                {data.scannedAtFormatted}
              </p>

              <p className="mt-0.5 text-[11px] text-white/25">
                {new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date(data.scannedAt))}
              </p>
            </div>

          </div>

        </section>

        {/* Verification reason */}
        {!authorized && (
          <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-400/[0.025] px-5 py-4">

            <div className="flex items-start gap-3">
              <CalendarDays
                size={17}
                className="mt-0.5 shrink-0 text-red-300/50"
              />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200/50">
                  Verification result
                </p>

                <p className="mt-1 text-sm text-white/45">
                  {data.reason}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center">

          <p className="text-xs text-white/20">
            Verification performed against the live event database.
          </p>

          <p className="mt-1 text-[10px] text-white/10">
            Every QR verification is recorded securely.
          </p>

        </footer>

      </div>
    </main>
  );
}
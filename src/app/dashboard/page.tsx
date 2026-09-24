"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  QrCode,
  ShieldCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";

import PageShell from "@/components/PageShell";

interface DashboardData {
  success: boolean;

  stats: {
    totalVolunteers: number;
    authorizedToday: number;
    notAssigned: number;
    qrScans: number;
    allowedScans: number;
    deniedScans: number;
    accessPulse: number;
  };

  operations: {
    team: string;
    location: string;
    assigned: number;
    startTime: string;
    endTime: string;
    percentage: number;
  }[];

  recentScans: {
    id: string;
    scannedAt: string;
    result: string;
    reason: string | null;
    volunteer: {
      name: string;
      collegeId: string;
    } | null;
  }[];
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
}

function formatDate() {
  return new Date().toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function Dashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadDashboard() {
    try {
      setError(null);

      const response = await fetch(
        "/api/dashboard",
        {
          cache: "no-store",
        }
      );

      const text =
        await response.text();

      let result;

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status})`
        );
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Failed to load dashboard."
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    // Refresh dashboard every 30 seconds
    const interval = setInterval(
      loadDashboard,
      30000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const stats = data?.stats;

  return (
    <PageShell
      title="Good afternoon, Admin"
      subtitle="A live overview of volunteer authorization, daily duties and event access."
    >
      {loading && !data ? (
        <div className="mt-10 rounded-3xl border border-white/[0.07] bg-white/[0.015] p-10 text-center text-white/40">
          Loading live dashboard...
        </div>
      ) : error ? (
        <div className="mt-10 rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-8">
          <p className="text-sm font-medium text-red-300">
            Unable to load dashboard
          </p>

          <p className="mt-2 text-sm text-white/40">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}

          <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={20} />}
              label="Total Volunteers"
              value={
                stats?.totalVolunteers ?? 0
              }
              description="Registered across all teams"
            />

            <StatCard
              icon={<ShieldCheck size={20} />}
              label="Authorized Today"
              value={
                stats?.authorizedToday ?? 0
              }
              description="Assigned for today"
            />

            <StatCard
              icon={<UserX size={20} />}
              label="Not Assigned"
              value={
                stats?.notAssigned ?? 0
              }
              description="No duty scheduled"
            />

            <StatCard
              icon={<QrCode size={20} />}
              label="QR Scans"
              value={
                stats?.qrScans ?? 0
              }
              description="Verification attempts today"
            />
          </section>

          {/* MAIN CONTENT */}

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.65fr_0.75fr]">
            {/* OPERATIONS */}

            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-7">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-violet-300/70"
                    />

                    <h2 className="text-lg font-medium">
                      Today&apos;s operations
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-white/35">
                    Live team allocation and attendance
                  </p>
                </div>

                <div className="rounded-full border border-white/[0.07] px-4 py-2 text-xs text-white/45">
                  {formatDate()}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {data?.operations.length ===
                0 ? (
                  <EmptyState />
                ) : (
                  data?.operations.map(
                    (operation) => (
                      <OperationRow
                        key={`${operation.team}-${operation.location}`}
                        operation={
                          operation
                        }
                      />
                    )
                  )
                )}
              </div>
            </div>

            {/* ACCESS PULSE */}

            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-7">
              <div className="flex items-center gap-2 text-white/35">
                <QrCode size={17} />

                <span className="text-sm">
                  Access pulse
                </span>
              </div>

              <div className="mt-7 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-tight">
                  {stats?.accessPulse ?? 0}%
                </span>

                <span className="mb-2 text-sm text-white/35">
                  successful scans
                </span>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300 transition-all duration-700"
                  style={{
                    width: `${stats?.accessPulse ?? 0}%`,
                  }}
                />
              </div>

              <div className="mt-5 flex justify-between text-sm">
                <span className="flex items-center gap-2 text-emerald-300/60">
                  <CheckCircle2 size={15} />

                  {stats?.allowedScans ?? 0} allowed
                </span>

                <span className="flex items-center gap-2 text-red-300/60">
                  <XCircle size={15} />

                  {stats?.deniedScans ?? 0} denied
                </span>
              </div>
            </div>
          </section>

          {/* RECENT SCANS */}

          <section className="mt-6 rounded-3xl border border-white/[0.07] bg-white/[0.018] p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <QrCode
                    size={17}
                    className="text-violet-300/70"
                  />

                  <h2 className="text-lg font-medium">
                    Recent QR activity
                  </h2>
                </div>

                <p className="mt-1 text-sm text-white/35">
                  Latest verification attempts
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {data?.recentScans.length ===
              0 ? (
                <div className="py-10 text-center text-sm text-white/30">
                  No QR scans recorded today.
                </div>
              ) : (
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-[0.2em] text-white/30">
                      <th className="pb-4">
                        Person
                      </th>

                      <th className="pb-4">
                        College ID
                      </th>

                      <th className="pb-4">
                        Time
                      </th>

                      <th className="pb-4">
                        Result
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.recentScans.map(
                      (scan) => (
                        <tr
                          key={scan.id}
                          className="border-b border-white/[0.04] last:border-0"
                        >
                          <td className="py-4 text-sm">
                            {scan.volunteer
                              ?.name ||
                              "Unknown"}
                          </td>

                          <td className="py-4 text-sm text-white/40">
                            {scan.volunteer
                              ?.collegeId ||
                              "—"}
                          </td>

                          <td className="py-4 text-sm text-white/40">
                            {formatTime(
                              scan.scannedAt
                            )}
                          </td>

                          <td className="py-4">
                            <ScanResult
                              result={
                                scan.result
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}

/* -----------------------------------------
   STAT CARD
----------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/[0.07] bg-white/[0.018] p-6 transition hover:border-violet-300/10 hover:bg-white/[0.025]">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.06] text-violet-200/80">
          {icon}
        </div>

        <ArrowUpRight
          size={17}
          className="text-white/20 transition group-hover:text-white/50"
        />
      </div>

      <p className="mt-8 text-sm text-white/35">
        {label}
      </p>

      <p className="mt-1 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-sm text-white/30">
        {description}
      </p>
    </div>
  );
}

/* -----------------------------------------
   OPERATION ROW
----------------------------------------- */

function OperationRow({
  operation,
}: {
  operation: DashboardData["operations"][number];
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-xs font-semibold">
            {operation.team
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="font-medium">
              {operation.team}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-white/35">
              <Clock3 size={13} />

              {formatTime(
                operation.startTime
              )}

              <span>—</span>

              {formatTime(
                operation.endTime
              )}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-white/45">
            {operation.assigned} assigned
          </p>

          <p className="mt-1 text-xs text-white/25">
            {operation.location}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300"
            style={{
              width: `${operation.percentage}%`,
            }}
          />
        </div>

        <span className="text-xs text-white/35">
          {operation.percentage}%
        </span>
      </div>
    </div>
  );
}

/* -----------------------------------------
   EMPTY STATE
----------------------------------------- */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.07] py-14 text-center">
      <CalendarDays
        size={28}
        className="mx-auto text-white/20"
      />

      <p className="mt-4 text-sm text-white/40">
        No duties assigned for today.
      </p>

      <p className="mt-1 text-xs text-white/20">
        Assign duties from Daily Duties.
      </p>
    </div>
  );
}

/* -----------------------------------------
   SCAN RESULT
----------------------------------------- */

function ScanResult({
  result,
}: {
  result: string;
}) {
  const allowed =
    result.toUpperCase() ===
      "AUTHORIZED" ||
    result.toUpperCase() === "ALLOWED";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        allowed
          ? "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-300/70"
          : "border-red-300/10 bg-red-300/[0.05] text-red-300/70"
      }`}
    >
      {allowed ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {result}
    </span>
  );
}
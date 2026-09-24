"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import AuthGuard from "@/components/AuthGuard";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Clock3,
  MapPin,
  UserRound,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

type Volunteer = {
  id: string;
  name: string;
  collegeId: string;
  department: string | null;
  year: string | null;
  role: string;
};

type ScanLog = {
  id: string;
  volunteerId: string | null;
  scannedAt: string;
  result: string;
  reason: string | null;
  gate: string | null;
  scannerId: string | null;
  volunteer: Volunteer | null;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

function isAuthorized(result: string) {
  return result.toUpperCase() === "AUTHORIZED";
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "AUTHORIZED" | "NOT_AUTHORIZED"
  >("ALL");

  async function loadLogs() {
    try {
      setLoading(true);

      const response = await fetch("/api/activity-logs", {
        cache: "no-store",
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load activity logs."
        );
      }

      setLogs(data.logs || []);
    } catch (error) {
      console.error("LOAD ACTIVITY LOGS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load activity logs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesFilter =
        filter === "ALL" ||
        log.result.toUpperCase() === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      return (
        log.volunteer?.name
          ?.toLowerCase()
          .includes(query) ||
        log.volunteer?.collegeId
          ?.toLowerCase()
          .includes(query) ||
        log.gate
          ?.toLowerCase()
          .includes(query) ||
        log.scannerId
          ?.toLowerCase()
          .includes(query) ||
        log.reason
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [logs, search, filter]);

  const authorizedCount = logs.filter((log) =>
    isAuthorized(log.result)
  ).length;

  const rejectedCount = logs.length - authorizedCount;

  return (
    <AuthGuard>
    <PageShell
      title="Activity Logs"
      subtitle="Monitor every QR verification attempt recorded by the system."
    >
      {/* Stats */}
      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <LogStat
          icon={Activity}
          label="Total scans"
          value={logs.length}
        />

        <LogStat
          icon={ShieldCheck}
          label="Authorized"
          value={authorizedCount}
          positive
        />

        <LogStat
          icon={ShieldX}
          label="Not authorized"
          value={rejectedCount}
          negative
        />
      </section>

      {/* Main card */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-medium">
              Verification activity
            </h2>

            <p className="mt-1 text-xs text-white/30">
              Latest QR scan attempts from the database.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search activity..."
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-4 text-xs outline-none placeholder:text-white/20 focus:border-violet-300/30 sm:w-[230px]"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as
                    | "ALL"
                    | "AUTHORIZED"
                    | "NOT_AUTHORIZED"
                )
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#111116] px-3 text-xs text-white/60 outline-none focus:border-violet-300/30"
            >
              <option value="ALL">
                All activity
              </option>

              <option value="AUTHORIZED">
                Authorized
              </option>

              <option value="NOT_AUTHORIZED">
                Not authorized
              </option>
            </select>

            {/* Refresh */}
            <button
              onClick={loadLogs}
              disabled={loading}
              title="Refresh"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/35 transition hover:border-violet-300/20 hover:text-violet-200 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw
              size={22}
              className="mx-auto animate-spin text-violet-200/40"
            />

            <p className="mt-3 text-xs text-white/30">
              Loading activity...
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity
              size={25}
              className="mx-auto text-white/15"
            />

            <p className="mt-3 text-sm text-white/35">
              No activity found.
            </p>

            <p className="mt-1 text-xs text-white/20">
              QR verification activity will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] gap-4 border-b border-white/[0.05] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/20 lg:grid">
              <span>Volunteer</span>
              <span>Result</span>
              <span>Time</span>
              <span>Location</span>
              <span>Reason</span>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {filteredLogs.map((log) => {
                const authorized = isAuthorized(
                  log.result
                );

                const dateTime = formatDateTime(
                  log.scannedAt
                );

                return (
                  <div
                    key={log.id}
                    className="p-5 transition hover:bg-white/[0.018]"
                  >
                    {/* Desktop */}
                    <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr]">
                      {/* Volunteer */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-violet-400/[0.07]">
                          <UserRound
                            size={16}
                            className="text-violet-200/60"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">
                            {log.volunteer?.name ||
                              "Unknown volunteer"}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-white/25">
                            {log.volunteer?.collegeId ||
                              "No ID"}
                          </p>
                        </div>
                      </div>

                      {/* Result */}
                      <ResultBadge
                        authorized={authorized}
                      />

                      {/* Time */}
                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-white/50">
                          <Clock3 size={12} />
                          {dateTime.time}
                        </p>

                        <p className="mt-1 text-[10px] text-white/20">
                          {dateTime.date}
                        </p>
                      </div>

                      {/* Location */}
                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                          <MapPin size={12} />
                          {log.gate || "—"}
                        </p>

                        {log.scannerId && (
                          <p className="mt-1 text-[10px] text-white/20">
                            {log.scannerId}
                          </p>
                        )}
                      </div>

                      {/* Reason */}
                      <p
                        className={`text-[11px] leading-5 ${
                          authorized
                            ? "text-white/25"
                            : "text-red-200/50"
                        }`}
                      >
                        {log.reason ||
                          (authorized
                            ? "Valid duty assignment"
                            : "Access denied")}
                      </p>
                    </div>

                    {/* Mobile / tablet */}
                    <div className="lg:hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-violet-400/[0.07]">
                            <UserRound
                              size={16}
                              className="text-violet-200/60"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {log.volunteer?.name ||
                                "Unknown volunteer"}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              {log.volunteer?.collegeId ||
                                "No ID"}
                            </p>
                          </div>
                        </div>

                        <ResultBadge
                          authorized={authorized}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <InfoItem
                          icon={Clock3}
                          label={`${dateTime.date} • ${dateTime.time}`}
                        />

                        <InfoItem
                          icon={MapPin}
                          label={
                            log.gate || "No gate recorded"
                          }
                        />

                        <InfoItem
                          icon={Activity}
                          label={
                            log.reason ||
                            (authorized
                              ? "Valid duty assignment"
                              : "Access denied")
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        {!loading && logs.length > 0 && (
          <div className="border-t border-white/[0.05] px-5 py-3">
            <p className="text-[10px] text-white/20">
              Showing {filteredLogs.length} of{" "}
              {logs.length} recorded scans
            </p>
          </div>
        )}
      </section>

      {/* Information */}
      <section className="mt-6 rounded-3xl border border-violet-300/10 bg-violet-400/[0.035] p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.06]">
            <Activity
              size={17}
              className="text-violet-200/70"
            />
          </div>

          <div>
            <p className="text-xs font-medium">
              Activity tracking
            </p>

            <p className="mt-1 max-w-3xl text-[11px] leading-5 text-white/25">
              Every QR verification can be recorded with
              the volunteer, result, timestamp, gate,
              scanner and reason. This provides an
              auditable history of access decisions.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
    </AuthGuard>
  );
}

function LogStat({
  icon: Icon,
  label,
  value,
  positive,
  negative,
}: {
  icon: any;
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl border ${
          positive
            ? "border-emerald-300/10 bg-emerald-300/[0.06]"
            : negative
            ? "border-red-300/10 bg-red-300/[0.05]"
            : "border-violet-300/10 bg-violet-400/[0.08]"
        }`}
      >
        <Icon
          size={18}
          className={
            positive
              ? "text-emerald-200/70"
              : negative
              ? "text-red-200/60"
              : "text-violet-200"
          }
        />
      </div>

      <p className="mt-5 text-xs text-white/30">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function ResultBadge({
  authorized,
}: {
  authorized: boolean;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
        authorized
          ? "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70"
          : "border-red-300/10 bg-red-300/[0.05] text-red-200/70"
      }`}
    >
      {authorized ? (
        <CheckCircle2 size={11} />
      ) : (
        <XCircle size={11} />
      )}

      {authorized ? "Authorized" : "Not authorized"}
    </span>
  );
}

function InfoItem({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2">
      <Icon
        size={13}
        className="shrink-0 text-white/25"
      />

      <span className="truncate text-[10px] text-white/30">
        {label}
      </span>
    </div>
  );
}
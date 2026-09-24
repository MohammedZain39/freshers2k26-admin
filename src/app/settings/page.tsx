"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  ShieldCheck,
  User,
  Mail,
  CalendarDays,
  Power,
  Eye,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type Settings = {
  eventName: string;
  eventYear: string;
  eventStatus: "ACTIVE" | "PAUSED" | "ENDED";
  allowVerification: boolean;
  showVolunteerPhone: boolean;
  showVolunteerEmail: boolean;
};

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

const defaultSettings: Settings = {
  eventName: "Freshers",
  eventYear: "2026",
  eventStatus: "ACTIVE",
  allowVerification: true,
  showVolunteerPhone: false,
  showVolunteerEmail: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [admin, setAdmin] = useState<Admin>(null);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings", {
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
          data.error || "Failed to load settings."
        );
      }

      if (data.settings) {
        setSettings({
          eventName: data.settings.eventName ?? "Freshers",
          eventYear: data.settings.eventYear ?? "2026",
          eventStatus:
            data.settings.eventStatus ?? "ACTIVE",
          allowVerification:
            data.settings.allowVerification ?? true,
          showVolunteerPhone:
            data.settings.showVolunteerPhone ?? false,
          showVolunteerEmail:
            data.settings.showVolunteerEmail ?? false,
        });
      }

      if (data.admin) {
        setAdmin(data.admin);
        setAdminName(data.admin.name ?? "");
        setAdminEmail(data.admin.email ?? "");
      }
    } catch (err) {
      console.error("LOAD SETTINGS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...settings,
          adminName,
          adminEmail,
        }),
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
          data.error || "Failed to save settings."
        );
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      if (data.admin) {
        setAdmin(data.admin);
        setAdminName(data.admin.name);
        setAdminEmail(data.admin.email);
      }

      setMessage("Settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("SAVE SETTINGS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetSettings() {
    await loadSettings();
    setMessage("");
    setError("");
  }

  if (loading) {
    return (
      <PageShell
        title="Settings"
        subtitle="Manage event configuration, verification behavior and administrator information."
      >
        <div className="mt-8 flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-white/30">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-violet-300" />
            Loading settings...
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Settings"
      subtitle="Manage event configuration, verification behavior and administrator information."
    >
      {/* Messages */}
      {message && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-200/80">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-300/10 bg-red-300/[0.04] px-4 py-3 text-sm text-red-200/80">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">

        {/* EVENT CONFIGURATION */}
        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-6">

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08]">
              <CalendarDays
                size={19}
                className="text-violet-200"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Event configuration
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Basic information about the event.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Event name
              </label>

              <input
                value={settings.eventName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eventName: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Event year
              </label>

              <input
                value={settings.eventYear}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eventYear: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/30"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Event status
            </label>

            <select
              value={settings.eventStatus}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  eventStatus:
                    e.target.value as Settings["eventStatus"],
                })
              }
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none focus:border-violet-300/30"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="ENDED">Ended</option>
            </select>
          </div>
        </section>

        {/* ADMIN */}
        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-6">

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08]">
              <User
                size={19}
                className="text-violet-200"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Administrator profile
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Event administrator information.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">

            <div>
              <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                <User size={12} />
                Administrator name
              </label>

              <input
                value={adminName}
                onChange={(e) =>
                  setAdminName(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/30"
                placeholder="Event Administrator"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                <Mail size={12} />
                Administrator email
              </label>

              <input
                type="email"
                value={adminEmail}
                onChange={(e) =>
                  setAdminEmail(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/30"
                placeholder="admin@example.com"
              />
            </div>

            {admin && (
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <span className="text-xs text-white/30">
                  Account role
                </span>

                <span className="text-xs font-medium text-violet-200/70">
                  {admin.role}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* QR VERIFICATION */}
        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-6">

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06]">
              <ShieldCheck
                size={19}
                className="text-emerald-200"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                QR verification
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Control public volunteer verification.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">

            <Toggle
              icon={<Power size={16} />}
              title="Enable QR verification"
              description="Allow QR scans to verify volunteers against the live database."
              checked={settings.allowVerification}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  allowVerification: value,
                })
              }
            />

            <Toggle
              icon={<Phone size={16} />}
              title="Show phone number"
              description="Display volunteer phone number on the public verification page."
              checked={settings.showVolunteerPhone}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  showVolunteerPhone: value,
                })
              }
            />

            <Toggle
              icon={<Mail size={16} />}
              title="Show email address"
              description="Display volunteer email on the public verification page."
              checked={settings.showVolunteerEmail}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  showVolunteerEmail: value,
                })
              }
            />
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-6">

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08]">
              <Eye
                size={19}
                className="text-violet-200"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                System status
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Current live configuration.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">

            <StatusRow
              label="Event"
              value={settings.eventStatus}
              active={settings.eventStatus === "ACTIVE"}
            />

            <StatusRow
              label="QR verification"
              value={
                settings.allowVerification
                  ? "ENABLED"
                  : "DISABLED"
              }
              active={settings.allowVerification}
            />

            <StatusRow
              label="Database"
              value="CONNECTED"
              active
            />

          </div>
        </section>
      </div>

      {/* SAVE BAR */}
      <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.018] px-5 py-4">

        <div>
          <p className="text-sm font-medium">
            Configuration
          </p>

          <p className="mt-1 text-xs text-white/30">
            Changes are saved directly to the database.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={resetSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/40 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save changes"}
          </button>

        </div>
      </div>
    </PageShell>
  );
}

function Toggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4 text-left transition hover:bg-white/[0.035]"
    >
      <div className="flex items-start gap-3">

        <div
          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            checked
              ? "bg-violet-400/[0.10] text-violet-200"
              : "bg-white/[0.04] text-white/30"
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-white/80">
            {title}
          </p>

          <p className="mt-1 max-w-md text-xs leading-5 text-white/30">
            {description}
          </p>
        </div>
      </div>

      <div
        className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-violet-400/80"
            : "bg-white/[0.12]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}

function StatusRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3">

      <span className="text-xs text-white/35">
        {label}
      </span>

      <div className="flex items-center gap-2">

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.6)]"
              : "bg-red-300"
          }`}
        />

        <span
          className={`text-[10px] font-semibold tracking-[0.15em] ${
            active
              ? "text-emerald-200/70"
              : "text-red-200/70"
          }`}
        >
          {value}
        </span>

      </div>
    </div>
  );
}
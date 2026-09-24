"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Check,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

type Volunteer = {
  id: string;
  name: string;
  collegeId: string;
  department: string | null;
  year: string | null;
  role: string;
};

type Duty = {
  id: string;
  volunteerId: string;
  date: string;
  startTime: string;
  endTime: string;
  team: string;
  location: string;
  description: string | null;
  assignedBy: string | null;
  volunteer: Volunteer;
};

type DutyForm = {
  volunteerId: string;
  date: string;
  startTime: string;
  endTime: string;
  team: string;
  location: string;
  description: string;
};

const emptyForm: DutyForm = {
  volunteerId: "",
  date: "",
  startTime: "",
  endTime: "",
  team: "",
  location: "",
  description: "",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateTimeValue(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DutiesPage() {
  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );

  const [duties, setDuties] = useState<Duty[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<DutyForm>(emptyForm);

  const [saved, setSaved] = useState(false);

  async function loadVolunteers() {
    try {
      const response = await fetch("/api/volunteers", {
        cache: "no-store",
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Invalid volunteers response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load volunteers."
        );
      }

      setVolunteers(data.volunteers || []);
    } catch (error) {
      console.error("LOAD VOLUNTEERS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load volunteers."
      );
    }
  }

  async function loadDuties(date = selectedDate) {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/duties?date=${encodeURIComponent(date)}`,
        {
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Invalid duties response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load duties."
        );
      }

      setDuties(data.duties || []);
    } catch (error) {
      console.error("LOAD DUTIES ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load duties."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  useEffect(() => {
    loadDuties(selectedDate);
  }, [selectedDate]);

  const assignedVolunteerIds = useMemo(() => {
    return new Set(duties.map((duty) => duty.volunteerId));
  }, [duties]);

  const assignedCount = duties.length;

  const unassignedCount = Math.max(
    volunteers.length - assignedVolunteerIds.size,
    0
  );

  const filteredDuties = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return duties;

    return duties.filter((duty) => {
      return (
        duty.volunteer.name
          .toLowerCase()
          .includes(searchText) ||
        duty.volunteer.collegeId
          .toLowerCase()
          .includes(searchText) ||
        duty.team.toLowerCase().includes(searchText) ||
        duty.location.toLowerCase().includes(searchText)
      );
    });
  }, [duties, search]);

  function changeDate(days: number) {
    const current = new Date(`${selectedDate}T00:00:00`);

    current.setDate(current.getDate() + days);

    setSelectedDate(getLocalDateString(current));
    setSaved(false);
  }

  function goToday() {
    setSelectedDate(getLocalDateString(new Date()));
    setSaved(false);
  }

  function openAddModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: selectedDate,
    });

    setShowModal(true);
  }

  function openEditModal(duty: Duty) {
    setEditingId(duty.id);

    setForm({
      volunteerId: duty.volunteerId,
      date: getLocalDateString(new Date(duty.date)),
      startTime: getDateTimeValue(duty.startTime),
      endTime: getDateTimeValue(duty.endTime),
      team: duty.team,
      location: duty.location,
      description: duty.description || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof DutyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveDuty() {
    if (
      !form.volunteerId ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.team.trim() ||
      !form.location.trim()
    ) {
      alert(
        "Volunteer, date, start time, end time, team and location are required."
      );

      return;
    }

    if (
      new Date(form.endTime).getTime() <=
      new Date(form.startTime).getTime()
    ) {
      alert("End time must be after start time.");
      return;
    }

    try {
      setSaving(true);

      const method = editingId ? "PUT" : "POST";

      const response = await fetch("/api/duties", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          volunteerId: form.volunteerId,
          date: new Date(
            `${form.date}T00:00:00`
          ).toISOString(),
          startTime: new Date(
            form.startTime
          ).toISOString(),
          endTime: new Date(
            form.endTime
          ).toISOString(),
          team: form.team.trim(),
          location: form.location.trim(),
          description: form.description.trim() || null,
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
          data.error ||
            `Failed to ${editingId ? "update" : "create"} duty.`
        );
      }

      closeModal();

      setSaved(true);

      await loadDuties(selectedDate);
    } catch (error) {
      console.error("SAVE DUTY ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save duty."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteDuty(duty: Duty) {
    const confirmed = window.confirm(
      `Delete this duty assignment?\n\n${duty.volunteer.name} — ${duty.team}`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/duties", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: duty.id,
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
          data.error || "Failed to delete duty."
        );
      }

      setSaved(true);

      await loadDuties(selectedDate);
    } catch (error) {
      console.error("DELETE DUTY ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete duty."
      );
    }
  }

  return (
    <PageShell
      title="Daily Duties"
      subtitle="Choose who is authorized to work for the selected event day."
    >
      {/* Date selector */}
      <section className="mt-7 flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08]">
            <CalendarDays
              size={19}
              className="text-violet-200"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Duty schedule
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(`${selectedDate}T00:00:00`)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/35 transition hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={goToday}
            className="h-9 rounded-xl border border-violet-300/10 bg-violet-400/[0.08] px-4 text-xs font-medium text-violet-100"
          >
            Today
          </button>

          <button
            onClick={() => changeDate(1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/35 transition hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <DutyStat
          label="Total volunteers"
          value={volunteers.length}
          icon={Users}
        />

        <DutyStat
          label="Assigned"
          value={assignedCount}
          icon={Check}
        />

        <DutyStat
          label="No duty"
          value={unassignedCount}
          icon={CalendarDays}
        />
      </section>

      {/* Main */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-medium">
              {formatDate(`${selectedDate}T00:00:00`)} duty list
            </h2>

            <p className="mt-1 text-xs text-white/30">
              Manage the people who are required to work.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
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
                placeholder="Search duties..."
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-4 text-xs outline-none placeholder:text-white/20 focus:border-violet-300/30 sm:w-[220px]"
              />
            </div>

            <button
              onClick={openAddModal}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-violet-100"
            >
              <Plus size={14} />
              Add duty
            </button>
          </div>
        </div>

        {/* Saved notification */}
        {saved && (
          <div className="border-b border-emerald-300/10 bg-emerald-300/[0.035] px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-emerald-200/70">
              <Check size={14} />
              Duty schedule has been updated.
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2
              size={24}
              className="mx-auto animate-spin text-violet-200/50"
            />

            <p className="mt-3 text-xs text-white/30">
              Loading duty schedule...
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filteredDuties.map((duty) => (
              <DutyRow
                key={duty.id}
                duty={duty}
                onEdit={() => openEditModal(duty)}
                onDelete={() => deleteDuty(duty)}
              />
            ))}

            {filteredDuties.length === 0 && (
              <div className="py-16 text-center">
                <Users
                  size={24}
                  className="mx-auto text-white/15"
                />

                <p className="mt-3 text-sm text-white/35">
                  No duties assigned for this day.
                </p>

                <button
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[0.05] px-4 py-2 text-xs text-violet-200/70 transition hover:bg-violet-400/[0.08]"
                >
                  <Plus size={14} />
                  Add first duty
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Explanation */}
      <section className="mt-6 rounded-3xl border border-violet-300/10 bg-violet-400/[0.035] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/50">
          How authorization works
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <Step
            number="01"
            title="Assign"
            description="Add the volunteers who have work for the chosen day."
          />

          <Step
            number="02"
            title="Save"
            description="The schedule becomes the official duty list for that day."
          />

          <Step
            number="03"
            title="Verify"
            description="When their QR is scanned, the system checks this list before allowing access."
          />
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingId ? "Edit Duty" : "Add Duty"}
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  {editingId
                    ? "Update this duty assignment."
                    : "Assign a volunteer to a duty."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="grid h-9 w-9 place-items-center rounded-xl text-white/30 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormLabel text="Volunteer *" />

                <select
                  value={form.volunteerId}
                  onChange={(event) =>
                    updateField(
                      "volunteerId",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#111116] px-4 text-sm text-white outline-none focus:border-violet-300/30"
                >
                  <option value="">
                    Select volunteer
                  </option>

                  {volunteers.map((volunteer) => (
                    <option
                      key={volunteer.id}
                      value={volunteer.id}
                    >
                      {volunteer.name} —{" "}
                      {volunteer.collegeId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FormLabel text="Date *" />

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateField("date", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none focus:border-violet-300/30"
                />
              </div>

              <div>
                <FormLabel text="Team *" />

                <input
                  value={form.team}
                  onChange={(event) =>
                    updateField("team", event.target.value)
                  }
                  placeholder="Registration"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-violet-300/30"
                />
              </div>

              <div>
                <FormLabel text="Start time *" />

                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(event) =>
                    updateField(
                      "startTime",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none focus:border-violet-300/30"
                />
              </div>

              <div>
                <FormLabel text="End time *" />

                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField(
                      "endTime",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none focus:border-violet-300/30"
                />
              </div>

              <div>
                <FormLabel text="Location *" />

                <input
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="Main Entrance"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-violet-300/30"
                />
              </div>

              <div>
                <FormLabel text="Description" />

                <input
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Duty details"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-violet-300/30"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-white/[0.07] p-6">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={saveDuty}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
              >
                {saving && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}

                {editingId
                  ? "Save changes"
                  : "Create duty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ---------------- Components ---------------- */

function DutyStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08]">
        <Icon size={18} className="text-violet-200" />
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

function DutyRow({
  duty,
  onEdit,
  onDelete,
}: {
  duty: Duty;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-5 transition hover:bg-white/[0.018] sm:flex-row sm:items-center">
      {/* Person */}
      <div className="flex min-w-[230px] flex-1 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.09] text-xs font-semibold text-violet-100">
          {getInitials(duty.volunteer.name)}
        </div>

        <div>
          <p className="text-sm font-medium">
            {duty.volunteer.name}
          </p>

          <p className="mt-1 text-[11px] text-white/25">
            {duty.volunteer.collegeId} · {duty.team}
          </p>
        </div>
      </div>

      {/* Duty */}
      <div className="flex flex-1 flex-col gap-1 sm:min-w-[220px]">
        <p className="text-xs font-medium text-white/55">
          {duty.description || duty.team}
        </p>

        <div className="flex flex-wrap gap-3 text-[10px] text-white/25">
          <span className="flex items-center gap-1.5">
            <Clock3 size={12} />
            {formatTime(duty.startTime)} —{" "}
            {formatTime(duty.endTime)}
          </span>

          <span className="flex items-center gap-1.5">
            <MapPin size={12} />
            {duty.location}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-emerald-200/60">
          Working
        </span>

        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.4)]" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          title="Edit duty"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/35 transition hover:border-violet-300/20 hover:bg-violet-400/[0.06] hover:text-violet-200"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={onDelete}
          title="Delete duty"
          className="grid h-9 w-9 place-items-center rounded-xl border border-red-300/10 bg-red-400/[0.025] text-red-300/45 transition hover:border-red-300/20 hover:bg-red-400/[0.06] hover:text-red-300"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function FormLabel({ text }: { text: string }) {
  return (
    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
      {text}
    </label>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-[10px] font-semibold text-violet-200/40">
        {number}
      </span>

      <div>
        <p className="text-xs font-medium">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-white/25">
          {description}
        </p>
      </div>
    </div>
  );
}
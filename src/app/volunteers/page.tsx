"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Users,
  X,
  Loader2,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import AuthGuard from "@/components/AuthGuard";
type Volunteer = {
  id: string;
  name: string;
  collegeId: string;
  department: string | null;
  year: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  role: string;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
};

type VolunteerForm = {
  name: string;
  collegeId: string;
  department: string;
  year: string;
  phone: string;
  email: string;
  photoUrl: string;
  role: string;
};

const emptyForm: VolunteerForm = {
  name: "",
  collegeId: "",
  department: "",
  year: "",
  phone: "",
  email: "",
  photoUrl: "",
  role: "Volunteer",
};

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<VolunteerForm>(emptyForm);

  async function loadVolunteers() {
    try {
      setLoading(true);

      const response = await fetch("/api/volunteers", {
        cache: "no-store",
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load volunteers.");
      }

      setVolunteers(data.volunteers || []);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load volunteers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  const filteredVolunteers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return volunteers;

    return volunteers.filter((volunteer) => {
      return (
        volunteer.name.toLowerCase().includes(value) ||
        volunteer.collegeId.toLowerCase().includes(value) ||
        (volunteer.department || "").toLowerCase().includes(value) ||
        volunteer.role.toLowerCase().includes(value)
      );
    });
  }, [volunteers, search]);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(volunteer: Volunteer) {
    setEditingId(volunteer.id);

    setForm({
      name: volunteer.name,
      collegeId: volunteer.collegeId,
      department: volunteer.department || "",
      year: volunteer.year || "",
      phone: volunteer.phone || "",
      email: volunteer.email || "",
      photoUrl: volunteer.photoUrl || "",
      role: volunteer.role || "Volunteer",
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
    field: keyof VolunteerForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveVolunteer() {
    if (!form.name.trim() || !form.collegeId.trim()) {
      alert("Name and College ID are required.");
      return;
    }

    try {
      setSaving(true);

      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? {
            id: editingId,
            ...form,
          }
        : {
            ...form,
          };

      const response = await fetch("/api/volunteers", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            `Failed to ${editingId ? "update" : "create"} volunteer.`
        );
      }

      closeModal();

      await loadVolunteers();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteVolunteer(volunteer: Volunteer) {
    const confirmed = window.confirm(
      `Delete ${volunteer.name}?\n\nThis will also delete all duties assigned to this volunteer.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/volunteers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: volunteer.id,
        }),
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned invalid response (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to delete volunteer."
        );
      }

      await loadVolunteers();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete volunteer."
      );
    }
  }

  return (
    <AuthGuard>
    <PageShell
      title="Volunteers"
      subtitle="Manage registered volunteers, credentials and assignments."
    >
      <div className="mt-7">

        {/* Top controls */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <div className="relative max-w-md flex-1">

            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search volunteers..."
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/30"
            />

          </div>

          {/* Add */}
          <button
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-medium text-white transition hover:bg-violet-400"
          >
            <Plus size={17} />
            Add Volunteer
          </button>

        </div>

        {/* Stats */}
        <div className="mb-5 flex items-center gap-3">

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/[0.08]">
              <Users
                size={17}
                className="text-violet-300/70"
              />
            </div>

            <div>
              <div className="text-lg font-semibold">
                {volunteers.length}
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Total Volunteers
              </div>
            </div>

          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-white/[0.07] text-left">

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Volunteer
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    College ID
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Department
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Role
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    QR
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Loader2
                        size={22}
                        className="mx-auto animate-spin text-violet-300/60"
                      />

                      <div className="mt-3 text-xs text-white/30">
                        Loading volunteers...
                      </div>
                    </td>
                  </tr>
                ) : filteredVolunteers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Users
                        size={25}
                        className="mx-auto text-white/15"
                      />

                      <div className="mt-3 text-sm text-white/35">
                        No volunteers found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="border-b border-white/[0.05] transition hover:bg-white/[0.018]"
                    >

                      {/* Volunteer */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {volunteer.photoUrl ? (
                            <img
                              src={volunteer.photoUrl}
                              alt={volunteer.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/[0.08] text-sm font-semibold text-violet-200/70">
                              {volunteer.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-medium text-white/85">
                              {volunteer.name}
                            </div>

                            <div className="mt-0.5 text-xs text-white/25">
                              {volunteer.email || "No email"}
                            </div>
                          </div>

                        </div>

                      </td>

                      {/* College ID */}
                      <td className="px-5 py-4">

                        <span className="font-mono text-xs text-white/45">
                          {volunteer.collegeId}
                        </span>

                      </td>

                      {/* Department */}
                      <td className="px-5 py-4 text-sm text-white/45">
                        {volunteer.department || "—"}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">

                        <span className="rounded-lg border border-violet-300/10 bg-violet-300/[0.04] px-2.5 py-1 text-xs text-violet-200/60">
                          {volunteer.role}
                        </span>

                      </td>

                      {/* QR */}
                      <td className="px-5 py-4">

                        {volunteer.qrToken ? (
                          <a
                            href={`/qr/${volunteer.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-violet-400/10 bg-violet-400/[0.04] px-3 py-2 text-xs font-medium text-violet-200/70 transition hover:border-violet-400/20 hover:bg-violet-400/[0.08] hover:text-violet-200"
                          >
                            <QrCode size={15} />
                            View QR
                          </a>
                        ) : (
                          <span className="text-xs text-white/20">
                            No QR
                          </span>
                        )}

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(volunteer)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-violet-200"
                            title="Edit volunteer"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() =>
                              deleteVolunteer(volunteer)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.025] text-red-300/45 transition hover:border-red-400/20 hover:bg-red-400/[0.06] hover:text-red-300"
                            title="Delete volunteer"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold">
                  {editingId
                    ? "Edit Volunteer"
                    : "Add Volunteer"}
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  {editingId
                    ? "Update volunteer information."
                    : "Register a new volunteer and generate their secure QR credential."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            {/* Form */}
            <div className="grid gap-5 p-6 sm:grid-cols-2">

              <Input
                label="Name *"
                value={form.name}
                onChange={(value) =>
                  updateField("name", value)
                }
                placeholder="Volunteer name"
              />

              <Input
                label="College ID *"
                value={form.collegeId}
                onChange={(value) =>
                  updateField("collegeId", value)
                }
                placeholder="College roll number"
              />

              <Input
                label="Department"
                value={form.department}
                onChange={(value) =>
                  updateField("department", value)
                }
                placeholder="CSE"
              />

              <Input
                label="Year"
                value={form.year}
                onChange={(value) =>
                  updateField("year", value)
                }
                placeholder="2nd Year"
              />

              <Input
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
                placeholder="Phone number"
              />

              <Input
                label="Email"
                value={form.email}
                onChange={(value) =>
                  updateField("email", value)
                }
                placeholder="Email address"
              />

              <Input
                label="Photo URL"
                value={form.photoUrl}
                onChange={(value) =>
                  updateField("photoUrl", value)
                }
                placeholder="https://..."
              />

              <Input
                label="Role"
                value={form.role}
                onChange={(value) =>
                  updateField("role", value)
                }
                placeholder="Volunteer"
              />

            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-5">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={saveVolunteer}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

                {editingId
                  ? "Save Changes"
                  : "Create Volunteer"}
              </button>

            </div>

          </div>

        </div>
      )}
    </PageShell>
    </AuthGuard>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-400/30"
      />
    </div>
  );
}
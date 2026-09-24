import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function QRPage({ params }: PageProps) {
  const { id } = await params;

  const volunteer = await prisma.volunteer.findUnique({
    where: {
      id,
    },
  });

  if (!volunteer) {
    notFound();
  }

  const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://freshers2k26-admin.vercel.app"
).replace(/\/$/, "");

const verifyUrl = `${baseUrl}/verify/${volunteer.qrToken}`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 700,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  return (
    <main className="min-h-screen bg-[#050507] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300/50">
            Freshers Event
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Volunteer QR Credential
          </h1>

          <p className="mt-3 text-sm text-white/35">
            Official verification credential for this volunteer.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-2xl">

          {/* QR Section */}
          <div className="flex flex-col items-center border-b border-white/[0.07] px-6 py-10">

            <div className="rounded-3xl bg-white p-5 shadow-[0_0_80px_rgba(139,92,246,0.12)]">
              <img
                src={qrDataUrl}
                alt="Volunteer verification QR code"
                className="h-64 w-64 sm:h-80 sm:w-80"
              />
            </div>

            <div className="mt-6 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-200/50">
                Scan to Verify
              </div>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
                Scan this QR code to verify this volunteer's identity
                and current authorization status.
              </p>
            </div>
          </div>

          {/* Volunteer Details */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Name
              </div>

              <div className="mt-2 text-lg font-medium text-white">
                {volunteer.name}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                College ID
              </div>

              <div className="mt-2 text-lg font-medium text-white">
                {volunteer.collegeId}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Role
              </div>

              <div className="mt-2 text-sm text-violet-200/70">
                {volunteer.role}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Department
              </div>

              <div className="mt-2 text-sm text-white/55">
                {volunteer.department || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Year
              </div>

              <div className="mt-2 text-sm text-white/55">
                {volunteer.year || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Status
              </div>

              <div className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-300/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Registered
              </div>
            </div>

          </div>

          {/* Verification URL */}
          <div className="border-t border-white/[0.07] p-6 sm:p-8">

            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Verification URL
            </div>

            <div className="mt-3 break-all rounded-xl border border-white/[0.07] bg-black/30 px-4 py-4 font-mono text-xs leading-6 text-white/50">
              {verifyUrl}
            </div>

            <p className="mt-3 text-xs leading-5 text-white/25">
              This exact URL is encoded inside the QR code above.
              The verification page checks the live database when
              the QR is scanned.
            </p>
          </div>

        </div>

        {/* Security Information */}
        <div className="mt-5 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.03] p-5">

          <div className="text-xs font-semibold text-emerald-200/70">
            Live database verification
          </div>

          <p className="mt-2 text-xs leading-5 text-white/30">
            The QR code does not store the volunteer's duty status.
            It only contains a secure verification token. Every scan
            checks the latest database information, including the
            volunteer's assigned duty, date and active time window.
          </p>

        </div>

      </div>
    </main>
  );
}
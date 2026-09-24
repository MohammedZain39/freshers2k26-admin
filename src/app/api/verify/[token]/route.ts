import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVENT_TIME_ZONE = "Asia/Kolkata";

function getEventDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getDutyDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: EVENT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid QR token.",
        },
        { status: 400 }
      );
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: {
        qrToken: token,
      },
      include: {
        duties: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          error: "Volunteer not found.",
        },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = getEventDate();

    // Find duties scheduled for today.
    const todaysDuties = volunteer.duties.filter(
      (duty) => getDutyDate(duty.date) === today
    );

    // Person is authorized only if the current time
    // falls inside one of today's assigned duty periods.
    const activeDuty = todaysDuties.find(
      (duty) => now >= duty.startTime && now <= duty.endTime
    );

    const authorized = Boolean(activeDuty);

    let reason = "";

    if (authorized) {
      reason = "Volunteer has an active duty at the time of scanning.";
    } else if (todaysDuties.length === 0) {
      reason = "No duty assigned for today.";
    } else {
      reason = "Volunteer has a duty today, but not at the current time.";
    }

    // Create a real scan log every time the QR is verified.
    const scanLog = await prisma.scanLog.create({
      data: {
        volunteerId: volunteer.id,
        scannedAt: now,
        result: authorized ? "AUTHORIZED" : "DENIED",
        reason,
        gate: "QR Verification",
        scannerId: "PUBLIC-QR",
      },
    });

    return NextResponse.json({
      success: true,

      authorized,

      scannedAt: scanLog.scannedAt,

      scannedAtFormatted: formatTime(scanLog.scannedAt),

      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        collegeId: volunteer.collegeId,
        department: volunteer.department,
        year: volunteer.year,
        phone: volunteer.phone,
        email: volunteer.email,
        photoUrl: volunteer.photoUrl,
        role: volunteer.role,
      },

      duty: activeDuty
        ? {
            id: activeDuty.id,
            team: activeDuty.team,
            location: activeDuty.location,
            description: activeDuty.description,
            startTime: activeDuty.startTime,
            endTime: activeDuty.endTime,
            startTimeFormatted: formatTime(activeDuty.startTime),
            endTimeFormatted: formatTime(activeDuty.endTime),
          }
        : null,

      todaysDuties: todaysDuties.map((duty) => ({
        id: duty.id,
        team: duty.team,
        location: duty.location,
        description: duty.description,
        startTime: duty.startTime,
        endTime: duty.endTime,
        startTimeFormatted: formatTime(duty.startTime),
        endTimeFormatted: formatTime(duty.endTime),
      })),

      reason,
    });
  } catch (error) {
    console.error("VERIFY QR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        authorized: false,
        error: "Verification failed.",
      },
      { status: 500 }
    );
  }
}
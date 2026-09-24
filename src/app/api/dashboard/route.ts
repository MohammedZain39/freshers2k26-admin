import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDateRange(dateString?: string) {
  const date = dateString
    ? new Date(`${dateString}T00:00:00+05:30`)
    : new Date();

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const start = new Date(
    Date.UTC(year, month, day, -5, -30, 0, 0)
  );

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const requestedDate =
      searchParams.get("date") || undefined;

    const { start, end } =
      getDateRange(requestedDate);

    // -----------------------------------------
    // TOTAL VOLUNTEERS
    // -----------------------------------------

    const totalVolunteers =
      await prisma.volunteer.count();

    // -----------------------------------------
    // TODAY'S DUTIES
    // -----------------------------------------

    const duties =
      await prisma.dutyAssignment.findMany({
        where: {
          date: {
            gte: start,
            lt: end,
          },
        },
        include: {
          volunteer: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

    // Unique volunteers assigned today
    const assignedVolunteerIds =
      new Set(
        duties.map(
          (duty) => duty.volunteerId
        )
      );

    const authorizedToday =
      assignedVolunteerIds.size;

    const notAssigned =
      Math.max(
        totalVolunteers - authorizedToday,
        0
      );

    // -----------------------------------------
    // QR SCANS TODAY
    // -----------------------------------------

    const scans =
      await prisma.scanLog.findMany({
        where: {
          scannedAt: {
            gte: start,
            lt: end,
          },
        },
        select: {
          result: true,
        },
      });

    const qrScans = scans.length;

    const allowedScans =
      scans.filter(
        (scan) =>
          scan.result.toUpperCase() ===
            "AUTHORIZED" ||
          scan.result.toUpperCase() ===
            "ALLOWED"
      ).length;

    const deniedScans =
      scans.filter(
        (scan) =>
          scan.result.toUpperCase() ===
            "DENIED" ||
          scan.result.toUpperCase() ===
            "UNAUTHORIZED"
      ).length;

    const accessPulse =
      qrScans > 0
        ? Math.round(
            (allowedScans / qrScans) * 100
          )
        : 0;

    // -----------------------------------------
    // GROUP DUTIES BY TEAM
    // -----------------------------------------

    const teamMap = new Map<
      string,
      {
        team: string;
        location: string;
        assigned: number;
        startTime: Date;
        endTime: Date;
      }
    >();

    for (const duty of duties) {
      const existing =
        teamMap.get(duty.team);

      if (existing) {
        existing.assigned += 1;

        if (
          duty.startTime <
          existing.startTime
        ) {
          existing.startTime =
            duty.startTime;
        }

        if (
          duty.endTime >
          existing.endTime
        ) {
          existing.endTime =
            duty.endTime;
        }
      } else {
        teamMap.set(duty.team, {
          team: duty.team,
          location: duty.location,
          assigned: 1,
          startTime: duty.startTime,
          endTime: duty.endTime,
        });
      }
    }

    const operations =
      Array.from(teamMap.values()).map(
        (team) => ({
          team: team.team,
          location: team.location,
          assigned: team.assigned,
          startTime:
            team.startTime.toISOString(),
          endTime:
            team.endTime.toISOString(),
          percentage:
            authorizedToday > 0
              ? Math.round(
                  (team.assigned /
                    authorizedToday) *
                    100
                )
              : 0,
        })
      );

    // -----------------------------------------
    // RECENT SCANS
    // -----------------------------------------

    const recentScans =
      await prisma.scanLog.findMany({
        where: {
          scannedAt: {
            gte: start,
            lt: end,
          },
        },
        include: {
          volunteer: {
            select: {
              name: true,
              collegeId: true,
            },
          },
        },
        orderBy: {
          scannedAt: "desc",
        },
        take: 10,
      });

    return NextResponse.json({
      success: true,

      date: start.toISOString(),

      stats: {
        totalVolunteers,
        authorizedToday,
        notAssigned,
        qrScans,
        allowedScans,
        deniedScans,
        accessPulse,
      },

      operations,

      recentScans,
    });
  } catch (error) {
    console.error(
      "DASHBOARD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}
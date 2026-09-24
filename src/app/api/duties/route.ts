import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
  GET
  Load duties.

  Optional:
  /api/duties?date=2026-09-24
*/
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    let where = {};

    if (dateParam) {
      const start = new Date(`${dateParam}T00:00:00`);
      const end = new Date(`${dateParam}T23:59:59.999`);

      where = {
        date: {
          gte: start,
          lte: end,
        },
      };
    }

    const duties = await prisma.dutyAssignment.findMany({
      where,
      orderBy: [
        {
          date: "asc",
        },
        {
          startTime: "asc",
        },
      ],
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
            collegeId: true,
            department: true,
            year: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      duties,
    });
  } catch (error) {
    console.error("GET DUTIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load duties.",
      },
      { status: 500 }
    );
  }
}


/*
  POST
  Create a new duty.
*/
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      volunteerId,
      date,
      startTime,
      endTime,
      team,
      location,
      description,
      assignedBy,
    } = body;

    if (
      !volunteerId ||
      !date ||
      !startTime ||
      !endTime ||
      !team ||
      !location
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Volunteer, date, start time, end time, team and location are required.",
        },
        { status: 400 }
      );
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: {
        id: volunteerId,
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        {
          success: false,
          error: "Volunteer not found.",
        },
        { status: 404 }
      );
    }

    const duty = await prisma.dutyAssignment.create({
      data: {
        volunteerId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        team,
        location,
        description: description || null,
        assignedBy: assignedBy || null,
      },
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
            collegeId: true,
            department: true,
            year: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      duty,
    });
  } catch (error) {
    console.error("CREATE DUTY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create duty.",
      },
      { status: 500 }
    );
  }
}


/*
  PUT
  Update an existing duty.
*/
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      volunteerId,
      date,
      startTime,
      endTime,
      team,
      location,
      description,
      assignedBy,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Duty ID is required.",
        },
        { status: 400 }
      );
    }

    const existingDuty = await prisma.dutyAssignment.findUnique({
      where: {
        id,
      },
    });

    if (!existingDuty) {
      return NextResponse.json(
        {
          success: false,
          error: "Duty not found.",
        },
        { status: 404 }
      );
    }

    if (volunteerId) {
      const volunteer = await prisma.volunteer.findUnique({
        where: {
          id: volunteerId,
        },
      });

      if (!volunteer) {
        return NextResponse.json(
          {
            success: false,
            error: "Volunteer not found.",
          },
          { status: 404 }
        );
      }
    }

    const duty = await prisma.dutyAssignment.update({
      where: {
        id,
      },
      data: {
        ...(volunteerId !== undefined && {
          volunteerId,
        }),

        ...(date !== undefined && {
          date: new Date(date),
        }),

        ...(startTime !== undefined && {
          startTime: new Date(startTime),
        }),

        ...(endTime !== undefined && {
          endTime: new Date(endTime),
        }),

        ...(team !== undefined && {
          team,
        }),

        ...(location !== undefined && {
          location,
        }),

        ...(description !== undefined && {
          description: description || null,
        }),

        ...(assignedBy !== undefined && {
          assignedBy: assignedBy || null,
        }),
      },
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
            collegeId: true,
            department: true,
            year: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      duty,
    });
  } catch (error) {
    console.error("UPDATE DUTY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update duty.",
      },
      { status: 500 }
    );
  }
}


/*
  DELETE
  Delete a duty assignment.
*/
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Duty ID is required.",
        },
        { status: 400 }
      );
    }

    const existingDuty = await prisma.dutyAssignment.findUnique({
      where: {
        id,
      },
    });

    if (!existingDuty) {
      return NextResponse.json(
        {
          success: false,
          error: "Duty not found.",
        },
        { status: 404 }
      );
    }

    await prisma.dutyAssignment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Duty deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE DUTY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete duty.",
      },
      { status: 500 }
    );
  }
}
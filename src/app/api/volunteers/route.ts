import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET — Load all volunteers
// =====================================================
export async function GET() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        duties: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      volunteers,
    });
  } catch (error) {
    console.error("GET VOLUNTEERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load volunteers.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST — Create volunteer
// =====================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      collegeId,
      department,
      year,
      phone,
      email,
      photoUrl,
      role,
    } = body;

    if (!name || !collegeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and college ID are required.",
        },
        { status: 400 }
      );
    }

    // Check duplicate college ID
    const existing = await prisma.volunteer.findUnique({
      where: {
        collegeId,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A volunteer with this college ID already exists.",
        },
        { status: 409 }
      );
    }

    // Secure unique QR token
    const qrToken = crypto.randomBytes(32).toString("hex");

    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        collegeId,
        department: department || null,
        year: year || null,
        phone: phone || null,
        email: email || null,
        photoUrl: photoUrl || null,
        role: role || "Volunteer",
        qrToken,
      },
    });

    return NextResponse.json({
      success: true,
      volunteer,
    });
  } catch (error) {
    console.error("CREATE VOLUNTEER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create volunteer.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT — Edit volunteer
// =====================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      collegeId,
      department,
      year,
      phone,
      email,
      photoUrl,
      role,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Volunteer ID is required.",
        },
        { status: 400 }
      );
    }

    if (!name || !collegeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and college ID are required.",
        },
        { status: 400 }
      );
    }

    // Make sure volunteer exists
    const existing = await prisma.volunteer.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Volunteer not found.",
        },
        { status: 404 }
      );
    }

    // Prevent another volunteer from using same college ID
    const duplicate = await prisma.volunteer.findFirst({
      where: {
        collegeId,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Another volunteer already uses this college ID.",
        },
        { status: 409 }
      );
    }

    // IMPORTANT:
    // qrToken is NOT changed.
    // Existing physical ID cards will continue working.
    const volunteer = await prisma.volunteer.update({
      where: {
        id,
      },
      data: {
        name,
        collegeId,
        department: department || null,
        year: year || null,
        phone: phone || null,
        email: email || null,
        photoUrl: photoUrl || null,
        role: role || "Volunteer",
      },
    });

    return NextResponse.json({
      success: true,
      volunteer,
    });
  } catch (error) {
    console.error("UPDATE VOLUNTEER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update volunteer.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE — Delete volunteer
// =====================================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Volunteer ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.volunteer.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Volunteer not found.",
        },
        { status: 404 }
      );
    }

    await prisma.volunteer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Volunteer deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE VOLUNTEER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete volunteer.",
      },
      { status: 500 }
    );
  }
}
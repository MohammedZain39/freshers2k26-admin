import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.eventSettings.findFirst();

    if (!settings) {
      settings = await prisma.eventSettings.create({
        data: {
          eventName: "Freshers",
          eventYear: "2026",
          eventStatus: "ACTIVE",
          allowVerification: true,
          showVolunteerPhone: false,
          showVolunteerEmail: false,
        },
      });
    }

    const admin = await prisma.adminUser.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      admin,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load settings.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      eventName,
      eventYear,
      eventStatus,
      allowVerification,
      showVolunteerPhone,
      showVolunteerEmail,
      adminName,
      adminEmail,
    } = body;

    let settings = await prisma.eventSettings.findFirst();

    if (!settings) {
      settings = await prisma.eventSettings.create({
        data: {
          eventName: eventName || "Freshers",
          eventYear: eventYear || "2026",
          eventStatus: eventStatus || "ACTIVE",
          allowVerification:
            allowVerification ?? true,
          showVolunteerPhone:
            showVolunteerPhone ?? false,
          showVolunteerEmail:
            showVolunteerEmail ?? false,
        },
      });
    } else {
      settings = await prisma.eventSettings.update({
        where: {
          id: settings.id,
        },
        data: {
          eventName: eventName || "Freshers",
          eventYear: eventYear || "2026",
          eventStatus: eventStatus || "ACTIVE",
          allowVerification:
            allowVerification ?? true,
          showVolunteerPhone:
            showVolunteerPhone ?? false,
          showVolunteerEmail:
            showVolunteerEmail ?? false,
        },
      });
    }

    let admin = await prisma.adminUser.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (admin && (adminName || adminEmail)) {
      admin = await prisma.adminUser.update({
        where: {
          id: admin.id,
        },
        data: {
          ...(adminName
            ? { name: adminName }
            : {}),
          ...(adminEmail
            ? { email: adminEmail }
            : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      admin: admin
        ? {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          }
        : null,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save settings.",
      },
      { status: 500 }
    );
  }
}
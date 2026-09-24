// src/app/api/scanner/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const qrToken =
      typeof body.qrToken === 'string'
        ? body.qrToken.trim()
        : '';

    if (!qrToken) {
      return NextResponse.json(
        {
          authorized: false,
          reason: 'No QR token was provided.',
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * The QR must contain the volunteer's
     * secure qrToken.
     *
     * We NEVER trust the name, college ID,
     * role or authorization status coming
     * from the QR itself.
     */

    const volunteer =
      await prisma.volunteer.findUnique({
        where: {
          qrToken,
        },
        select: {
          id: true,
          name: true,
          collegeId: true,
          department: true,
          year: true,
          role: true,
        },
      });

    if (!volunteer) {
      await prisma.scanLog.create({
        data: {
          result: 'DENIED',
          reason: 'Invalid QR token',
        },
      });

      return NextResponse.json({
        authorized: false,
        reason:
          'This QR code is not registered in the event system.',
      });
    }

    /*
     * Use the server's current date.
     * Do not take the date from the QR code.
     */

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    /*
     * Find a duty assigned to this volunteer
     * for TODAY.
     */

    const duty =
      await prisma.dutyAssignment.findFirst({
        where: {
          volunteerId: volunteer.id,

          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

    if (!duty) {
      await prisma.scanLog.create({
        data: {
          volunteerId: volunteer.id,
          result: 'DENIED',
          reason:
            'No duty assigned for today.',
        },
      });

      return NextResponse.json({
        authorized: false,
        reason:
          'This volunteer has no assigned duty for today.',
        volunteer,
      });
    }

    /*
     * Check whether the current time is
     * inside the assigned duty period.
     */

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    const startMinutes =
      duty.startTime.getHours() * 60 +
      duty.startTime.getMinutes();

    const endMinutes =
      duty.endTime.getHours() * 60 +
      duty.endTime.getMinutes();

    const currentlyOnDuty =
      currentMinutes >= startMinutes &&
      currentMinutes <= endMinutes;

    if (!currentlyOnDuty) {
      await prisma.scanLog.create({
        data: {
          volunteerId: volunteer.id,
          result: 'DENIED',
          reason:
            'Volunteer has a duty today, but is outside the assigned duty time.',
        },
      });

      return NextResponse.json({
        authorized: false,
        reason:
          'You are not currently within your assigned duty time.',
        volunteer,
        duty: {
          team: duty.team,
          location: duty.location,
          startTime:
            duty.startTime.toISOString(),
          endTime:
            duty.endTime.toISOString(),
          description:
            duty.description,
        },
      });
    }

    /*
     * EVERYTHING passed:
     *
     * 1. QR exists
     * 2. QR belongs to registered volunteer
     * 3. Volunteer has duty today
     * 4. Current time is inside duty period
     *
     * Therefore access is permitted.
     */

    await prisma.scanLog.create({
      data: {
        volunteerId: volunteer.id,
        result: 'AUTHORIZED',
        reason:
          'Valid QR and active duty assignment.',
      },
    });

    return NextResponse.json({
      authorized: true,
      reason:
        'Valid ID and active duty assignment.',
      volunteer,
      duty: {
        team: duty.team,
        location: duty.location,
        startTime:
          duty.startTime.toISOString(),
        endTime:
          duty.endTime.toISOString(),
        description:
          duty.description,
      },
    });
  } catch (error) {
    console.error(
      'QR verification error:',
      error
    );

    return NextResponse.json(
      {
        authorized: false,
        reason:
          'Verification service temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.scanLog.findMany({
      orderBy: {
        scannedAt: 'desc',
      },
      take: 100,
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
            collegeId: true,
            department: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('ACTIVITY LOGS ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load activity logs.',
      },
      { status: 500 }
    );
  }
}
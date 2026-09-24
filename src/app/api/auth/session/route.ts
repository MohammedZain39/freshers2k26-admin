import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return NextResponse.json(
        { authenticated: false },
        { status: 500 }
      );
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );

    response.cookies.delete("admin_session");

    return response;
  }
}

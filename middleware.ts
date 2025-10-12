import { NextResponse } from "next/server";

export async function middleware() {
  // Completely disable middleware for now to test core functionality
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};

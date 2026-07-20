import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:3000";

export function proxy(request: NextRequest) {
  const backendUrl = (process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  );
  const backendPath = request.nextUrl.pathname.slice("/api".length) || "/";
  const destination = new URL(`${backendUrl}${backendPath}`);

  destination.search = request.nextUrl.search;

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: "/api/:path*",
};

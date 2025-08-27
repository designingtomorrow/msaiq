import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect everything except Next assets, /login, and the login API
export const config = {
  matcher: ["/((?!_next|favicon\\.ico|login|api/login).*)"],
};

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("msaiq_auth")?.value === "ok";
  if (!authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
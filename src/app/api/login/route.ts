import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const fd = await req.formData();
  const code = String(fd.get("code") || "");
  if (code === process.env.MSAIQ_PASSCODE) {
    const res = NextResponse.redirect(new URL("/console", req.url));
    res.cookies.set("msaiq_auth", "ok", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }
  return NextResponse.redirect(new URL("/login?error=1", req.url));
}

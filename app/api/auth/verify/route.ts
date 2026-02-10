import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    return NextResponse.json({ error: "No password configured" }, { status: 500 })
  }

  if (password === sitePassword) {
    const cookieStore = await cookies()
    cookieStore.set("site-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}

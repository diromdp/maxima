import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_COOKIE } from "@/src/lib/auth/tokens"

import { apiResponse } from "./client"

const SESSION_ENDED = "Sesi kamu sudah berakhir. Silakan masuk kembali."
const INVALID_PATH = "Alamat data tidak dikenal."
const PASSED_HEADERS = ["Content-Type", "Content-Disposition"] as const

const failure = (status: number, error: string, message: string) =>
  NextResponse.json({ error, message, details: [] }, { status })

export async function forward(
  request: NextRequest,
  segments: readonly string[],
  method: "GET" | "POST",
): Promise<Response> {
  if (segments.some((segment) => segment === "." || segment === ".." || segment.includes("/"))) {
    return failure(404, "Not Found", INVALID_PATH)
  }
  if (!(await cookies()).get(ACCESS_COOKIE)) return failure(401, "Unauthorized", SESSION_ENDED)

  const upstream = await apiResponse(
    `/${segments.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
    method === "POST" ? { method, body: await request.json().catch(() => ({})) } : {},
  )
  const headers = new Headers()
  for (const name of PASSED_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
}

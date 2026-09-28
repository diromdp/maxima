import type { NextRequest } from "next/server"

import { forward } from "@/src/lib/api/forward"

type Context = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, { params }: Context): Promise<Response> {
  return forward(request, (await params).path, "GET")
}

"use client"

import { notify } from "../notify"

import { ApiError, errorOf } from "./errors"

const CONNECTION_LOST = "Koneksi terputus. Periksa jaringan lalu coba lagi."
const BLOB_LIFETIME_MS = 60_000

async function download(path: string, body?: unknown): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`/api/download${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(503, "Unavailable", CONNECTION_LOST, [])
  }
  if (!response.ok) throw await errorOf(response)
  return response
}

async function openInNewTab(resolveUrl: () => Promise<string>): Promise<void> {
  const tab = window.open("", "_blank")
  try {
    const url = await resolveUrl()
    if (tab) {
      tab.opener = null
      tab.location.href = url
    } else {
      window.location.assign(url)
    }
  } catch (error) {
    tab?.close()
    throw error
  }
}

export function openPresigned(path: string, body?: unknown): Promise<void> {
  return openInNewTab(async () => {
    const { url } = (await (await download(path, body)).json()) as { url: string }
    return url
  })
}

export async function previewPresigned(path: string, body?: unknown): Promise<void> {
  try {
    await openPresigned(path, body)
  } catch (error) {
    if (error instanceof ApiError) notify.error(error.message)
    else throw error
  }
}

export function openStoredObject(key: string): Promise<void> {
  return openPresigned("/downloads/presign", { key })
}

export function openRenderedFile(path: string, body?: unknown): Promise<void> {
  return openInNewTab(async () => {
    const url = URL.createObjectURL(await (await download(path, body)).blob())
    setTimeout(() => URL.revokeObjectURL(url), BLOB_LIFETIME_MS)
    return url
  })
}

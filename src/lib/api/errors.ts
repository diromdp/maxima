export type FieldError = { field: string; message: string }

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    message: string,
    readonly details: readonly FieldError[],
  ) {
    super(message)
  }
}

export type QueryValue = string | number | boolean | null | undefined | readonly string[]

export type Page<T> = { data: T[]; meta: { page: number; perPage: number; total: number } }

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; fieldErrors: Record<string, string> }

export function failureOf<T = null>(message: string, field?: string): ActionResult<T> {
  return { ok: false, status: 0, message, fieldErrors: field ? { [field]: message } : {} }
}

export const FALLBACK_MESSAGE = "Server sedang tidak dapat dihubungi. Coba lagi sebentar lagi."

export function queryString(query: Record<string, QueryValue> | undefined): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
    else params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ""
}

export async function errorOf(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  if (typeof body === "object" && body !== null && "message" in body) {
    const shaped = body as { error?: string; message: string; details?: FieldError[] }
    return new ApiError(response.status, shaped.error ?? "", shaped.message, shaped.details ?? [])
  }
  return new ApiError(response.status, "", FALLBACK_MESSAGE, [])
}

export async function actionOf<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    return {
      ok: false,
      status: error.status,
      message: error.message,
      fieldErrors: Object.fromEntries(
        error.details.map((detail) => [detail.field, detail.message]),
      ),
    }
  }
}

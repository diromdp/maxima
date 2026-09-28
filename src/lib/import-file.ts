export type ImportIssue = { row: number; reasons: string[] }

export type ImportReport = {
  accepted: number
  skipped: ImportIssue[]
  rejected: ImportIssue[]
  written: number
}

export type ImportStep = "preview" | "commit"

export function base64Of(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = () => reject(reader.error ?? new Error("Berkas tidak dapat dibaca."))
    reader.readAsDataURL(file)
  })
}

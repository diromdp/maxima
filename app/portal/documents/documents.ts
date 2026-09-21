export type FileStatus =
  "Terverifikasi" | "Menunggu" | "Belum diunggah" | "Ditolak" | "Diproses" | "Selesai"

export type FileItem = {
  readonly name: string
  readonly kind?: "video"
  readonly source?: string
  readonly note?: string
  readonly date?: string
  readonly status: FileStatus
  readonly reason?: string
}

export type StudentRole = "upload" | "download"

export type DocumentGroup = {
  readonly id: string
  readonly name: string
  readonly note: string
  readonly role: StudentRole
  readonly requiresVertrag?: boolean
  readonly files: readonly FileItem[]
}

const DONE_STATUSES: readonly FileStatus[] = ["Terverifikasi", "Selesai"]

export const DOCUMENT_GROUPS: readonly DocumentGroup[] = [
  {
    id: "pribadi",
    name: "Pribadi",
    note: "Wajib saat pendaftaran",
    role: "upload",
    files: [
      { name: "Pas foto", date: "2025-02-12", status: "Terverifikasi" },
      { name: "Akta kelahiran", date: "2025-02-12", status: "Terverifikasi" },
      { name: "Kartu keluarga", date: "2025-02-12", status: "Terverifikasi" },
      { name: "KTP", date: "2025-02-12", status: "Terverifikasi" },
      { name: "Ijazah terakhir", date: "2025-02-12", status: "Terverifikasi" },
      { name: "Transkrip terakhir", date: "2025-02-12", status: "Terverifikasi" },
    ],
  },
  {
    id: "hasil-layanan",
    name: "Hasil Layanan",
    note: "Diproses Maxima, Anda tinggal mengunduh",
    role: "download",
    files: [
      { name: "Paspor", date: "2025-03-14", status: "Selesai" },
      { name: "Terjemahan akta lahir", status: "Diproses" },
      { name: "Terjemahan ijazah & transkrip", status: "Diproses" },
      { name: "Apostille akta lahir", status: "Diproses" },
      { name: "Apostille ijazah", status: "Diproses" },
    ],
  },
  {
    id: "bewerbung",
    name: "Bewerbung",
    note: "Dibutuhkan sebelum pengajuan ke partner",
    role: "upload",
    files: [
      { name: "Sertifikat bahasa B1", status: "Belum diunggah" },
      { name: "Lebenslauf (CV Jerman)", date: "2025-07-20", status: "Terverifikasi" },
      { name: "Motivationsschreiben", date: "2025-08-28", status: "Menunggu" },
      { name: "Video perkenalan", kind: "video", date: "2025-08-28", status: "Menunggu" },
    ],
  },
  {
    id: "dari-betrieb",
    name: "Dari Betrieb",
    note: "Terbuka setelah Anda berstatus Dapat Vertrag",
    role: "upload",
    requiresVertrag: true,
    files: [
      { name: "Vertrag", source: "Vertrag_Betrieb.pdf", status: "Belum diunggah" },
      { name: "Krankenversicherung", source: "Krankenversicherung.pdf", status: "Belum diunggah" },
      { name: "IHK", source: "IHK_Anmeldung.pdf", status: "Belum diunggah" },
      { name: "Rahmenplan", source: "Rahmenplan.pdf", status: "Belum diunggah" },
    ],
  },
]

export function progress(r: DocumentGroup): { readonly done: number; readonly total: number } {
  return {
    done: r.files.filter((b) => DONE_STATUSES.includes(b.status)).length,
    total: r.files.length,
  }
}

export function isLocked(r: DocumentGroup, hasVertrag: boolean): boolean {
  return r.requiresVertrag === true && !hasVertrag
}

export type GroupTone = "beres" | "berjalan" | "tindakan" | "terkunci"

export type GroupSummary = {
  readonly done: number
  readonly total: number
  readonly tone: GroupTone
  readonly caption: string
}

function countStatus(r: DocumentGroup, status: FileStatus): number {
  return r.files.filter((b) => b.status === status).length
}

export function summarize(r: DocumentGroup, hasVertrag: boolean): GroupSummary {
  const { done, total } = progress(r)

  if (isLocked(r, hasVertrag)) {
    return { done, total, tone: "terkunci", caption: r.note }
  }
  if (done === total) {
    return { done, total, tone: "beres", caption: "Semua berkas sudah beres" }
  }
  if (r.role === "download") {
    return {
      done,
      total,
      tone: "berjalan",
      caption: `${total - done} berkas masih diproses Maxima`,
    }
  }

  const missing = countStatus(r, "Belum diunggah") + countStatus(r, "Ditolak")
  const waiting = countStatus(r, "Menunggu")
  if (missing > 0) {
    return { done, total, tone: "tindakan", caption: `${missing} berkas perlu Anda unggah` }
  }
  return { done, total, tone: "berjalan", caption: `${waiting} berkas menunggu verifikasi` }
}

export function canUpload(r: DocumentGroup, b: FileItem, hasVertrag: boolean): boolean {
  return r.role === "upload" && !isLocked(r, hasVertrag) && b.status !== "Diproses"
}

export function canDownload(b: FileItem): boolean {
  return (
    b.source !== undefined ||
    b.status === "Terverifikasi" ||
    b.status === "Selesai" ||
    b.status === "Menunggu"
  )
}

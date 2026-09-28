import { z } from "zod"

import type { DocumentState } from "@/src/entities/student/schema"

export type { DocumentState }

type Named = { id: string; name: string }

export const DOCUMENT_GROUPS = ["Pribadi", "Hasil Layanan", "Bewerbung", "Dari Betrieb"] as const
export type DocumentGroup = (typeof DOCUMENT_GROUPS)[number]

export const DOCUMENT_FILTERS = ["verification", "branch", "program"] as const

export const VERIFICATION_OPTIONS = [
  { value: "pending", label: "Ada yang menunggu" },
  { value: "none", label: "Tidak ada yang menunggu" },
] as const

export const GROUP_TITLES: Readonly<Record<DocumentGroup, string>> = {
  Pribadi: "Data Pribadi",
  "Hasil Layanan": "Hasil Layanan",
  Bewerbung: "Bewerbung (Persiapan Lamaran)",
  "Dari Betrieb": "Dari Betrieb (Dokumen Perusahaan)",
}

export const STATE_BADGE: Readonly<Record<DocumentState, string>> = {
  Lengkap: "badge-beres",
  "Perlu Verifikasi": "badge-berjalan",
  Diproses: "badge-berjalan",
  Ditolak: "badge-tindakan",
  "Belum Diunggah": "badge-tindakan",
}

export type GroupCount = {
  group: DocumentGroup
  complete: number
  total: number
}

export type DocumentIndexRow = {
  studentId: string
  nis: string
  name: string
  package: Named | null
  branch: Named | null
  groups: GroupCount[]
  pending: number
}

export type DocumentIndexSummary = { pendingDocuments: number; pendingStudents: number }

export type DocumentItem = {
  documentId: string | null
  code: string | null
  name: string
  producer: "student" | "admission" | "service"
  state: DocumentState
  isOptional: boolean
  objectKey: string | null
  originalName: string | null
  rejectReason: string | null
  uploadedAt: string | null
}

export type DocumentDetail = {
  summary: {
    studentId: string
    nis: string
    name: string
    package: Named | null
    branch: Named | null
    program: Named | null
    complete: number
    total: number
    pending: number
  }
  groups: (GroupCount & { pending: number; items: DocumentItem[] })[]
}

export const rejectDocumentFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Alasan penolakan wajib diisi; siswa membacanya apa adanya.")
    .max(500, "Alasan paling panjang 500 karakter."),
})

export type RejectDocumentForm = z.infer<typeof rejectDocumentFormSchema>

export const completenessTone = ({ complete, total }: Pick<GroupCount, "complete" | "total">) =>
  complete === total ? "badge-beres" : complete === 0 ? "badge-tindakan" : "badge-berjalan"

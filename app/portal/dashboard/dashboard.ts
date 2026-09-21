import { gte, shortfall, type Money } from "../../../src/lib/money.ts"
import {
  installmentLabel,
  nextDueDate,
  nextInstallmentNumber,
  type Service,
  shortfallAmount,
  totalPaid,
  type Transaction,
} from "../payments/payments.ts"
import { type DocumentGroup, summarize } from "../documents/documents.ts"

export type StudentStatus = "active" | "leave" | "alumni"

export type Student = {
  readonly nis: string
  readonly name: string
  readonly packageName: string | null
  readonly branch: string | null
  readonly pic: string | null
  readonly status: StudentStatus
  readonly leave: { readonly until: string; readonly returnDate: string } | null
  readonly placement: {
    readonly company: string
    readonly school: string
    readonly city: string
  } | null
}

export const STUDENT: Student = {
  nis: "20250233",
  name: "Andi Nugroho",
  packageName: "Ausbildung 45",
  branch: "Cabang Bandung",
  pic: "PIC Ratna Sari",
  status: "active",
  leave: null,
  placement: null,
}

export const HAS_VERTRAG = false

export type HistoryRow = {
  readonly id: string
  readonly date: string
  readonly description: string
  readonly amount: Money
  readonly status: Transaction["status"]
}

export function deriveHistory(
  transactions: readonly Transaction[],
  limit?: number,
): readonly HistoryRow[] {
  const newest = transactions
    .map((t, index) => ({
      id: t.id,
      date: t.date,
      description: installmentLabel(index),
      amount: t.amount,
      status: t.status,
    }))
    .reverse()
  return limit === undefined ? newest : newest.slice(0, limit)
}

export type ServiceRow = {
  readonly name: string
  readonly unlocked: boolean
  readonly remaining: Money | null
}

export function deriveServices(
  services: readonly Service[],
  paid: Money,
  hasVertrag: boolean,
): readonly ServiceRow[] {
  return services.map((s) =>
    s.threshold === null
      ? { name: s.name, unlocked: hasVertrag, remaining: null }
      : { name: s.name, unlocked: gte(paid, s.threshold), remaining: shortfall(s.threshold, paid) },
  )
}

export function deriveServiceSummary(rows: readonly ServiceRow[]): {
  readonly unlocked: number
  readonly total: number
  readonly pending: number
} {
  const unlocked = rows.filter((r) => r.unlocked).length
  const pending = rows.filter((r) => !r.unlocked && r.remaining !== null).length
  return { unlocked, total: rows.length, pending }
}

export function deriveNextService(rows: readonly ServiceRow[]): ServiceRow | null {
  return rows.find((r) => !r.unlocked && r.remaining !== null) ?? null
}

export type LevelStatus = "Lulus" | "Berjalan" | "Belum mulai"

export type Level = {
  readonly level: string
  readonly status: LevelStatus
  readonly score: number | null
  readonly chapter: number | null
}

export const CHAPTERS_PER_LEVEL = 12

export const LEVELS: readonly Level[] = [
  { level: "A1", status: "Lulus", score: 82, chapter: null },
  { level: "A2", status: "Berjalan", score: null, chapter: 7 },
  { level: "B1", status: "Belum mulai", score: null, chapter: null },
  { level: "B2", status: "Belum mulai", score: null, chapter: null },
]

export function deriveLevelLabel(l: Level): string {
  if (l.status === "Lulus" && l.score !== null) return `Lulus · nilai ${l.score}`
  if (l.status === "Berjalan" && l.chapter !== null) return `Berjalan · bab ${l.chapter}`
  return l.status
}

export function deriveCurrentLevel(level: readonly Level[]): Level | null {
  return (
    level.find((l) => l.status === "Berjalan") ??
    [...level].reverse().find((l) => l.status === "Lulus") ??
    null
  )
}

export type Classroom = {
  readonly name: string
  readonly schedule: string
  readonly teacher: string
}

export const CLASSROOM: Classroom | null = {
  name: "Kelas Berlin",
  schedule: "Senin dan Rabu 08.00 sampai 12.00",
  teacher: "Pengajar Mulyadi, S.Pd",
}

export const ATTENDANCE = { present: 41, expected: 45 } as const

export const CLASS_AVERAGE = 78

export function deriveAttendance(k: { present: number; expected: number }): number {
  return k.expected === 0 ? 0 : k.present / k.expected
}

export function showAttendance(student: Student): boolean {
  return student.status !== "leave"
}

export type DocumentTone = "beres" | "berjalan" | "tindakan" | "terkunci"

export type DocumentRow = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tone: DocumentTone
}

export function deriveDocuments(
  groups: readonly DocumentGroup[],
  hasVertrag: boolean,
): readonly DocumentRow[] {
  return groups.map((g) => {
    const { done, total, tone } = summarize(g, hasVertrag)
    return {
      id: g.id,
      name: g.name,
      description: tone === "terkunci" ? "belum dibuka" : `${done} dari ${total}`,
      tone,
    }
  })
}

export function deriveIdentity(student: Student): string {
  return [`NIS ${student.nis}`, student.packageName, student.branch, student.pic]
    .filter(Boolean)
    .join(" · ")
}

export type CurrentStep = {
  readonly tone: "tindakan" | "berjalan" | "beres"
  readonly label: string
  readonly title: string
  readonly detail: string
  readonly action: { readonly label: string; readonly href: string } | null
}

export function deriveCurrentStep(
  student: Student,
  transactions: readonly Transaction[],
  services: readonly Service[],
  formatDate: (iso: string) => string,
): CurrentStep {
  if (student.status === "alumni") {
    const p = student.placement
    return {
      tone: "beres",
      label: "Penempatan Anda",
      title: p ? `${p.company} · ${p.city}` : "Data penempatan belum lengkap",
      detail: p
        ? `Sekolah ${p.school}. Berkas keberangkatan Anda tersimpan di Pemberkasan Alumni.`
        : "Lengkapi data penempatan Anda di Pemberkasan Alumni supaya berkasnya dapat diverifikasi.",
      action: { label: "Buka Pemberkasan Alumni", href: "/portal/alumni-files" },
    }
  }

  if (student.status === "leave") {
    return {
      tone: "berjalan",
      label: "Anda sedang cuti",
      title: student.leave
        ? `Masa cuti sampai ${formatDate(student.leave.until)}`
        : "Masa cuti berjalan",
      detail: student.leave
        ? `Rencana masuk kembali ${formatDate(student.leave.returnDate)}. Tagihan dan pengingat berhenti selama masa cuti; pembayaran yang masuk tetap membuka layanan.`
        : "Tagihan dan pengingat berhenti selama masa cuti; pembayaran yang masuk tetap membuka layanan.",
      action: { label: "Lihat Riwayat Cuti", href: "/portal/leave" },
    }
  }

  const paid = totalPaid(transactions)
  const nextService = deriveNextService(deriveServices(services, paid, HAS_VERTRAG))
  const remaining = shortfallAmount(transactions)

  if (remaining.amount === 0) {
    return {
      tone: "beres",
      label: "Langkah Anda sekarang",
      title: "Pembayaran Anda sudah lunas",
      detail: "Seluruh layanan pada paket Anda sudah terbuka.",
      action: null,
    }
  }

  return {
    tone: "tindakan",
    label: "Langkah Anda sekarang",
    title: `Bayar angsuran ke-${nextInstallmentNumber(transactions)} sebelum ${formatDate(nextDueDate(transactions))}`,
    detail: nextService
      ? `Setelah pembayaran masuk, layanan ${nextService.name} terbuka otomatis.`
      : "Setelah pembayaran masuk, sisa tagihan paket Anda ikut berkurang.",
    action: { label: "Bayar Sekarang", href: "/portal/payments" },
  }
}

import { z } from "zod"

export const CLASS_STATUSES = ["Draft", "Aktif", "Ditutup"] as const
export type ClassStatus = (typeof CLASS_STATUSES)[number]

export const WEEK_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const
export type WeekDay = (typeof WEEK_DAYS)[number]

export const DAY_SHORT: Readonly<Record<WeekDay, string>> = {
  Senin: "Sen",
  Selasa: "Sel",
  Rabu: "Rab",
  Kamis: "Kam",
  Jumat: "Jum",
  Sabtu: "Sab",
  Minggu: "Min",
}

export type Ref = { readonly id: string; readonly name: string }

export type ClassRow = {
  readonly id: string
  readonly name: string
  readonly level: Ref
  readonly branch: Ref
  readonly teacher: Ref | null
  readonly capacity: number
  readonly memberCount: number
  readonly days: readonly WeekDay[]
  readonly startTime: string
  readonly endTime: string
  readonly schedule: string
  readonly startDate: string
  readonly endDate: string
  readonly status: ClassStatus
}

export type ClassFilters = {
  readonly search?: string
  readonly branch?: string
  readonly level?: string
  readonly status?: ClassStatus
}

export const CLASS_FILTERS = ["branch", "level", "status"] as const

export function classFiltersOf(params: {
  search?: string
  branch?: string
  level?: string
  status?: string
}): ClassFilters {
  const status = CLASS_STATUSES.find((value) => value === params.status)
  return {
    search: params.search,
    branch: params.branch,
    level: params.level,
    status,
  }
}

export type MemberStatus = "Aktif" | "Cuti" | "Keluar"

export type MemberRow = {
  readonly studentId: string
  readonly nis: string | null
  readonly fullName: string
  readonly status: MemberStatus
  readonly joinedOn: string
  readonly leftOn: string | null
  readonly attendanceRate: number | null
  readonly averageScore: number | null
  readonly lastChapter: string | null
}

export type CandidateRow = {
  readonly studentId: string
  readonly nis: string | null
  readonly fullName: string
  readonly branchName: string | null
  readonly levelName: string | null
  readonly currentClassName: string | null
  readonly isAwaitingNewLevel: boolean
}

export type Candidates = {
  readonly capacity: number
  readonly memberCount: number
  readonly remainingSeats: number
  readonly level: Ref
  readonly data: readonly CandidateRow[]
}

export type CalendarEntry =
  | {
      readonly kind: "class"
      readonly date: string
      readonly classId: string
      readonly className: string
      readonly levelName: string
      readonly startTime: string
      readonly endTime: string
    }
  | {
      readonly kind: "exam"
      readonly date: string
      readonly name: string
      readonly levelName: string
    }

export type KkmRow = {
  readonly levelId: string
  readonly levelName: string
  readonly kkm: number | null
  readonly activeClasses: number
}

export type PeriodStatus = "Aktif" | "Nonaktif"
export const PERIOD_STATUSES: readonly PeriodStatus[] = ["Aktif", "Nonaktif"]

export type PeriodRow = {
  readonly id: string
  readonly name: string
  readonly startDate: string
  readonly endDate: string
  readonly status: PeriodStatus
}

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Isi jam, misalnya 08:00.")

export const classFormSchema = z
  .object({
    name: z.string().trim().min(1, "Isi nama kelas.").max(80),
    levelId: z.string().min(1, "Pilih level."),
    branchId: z.string().min(1, "Pilih cabang."),
    teacherUserId: z.string().nullable(),
    capacity: z.number("Isi kapasitas.").int("Kapasitas harus angka bulat.").min(1).max(200),
    status: z.enum(CLASS_STATUSES),
    days: z.array(z.enum(WEEK_DAYS)).min(1, "Pilih minimal satu hari belajar."),
    startTime: clock,
    endTime: clock,
    startDate: z.iso.date("Pilih tanggal mulai."),
    endDate: z.iso.date("Pilih tanggal selesai."),
  })
  .refine((form) => form.endTime > form.startTime, {
    path: ["endTime"],
    message: "Jam selesai harus sesudah jam mulai.",
  })
  .refine((form) => form.endDate >= form.startDate, {
    path: ["endDate"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  })

export type ClassForm = {
  name: string
  levelId: string
  branchId: string
  teacherUserId: string | null
  capacity: number | ""
  status: ClassStatus
  days: WeekDay[]
  startTime: string
  endTime: string
  startDate: string
  endDate: string
}

const reason = z.string().trim().min(5, "Alasan minimal lima karakter.").max(500)

export const reasonFormSchema = z.object({ reason })
export type ReasonForm = { reason: string }

export const transferFormSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Pilih minimal satu siswa."),
  targetClassId: z.string().min(1, "Pilih kelas tujuan."),
  reason,
  isOverCapacityConfirmed: z.boolean(),
})

export type TransferForm = {
  studentIds: string[]
  targetClassId: string
  reason: string
  isOverCapacityConfirmed: boolean
}

export const periodFormSchema = z
  .object({
    name: z.string().trim().min(1, "Isi nama periode.").max(60, "Paling banyak 60 huruf."),
    startDate: z.iso.date("Pilih tanggal mulai."),
    endDate: z.iso.date("Pilih tanggal selesai."),
    status: z.enum(["Aktif", "Nonaktif"]),
  })
  .refine((form) => form.endDate >= form.startDate, {
    path: ["endDate"],
    message: "Tanggal selesai periode tidak boleh sebelum tanggal mulai.",
  })

export type PeriodForm = { name: string; startDate: string; endDate: string; status: PeriodStatus }

export const scheduleLabel = (days: readonly WeekDay[], startTime: string, endTime: string) =>
  `${WEEK_DAYS.filter((day) => days.includes(day))
    .map((day) => DAY_SHORT[day])
    .join(" ")} ${startTime}-${endTime}`

export const classLabel = (room: Pick<ClassRow, "name" | "level">) =>
  `${room.name} (${room.level.name})`

export const capacityLabel = (room: Pick<ClassRow, "memberCount" | "capacity">) =>
  `${room.memberCount}/${room.capacity}`

export const seatsLeft = (room: Pick<ClassRow, "memberCount" | "capacity">) =>
  Math.max(room.capacity - room.memberCount, 0)

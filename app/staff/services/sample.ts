import { GATES_BY_PACKAGE } from "../packages-promos/sample"
import { idr, type Money, subtract } from "@/src/lib/money"

export type ServiceId =
  | "a2"
  | "b1"
  | "b2"
  | "passport"
  | "language-exam"
  | "workshop"
  | "dossier"
  | "company-search"
  | "visa"

export const SERVICE_COLUMNS: readonly { readonly id: ServiceId; readonly label: string }[] = [
  { id: "a2", label: "A2" },
  { id: "b1", label: "B1" },
  { id: "b2", label: "B2" },
  { id: "passport", label: "Paspor" },
  { id: "language-exam", label: "Ujian Bahasa" },
  { id: "workshop", label: "Workshop" },
  { id: "dossier", label: "Pemberkasan" },
  { id: "company-search", label: "Pencarian Perusahaan" },
  { id: "visa", label: "Pengajuan Visa" },
]

export type ServiceState = "Belum Terbuka" | "Terbuka" | "Dikerjakan" | "Selesai"

export const SERVICE_STATES: readonly ServiceState[] = [
  "Belum Terbuka",
  "Terbuka",
  "Dikerjakan",
  "Selesai",
]

export const STATE_BADGE: Readonly<Record<ServiceState, string>> = {
  "Belum Terbuka": "badge-terkunci",
  Terbuka: "badge-terbuka",
  Dikerjakan: "badge-berjalan",
  Selesai: "badge-beres",
}

export const STATE_HINT: Readonly<Record<ServiceState, string>> = {
  "Belum Terbuka": "Kurang Bayar",
  Terbuka: "Siap Dikerjakan",
  Dikerjakan: "Proses Berjalan",
  Selesai: "Hasil Terunggah",
}

export type BoardStudent = {
  readonly nis: string
  readonly name: string
  readonly branch: string
  readonly packageName: string
  readonly price: Money
  readonly paid: Money
  readonly onLeave: boolean
  readonly cells: Readonly<Record<ServiceId, ServiceState | null>>
}

export const BOARD: readonly BoardStudent[] = [
  {
    nis: "20250233",
    name: "Andi Nugroho",
    branch: "Bandung",
    packageName: "Ausbildung 45",
    price: idr(45_000_000),
    paid: idr(28_500_000),
    onLeave: false,
    cells: {
      a2: "Selesai",
      b1: "Selesai",
      b2: "Dikerjakan",
      passport: "Selesai",
      "language-exam": "Terbuka",
      workshop: "Selesai",
      dossier: "Dikerjakan",
      "company-search": "Terbuka",
      visa: "Terbuka",
    },
  },
  {
    nis: "20250241",
    name: "Rina Agustina",
    branch: "Bandung",
    packageName: "Ausbildung 45",
    price: idr(45_000_000),
    paid: idr(22_000_000),
    onLeave: false,
    cells: {
      a2: "Selesai",
      b1: "Dikerjakan",
      b2: "Terbuka",
      passport: "Dikerjakan",
      "language-exam": "Belum Terbuka",
      workshop: "Belum Terbuka",
      dossier: "Terbuka",
      "company-search": "Belum Terbuka",
      visa: "Belum Terbuka",
    },
  },
  {
    nis: "20250190",
    name: "Siti Rohmah",
    branch: "Surabaya",
    packageName: "Ausbildung 37",
    price: idr(37_100_000),
    paid: idr(33_000_000),
    onLeave: true,
    cells: {
      a2: "Selesai",
      b1: "Selesai",
      b2: "Selesai",
      passport: "Selesai",
      "language-exam": "Selesai",
      workshop: "Selesai",
      dossier: "Selesai",
      "company-search": "Selesai",
      visa: "Dikerjakan",
    },
  },
  {
    nis: "20250258",
    name: "Bayu Saputra",
    branch: "Jakarta",
    packageName: "Ausbildung 39.2",
    price: idr(38_500_000),
    paid: idr(11_000_000),
    onLeave: false,
    cells: {
      a2: "Selesai",
      b1: "Terbuka",
      b2: "Belum Terbuka",
      passport: "Belum Terbuka",
      "language-exam": "Belum Terbuka",
      workshop: "Belum Terbuka",
      dossier: "Terbuka",
      "company-search": "Belum Terbuka",
      visa: "Belum Terbuka",
    },
  },
  {
    nis: "20240187",
    name: "Rizky Ramadhan",
    branch: "Bandung",
    packageName: "Kursus Bahasa Saja",
    price: idr(12_000_000),
    paid: idr(8_000_000),
    onLeave: false,
    cells: {
      a2: "Selesai",
      b1: "Dikerjakan",
      b2: "Belum Terbuka",
      passport: null,
      "language-exam": "Terbuka",
      workshop: null,
      dossier: null,
      "company-search": null,
      visa: null,
    },
  },
]

export const BRANCHES: readonly string[] = [...new Set(BOARD.map((student) => student.branch))]

export const PACKAGE_NAMES: readonly string[] = [
  ...new Set(BOARD.map((student) => student.packageName)),
]

export const outstanding = (student: BoardStudent): Money => subtract(student.price, student.paid)

export type DossierStep = {
  readonly label: string
  readonly state: Extract<ServiceState, "Belum Terbuka" | "Dikerjakan" | "Selesai">
}

export type ServiceWork = {
  readonly progress: string | null
  readonly pic: string | null
  readonly startedAt: string | null
  readonly finishedAt: string | null
  readonly note: string | null
  readonly result: { readonly label: string; readonly href: string } | null
  readonly steps: readonly DossierStep[] | null
}

const EMPTY_WORK: ServiceWork = {
  progress: null,
  pic: null,
  startedAt: null,
  finishedAt: null,
  note: null,
  result: null,
  steps: null,
}

const work = (partial: Partial<ServiceWork>): ServiceWork => ({ ...EMPTY_WORK, ...partial })

const WORK_BY_STUDENT: Readonly<Record<string, Partial<Record<ServiceId, ServiceWork>>>> = {
  "20250233": {
    a2: work({
      progress: "Selesai",
      pic: "Siti R.",
      startedAt: "2025-11-05",
      finishedAt: "2026-03-10",
    }),
    b1: work({
      progress: "Selesai",
      pic: "Siti R.",
      startedAt: "2026-03-12",
      finishedAt: "2026-05-31",
    }),
    b2: work({
      progress: "Sedang berjalan",
      pic: "Siti R.",
      startedAt: "2026-07-31",
      note: "Target selesai Januari 2027",
    }),
    passport: work({
      progress: "Selesai",
      pic: "Dewi A.",
      startedAt: "2026-02-05",
      finishedAt: "2026-02-20",
      result: { label: "Paspor.pdf", href: "#" },
    }),
    "language-exam": work({
      progress: "Menunggu jadwal Goethe",
      pic: "Siti R.",
      note: "Rencana Goethe Desember 2026",
    }),
    workshop: work({
      progress: "Selesai",
      pic: "Rina K.",
      startedAt: "2026-06-05",
      finishedAt: "2026-06-05",
    }),
    dossier: work({
      progress: "Terjemah Akta selesai",
      pic: "Dewi A.",
      startedAt: "2026-09-01",
      note: "Apostille dalam proses",
      result: { label: "Tr_Akta.pdf", href: "#" },
      steps: [
        { label: "Penerjemahan", state: "Selesai" },
        { label: "Legalisasi Kemenkumham", state: "Dikerjakan" },
        { label: "Legalisasi Kemenlu", state: "Belum Terbuka" },
        { label: "Penyusunan Bewerbung", state: "Belum Terbuka" },
      ],
    }),
  },
  "20250190": {
    visa: work({
      progress: "Berkas visa dikirim ke Kedutaan",
      pic: "Dewi A.",
      startedAt: "2026-08-18",
      note: "Pengerjaan berhenti selama siswa berstatus Cuti",
    }),
  },
}

export type DetailRow = {
  readonly id: ServiceId
  readonly label: string
  readonly state: ServiceState
} & ServiceWork

export const detailRows = (student: BoardStudent): readonly DetailRow[] =>
  SERVICE_COLUMNS.flatMap(({ id, label }) => {
    const state = student.cells[id]
    if (state === null) return []
    return [{ id, label, state, ...(WORK_BY_STUDENT[student.nis]?.[id] ?? EMPTY_WORK) }]
  })

export const PICS = ["Siti R.", "Dewi A.", "Rina K."] as const

export const findStudent = (nis: string | undefined): BoardStudent =>
  BOARD.find((student) => student.nis === nis) ?? BOARD[0]

const PACKAGE_SLUG: Readonly<Record<string, string>> = {
  "Ausbildung 45": "ausbildung-45",
  "Ausbildung 36": "ausbildung-36",
  "Ausbildung 37": "ausbildung-37",
  "Ausbildung 39.2": "ausbildung-39-2",
  "Kursus Bahasa Saja": "kursus-bahasa",
}

const GATE_INDEX: Readonly<Partial<Record<ServiceId, number>>> = {
  a2: 1,
  b1: 2,
  b2: 3,
  passport: 4,
  "language-exam": 5,
  workshop: 6,
  "company-search": 7,
  visa: 8,
}

export const gateThreshold = (student: BoardStudent, id: ServiceId): Money | null => {
  const index = GATE_INDEX[id]
  const gates = GATES_BY_PACKAGE[PACKAGE_SLUG[student.packageName] ?? ""]
  if (index === undefined || !gates) return null
  const amount = gates[index]
  return amount === null || amount === undefined ? null : idr(amount)
}

export const gateShortfall = (student: BoardStudent, id: ServiceId): Money | null => {
  const threshold = gateThreshold(student, id)
  if (!threshold || threshold.amount <= student.paid.amount) return null
  return subtract(threshold, student.paid)
}

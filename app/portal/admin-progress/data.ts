import { idr, type Money } from "@/src/lib/money"

export type NodeState = "selesai" | "dikerjakan" | "menunggu"

export type JourneyNode = {
  readonly label: string
  readonly state: NodeState
}

export const JOURNEY: readonly JourneyNode[] = [
  { label: "Paspor", state: "selesai" },
  { label: "Ujian Bahasa", state: "selesai" },
  { label: "Workshop", state: "selesai" },
  { label: "Apostille & Terjemah (Pemberkasan)", state: "dikerjakan" },
  { label: "Pencarian Perusahaan", state: "menunggu" },
  { label: "Proses Visa", state: "menunggu" },
  { label: "Berangkat", state: "menunggu" },
]

export type ServiceStatus = "Selesai" | "Dikerjakan" | "Terbuka" | "Belum"

export type ServiceRow = {
  readonly service: string
  readonly status: ServiceStatus
  readonly progress: string | null
  readonly pic: string | null
  readonly doneAt: string | null
  readonly note: string | null
  readonly result: { readonly label: string; readonly href: string } | null
}

export const SERVICES: readonly ServiceRow[] = [
  {
    service: "Paspor",
    status: "Selesai",
    progress: "Selesai",
    pic: "Dewi A.",
    doneAt: "2026-02-20",
    note: null,
    result: { label: "Paspor.pdf", href: "#" },
  },
  {
    service: "Ujian Bahasa",
    status: "Terbuka",
    progress: "Menunggu jadwal Goethe",
    pic: "Siti R.",
    doneAt: null,
    note: null,
    result: null,
  },
  {
    service: "Workshop",
    status: "Selesai",
    progress: "Selesai",
    pic: "Rina K.",
    doneAt: "2026-06-05",
    note: null,
    result: null,
  },
  {
    service: "Apostille & Terjemah (Pemberkasan)",
    status: "Dikerjakan",
    progress: "Terjemah Akta selesai",
    pic: "Dewi A.",
    doneAt: null,
    note: null,
    result: { label: "Tr_Akta.pdf", href: "#" },
  },
  {
    service: "Pencarian Perusahaan",
    status: "Belum",
    progress: null,
    pic: null,
    doneAt: null,
    note: null,
    result: null,
  },
  {
    service: "Proses Visa (Pengajuan, Wawancara, Hasil)",
    status: "Belum",
    progress: null,
    pic: null,
    doneAt: null,
    note: null,
    result: null,
  },
]

export const PAID_IDR: Money = idr(28_500_000)

export const NEXT_GATE = {
  service: "Pencarian Perusahaan",
  threshold: idr(34_000_000),
} as const

export const VISA_GATE = {
  threshold: idr(40_000_000),
  contractIssued: false,
} as const

export type PartnerSubmission = {
  readonly partner: string
  readonly position: string
  readonly status: "Diproses" | "Selesai" | "Ditolak"
  readonly submittedAt: string
  readonly latest: string
}

export const PARTNERS: readonly PartnerSubmission[] = [
  {
    partner: "Partner A",
    position: "Koki",
    status: "Diproses",
    submittedAt: "2026-02-01",
    latest: "Berkas sedang ditinjau",
  },
  {
    partner: "Partner B",
    position: "Perhotelan",
    status: "Diproses",
    submittedAt: "2026-02-16",
    latest: "Menunggu hasil interview",
  },
]

export type InterviewPractice = {
  readonly at: string
  readonly title: string
  readonly status: "Selesai" | "Dijadwalkan"
}

export const INTERVIEWS: readonly InterviewPractice[] = [
  { at: "2026-03-12T03:00:00Z", title: "Latihan 1 — perkenalan diri", status: "Selesai" },
  { at: "2026-03-26T03:00:00Z", title: "Latihan 2 — pertanyaan teknis", status: "Dijadwalkan" },
]

export const PLACEMENT_STARTED = PARTNERS.length > 0

export const DEPARTURE_CHECKLIST: readonly string[] = [
  "Paspor masih berlaku",
  "Visa terbit",
  "Kontrak kerja ditandatangani",
  "Krankenversicherung",
  "Rahmenplan",
  "Tiket pesawat",
  "Schulvertrag",
  "Mietvertrag / Wohnungsbestätigung",
  "Akta Kelahiran (terjemah + apostille)",
  "Ijazah terakhir (terjemah + apostille)",
  "Transkrip nilai",
  "Kartu Keluarga",
  "Paket Roaming Data",
  "Uang Tunai Euro",
  "Obat Pribadi",
]

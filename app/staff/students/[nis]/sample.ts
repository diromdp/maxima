import { idr, type Money } from "@/src/lib/money"

export const PHASE = "Fase 2 Belajar"
export const ENROLLED_AT = "2025-02-01"

export const PACKAGE_PRICE = idr(45_000_000)
export const MONTHLY_TARGET = idr(3_333_000)

export type PaymentStatus = "Lunas" | "Menunggu"

export type Transaction = {
  readonly id: string
  readonly date: string
  readonly description: string
  readonly method: string
  readonly amount: Money
  readonly status: PaymentStatus
}

export const TRANSACTIONS: readonly Transaction[] = [
  {
    id: "trx-7",
    date: "2025-02-12",
    description: "Pembayaran Paket",
    method: "VA Mandiri",
    amount: idr(5_000_000),
    status: "Lunas",
  },
  {
    id: "trx-6",
    date: "2025-01-10",
    description: "Pembayaran Paket",
    method: "VA Mandiri",
    amount: idr(5_000_000),
    status: "Lunas",
  },
  {
    id: "trx-5",
    date: "2024-12-08",
    description: "Pembayaran Paket",
    method: "Transfer Bank",
    amount: idr(4_500_000),
    status: "Lunas",
  },
  {
    id: "trx-4",
    date: "2024-11-12",
    description: "Pembayaran Paket",
    method: "VA Mandiri",
    amount: idr(4_500_000),
    status: "Lunas",
  },
  {
    id: "trx-3",
    date: "2024-10-14",
    description: "Pembayaran Paket",
    method: "QRIS",
    amount: idr(3_500_000),
    status: "Lunas",
  },
  {
    id: "trx-2",
    date: "2024-09-15",
    description: "Pembayaran DP",
    method: "Transfer Bank",
    amount: idr(5_000_000),
    status: "Lunas",
  },
  {
    id: "trx-1",
    date: "2024-09-01",
    description: "Biaya Pendaftaran",
    method: "QRIS",
    amount: idr(1_000_000),
    status: "Lunas",
  },
]

export type Gate = { readonly name: string; readonly threshold: Money }

export const GATES: readonly Gate[] = [
  { name: "DP", threshold: idr(5_000_000) },
  { name: "A2", threshold: idr(7_000_000) },
  { name: "B1", threshold: idr(12_000_000) },
  { name: "B2", threshold: idr(17_000_000) },
  { name: "Paspor", threshold: idr(22_000_000) },
  { name: "Ujian Bahasa", threshold: idr(26_000_000) },
  { name: "Workshop", threshold: idr(28_000_000) },
  { name: "Pencarian Perusahaan", threshold: idr(34_000_000) },
  { name: "Pengajuan Visa", threshold: idr(40_000_000) },
]

export const CLASSROOM = {
  name: "Kelas Berlin",
  level: "A2",
  teacher: "Mulyadi, S.Pd",
  schedule: "Sen, Rab 09.00 sampai 12.00",
  chapter: 7,
  chaptersTotal: 12,
} as const

export type LevelStatus = "Lulus" | "Belajar" | "Belum mulai"

export type Level = {
  readonly level: string
  readonly status: LevelStatus
  readonly score: number | null
}

export const LEVELS: readonly Level[] = [
  { level: "A1", status: "Lulus", score: 82 },
  { level: "A2", status: "Belajar", score: null },
  { level: "B1", status: "Belum mulai", score: null },
  { level: "B2", status: "Belum mulai", score: null },
]

export const KKM = 80

export const CHAPTER_SCORES: readonly (number | null)[] = [
  85,
  90,
  78,
  82,
  88,
  84,
  80,
  null,
  null,
  null,
  null,
  null,
]

export const ATTENDANCE: { readonly present: number; readonly expected: number } = {
  present: 20,
  expected: 22,
}

export type ReportCard = { readonly level: string; readonly issued: boolean }

export const REPORT_CARDS: readonly ReportCard[] = [
  { level: "A1", issued: true },
  { level: "A2", issued: false },
]

export type DocumentStatus = "Terverifikasi" | "Belum Diunggah"

export type DocumentRow = {
  readonly name: string
  readonly file: string | null
  readonly status: DocumentStatus
}

export type DocumentGroup = {
  readonly id: string
  readonly title: string
  readonly rows: readonly DocumentRow[]
}

export const DOCUMENT_GROUPS: readonly DocumentGroup[] = [
  {
    id: "personal",
    title: "Dokumen Pribadi",
    rows: [
      { name: "Akta Kelahiran", file: "akta_andi_nugroho.pdf", status: "Terverifikasi" },
      { name: "Kartu Keluarga", file: "kk_nugroho.pdf", status: "Terverifikasi" },
      { name: "KTP", file: "ktp_nugroho.pdf", status: "Terverifikasi" },
      { name: "Ijazah Terakhir", file: "ijazah_andi.pdf", status: "Terverifikasi" },
      { name: "Transkrip Nilai", file: "transkrip_andi.pdf", status: "Terverifikasi" },
      { name: "Pas Foto 3x4", file: "pasfoto_andi.jpg", status: "Terverifikasi" },
      { name: "Surat Kontrak", file: "kontrak_andi.pdf", status: "Terverifikasi" },
    ],
  },
  {
    id: "service-results",
    title: "Hasil Layanan",
    rows: [
      { name: "Paspor", file: "paspor_nugroho.pdf", status: "Terverifikasi" },
      { name: "Terjemahan Akta Lahir", file: "terjemahan_akta.pdf", status: "Terverifikasi" },
      {
        name: "Terjemahan Ijazah & Transkrip",
        file: "terjemahan_ijazah.pdf",
        status: "Terverifikasi",
      },
      { name: "Apostille Akta Lahir", file: null, status: "Belum Diunggah" },
      { name: "Apostille Ijazah & Transkrip", file: null, status: "Belum Diunggah" },
    ],
  },
  {
    id: "bewerbung",
    title: "Bewerbung (Lamaran)",
    rows: [
      { name: "Sertifikat Bahasa B1", file: null, status: "Belum Diunggah" },
      { name: "Lebenslauf (CV)", file: null, status: "Belum Diunggah" },
      { name: "Motivationsschreiben", file: null, status: "Belum Diunggah" },
      { name: "Video Perkenalan (VLOG)", file: null, status: "Belum Diunggah" },
    ],
  },
]

export type PartnerApplication = {
  readonly partner: string
  readonly position: string
  readonly status: "Sedang Diproses" | "Diterima" | "Ditolak"
  readonly date: string
}

export const PARTNER_APPLICATIONS: readonly PartnerApplication[] = [
  {
    partner: "Sana Kliniken Berlin",
    position: "Ausbildung Pflegefachmann",
    status: "Sedang Diproses",
    date: "2025-02-10",
  },
]

export type Interview = {
  readonly date: string
  readonly position: string
  readonly trainer: string
  readonly status: "Lulus" | "Tidak Lulus"
  readonly pic: string
}

export const INTERVIEWS: readonly Interview[] = [
  {
    date: "2025-02-08",
    position: "Pflegefachmann",
    trainer: "Andriani",
    status: "Lulus",
    pic: "Ratna Sari",
  },
  {
    date: "2025-01-22",
    position: "Pflegefachmann",
    trainer: "Andriani",
    status: "Lulus",
    pic: "Ratna Sari",
  },
]

export const PARTNER_NOTE =
  "Kandidat responsif dalam simulasi interview. Perlu peningkatan kelancaran pelafalan istilah medis Jerman sebelum dikirim langsung ke partner Sana Kliniken."

export const ADMISSION_NOTE =
  "Apostille akta lahir masih diproses oleh tim Kemenkumham, diupayakan selesai akhir minggu ini agar bisa langsung dilanjutkan ke Kemenlu."

export type ServiceStatus = "Selesai" | "Dikerjakan" | "Terbuka" | "Belum Terbuka"

export type Service = {
  readonly name: string
  readonly status: ServiceStatus
  readonly steps?: readonly { readonly name: string; readonly status: ServiceStatus }[]
}

export const SERVICES: readonly Service[] = [
  { name: "A2", status: "Dikerjakan" },
  { name: "B1", status: "Terbuka" },
  { name: "B2", status: "Terbuka" },
  { name: "Paspor", status: "Selesai" },
  { name: "Ujian Bahasa", status: "Terbuka" },
  { name: "Workshop", status: "Terbuka" },
  {
    name: "Pemberkasan",
    status: "Dikerjakan",
    steps: [
      { name: "Penerjemahan", status: "Selesai" },
      { name: "Legalisasi Kemenkumham", status: "Selesai" },
      { name: "Legalisasi Kemenlu", status: "Dikerjakan" },
      { name: "Penyusunan Bewerbung", status: "Belum Terbuka" },
    ],
  },
  { name: "Pencarian Perusahaan", status: "Belum Terbuka" },
  { name: "Pengajuan Visa", status: "Belum Terbuka" },
]

export type ActivityEntry = {
  readonly id: string
  readonly at: string
  readonly text: string
  readonly actor: string
}

export const ACTIVITY_LOG: readonly ActivityEntry[] = [
  {
    id: "log-10",
    at: "2025-02-17T14:32:00+07:00",
    text: "Sertifikat A1 terverifikasi oleh Admin Pusat.",
    actor: "Anisah",
  },
  {
    id: "log-9",
    at: "2025-02-12T11:08:00+07:00",
    text: "Pembayaran Paket sebesar Rp 5.000.000 dikonfirmasi lunas.",
    actor: "System Finance",
  },
  {
    id: "log-8",
    at: "2025-02-10T09:15:00+07:00",
    text: "Pengajuan berkas dokumen ke Sana Kliniken Berlin berhasil dikirim.",
    actor: "Ratna Sari",
  },
  {
    id: "log-7",
    at: "2025-02-08T16:00:00+07:00",
    text: "Kelulusan simulasi latihan wawancara medis internal dicatat.",
    actor: "Anisah",
  },
  {
    id: "log-6",
    at: "2025-02-05T18:30:00+07:00",
    text: "Dokumen Paspor berhasil diunggah dan disimpan ke database.",
    actor: "Siswa (Andi Nugroho)",
  },
  {
    id: "log-5",
    at: "2025-01-10T13:40:00+07:00",
    text: "Pembayaran Paket sebesar Rp 5.000.000 dikonfirmasi lunas.",
    actor: "System Finance",
  },
  {
    id: "log-4",
    at: "2024-12-05T11:12:00+07:00",
    text: "Siswa berhasil didaftarkan ke Kelas Berlin (Level A2).",
    actor: "Mulyadi, S.Pd",
  },
  {
    id: "log-3",
    at: "2024-11-12T14:03:00+07:00",
    text: "Pembayaran Paket sebesar Rp 4.500.000 berhasil diterima.",
    actor: "System Finance",
  },
  {
    id: "log-2",
    at: "2024-09-15T10:08:00+07:00",
    text: "Pembayaran DP awal sebesar Rp 5.000.000 tervalidasi.",
    actor: "System Finance",
  },
  {
    id: "log-1",
    at: "2024-09-01T09:30:00+07:00",
    text: "Akun siswa Andi Nugroho berhasil dibuat di platform Eduflow.",
    actor: "Sistem Cabang",
  },
]

export type StatusChange = {
  readonly id: string
  readonly date: string
  readonly from: string
  readonly to: string
  readonly reason: string
  readonly actor: string
}

export const STATUS_HISTORY: readonly StatusChange[] = [
  {
    id: "st-2",
    date: "2025-01-15",
    from: "Prospek",
    to: "Fase 2 Belajar",
    reason: "Siswa telah melunasi pembayaran minimum DP & Uang Muka KBM.",
    actor: "Ratna Sari",
  },
  {
    id: "st-1",
    date: "2024-09-01",
    from: "Pendaftaran",
    to: "Prospek",
    reason: "Pendaftaran awal berhasil diproses oleh admin cabang.",
    actor: "Sistem",
  },
]

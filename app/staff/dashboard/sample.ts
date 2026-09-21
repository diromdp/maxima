// Angka dari wireframe 01 Beranda (Design/pov-admin-1.png) dan PRD Admin 1.
// Hanya bentuk Admission / Admin Pusat yang punya rancangan; peran lain
// memakai kerangka yang sama dengan baris antrian yang ia berhak lihat.

import type { PageId } from "@/src/lib/auth/permissions"

export type QueueTone = "tindakan" | "berjalan"

export type QueueRow = {
  readonly page: PageId
  readonly label: string
  readonly count: number
  readonly linkLabel: string
  readonly tone: QueueTone
}

export const QUEUE: readonly QueueRow[] = [
  {
    page: "documents",
    label: "Dokumen menunggu verifikasi",
    count: 12,
    linkLabel: "Lihat Dokumen",
    tone: "tindakan",
  },
  {
    page: "services",
    label: "Layanan belum dikerjakan",
    count: 8,
    linkLabel: "Lihat Layanan",
    tone: "berjalan",
  },
  {
    page: "leave",
    label: "Pengajuan cuti menunggu persetujuan",
    count: 2,
    linkLabel: "Lihat Pengajuan Cuti",
    tone: "tindakan",
  },
  {
    page: "partners",
    label: "Pengajuan partner tanpa kabar lebih dari 14 hari",
    count: 5,
    linkLabel: "Lihat Partner",
    tone: "berjalan",
  },
]

export type PipelineStage = {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly hint: string
}

// Enam tahap PRD 1.2; definisi tiap tahap dari tabel "Funnel enam tahap".
export const PIPELINE: readonly PipelineStage[] = [
  { id: "prospek", label: "Prospek", count: 48, hint: "Terdaftar, DP belum masuk" },
  { id: "belajar", label: "Belajar", count: 412, hint: "DP masuk, belum ambang Cari Mitra" },
  { id: "pemberkasan", label: "Pemberkasan", count: 56, hint: "Layanan terbuka, belum diajukan" },
  { id: "cari-mitra", label: "Cari Mitra", count: 82, hint: "Minimal satu pengajuan berjalan" },
  { id: "visa", label: "Visa", count: 38, hint: "Dapat Vertrag, visa berjalan" },
  { id: "alumni", label: "Alumni", count: 89, hint: "Tanggal keberangkatan terisi" },
]

export type StatusTone = "beres" | "berjalan" | "tindakan" | "terkunci"

export type StatusCount = {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly tone: StatusTone
  readonly badge: string
}

export const STATUSES: readonly StatusCount[] = [
  { id: "aktif", label: "Siswa Aktif", count: 642, tone: "beres", badge: "Aktif" },
  { id: "cuti", label: "Siswa Cuti", count: 45, tone: "berjalan", badge: "Cuti" },
  { id: "mundur", label: "Mengundurkan Diri", count: 12, tone: "tindakan", badge: "Mundur" },
  { id: "selesai", label: "Selesai Kursus", count: 34, tone: "terkunci", badge: "Selesai" },
]

// Neraca keuangan dua belas bulan terakhir (Sep 2025 sampai Agu 2026), dua jalur:
// Rupiah dalam juta, Euro dalam ribu (PRD Admin 13-15 mencatat kedua mata uang).
// "Pemasukan" = pembayaran masuk bulan itu, "Piutang belum dibayar" = cicilan yang
// sudah jatuh tempo tapi belum dibayar pada akhir bulan itu. Nama kunci = label
// legenda grafik. Enam bulan terakhir Rupiah sama dengan contoh `TREN` di /kit;
// sisanya angka contoh - lampiran PRD 15 tidak memuat deret bulanan.
export type FinanceMonth = {
  readonly bulan: string
  readonly Pemasukan: number
  readonly "Piutang belum dibayar": number
}

export const FINANCE_PERIOD = "September 2025 sampai Agustus 2026"

// Sumbu grafik memakai singkatan; kartu angka menulis nama bulan penuh.
export const BULAN_PANJANG: Readonly<Record<string, string>> = {
  Jan: "Januari",
  Feb: "Februari",
  Mar: "Maret",
  Apr: "April",
  Mei: "Mei",
  Jun: "Juni",
  Jul: "Juli",
  Agu: "Agustus",
  Sep: "September",
  Okt: "Oktober",
  Nov: "November",
  Des: "Desember",
}

export type Currency = "IDR" | "EUR"

export const CURRENCY_LABEL: Readonly<Record<Currency, string>> = { IDR: "Rupiah", EUR: "Euro" }
export const CURRENCY_UNIT: Readonly<Record<Currency, string>> = {
  IDR: "juta rupiah",
  EUR: "ribu euro",
}

export const FINANCE_IDR: readonly FinanceMonth[] = [
  { bulan: "Sep", Pemasukan: 148, "Piutang belum dibayar": 62 },
  { bulan: "Okt", Pemasukan: 156, "Piutang belum dibayar": 58 },
  { bulan: "Nov", Pemasukan: 171, "Piutang belum dibayar": 66 },
  { bulan: "Des", Pemasukan: 139, "Piutang belum dibayar": 72 },
  { bulan: "Jan", Pemasukan: 164, "Piutang belum dibayar": 57 },
  { bulan: "Feb", Pemasukan: 175, "Piutang belum dibayar": 51 },
  { bulan: "Mar", Pemasukan: 182, "Piutang belum dibayar": 54 },
  { bulan: "Apr", Pemasukan: 201, "Piutang belum dibayar": 49 },
  { bulan: "Mei", Pemasukan: 214, "Piutang belum dibayar": 61 },
  { bulan: "Jun", Pemasukan: 243, "Piutang belum dibayar": 38 },
  { bulan: "Jul", Pemasukan: 258, "Piutang belum dibayar": 44 },
  { bulan: "Agu", Pemasukan: 277, "Piutang belum dibayar": 31 },
]

export const FINANCE_EUR: readonly FinanceMonth[] = [
  { bulan: "Sep", Pemasukan: 9, "Piutang belum dibayar": 4 },
  { bulan: "Okt", Pemasukan: 10, "Piutang belum dibayar": 4 },
  { bulan: "Nov", Pemasukan: 11, "Piutang belum dibayar": 5 },
  { bulan: "Des", Pemasukan: 8, "Piutang belum dibayar": 6 },
  { bulan: "Jan", Pemasukan: 10, "Piutang belum dibayar": 4 },
  { bulan: "Feb", Pemasukan: 12, "Piutang belum dibayar": 3 },
  { bulan: "Mar", Pemasukan: 12, "Piutang belum dibayar": 4 },
  { bulan: "Apr", Pemasukan: 14, "Piutang belum dibayar": 3 },
  { bulan: "Mei", Pemasukan: 15, "Piutang belum dibayar": 5 },
  { bulan: "Jun", Pemasukan: 17, "Piutang belum dibayar": 3 },
  { bulan: "Jul", Pemasukan: 18, "Piutang belum dibayar": 3 },
  { bulan: "Agu", Pemasukan: 19, "Piutang belum dibayar": 2 },
]

export const FINANCE: Readonly<Record<Currency, readonly FinanceMonth[]>> = {
  IDR: FINANCE_IDR,
  EUR: FINANCE_EUR,
}

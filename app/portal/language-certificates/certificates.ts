import dayjs from "dayjs"

export type Modul = "lesen" | "horen" | "schreiben" | "sprechen"

export type Verifikasi = "Terverifikasi" | "Menunggu" | "Tidak lulus"

export type StatusSertifikat = Verifikasi | "Expired"

export type NilaiModul = {
  readonly nilai: number | null
  readonly expired: string
}

export type Sertifikat = {
  readonly id: string
  readonly jenis: "Goethe" | "ÖSD" | "ECL"
  readonly level: string
  readonly modul: Readonly<Record<Modul, NilaiModul>>
  readonly verifikasi: Verifikasi
  readonly berkas: string
}

export const MODUL: readonly { readonly key: Modul; readonly label: string }[] = [
  { key: "lesen", label: "Lesen" },
  { key: "horen", label: "Hören" },
  { key: "schreiben", label: "Schreiben" },
  { key: "sprechen", label: "Sprechen" },
]

export const JENIS_SERTIFIKAT = ["Goethe", "ÖSD", "ECL"] as const
export const LEVEL = ["A1", "A2", "B1", "B2", "C1"] as const

const AMBANG_SEGERA_HARI = 90

export function deriveStatus(s: Sertifikat, today: Date = new Date()): StatusSertifikat {
  const lewat = Object.values(s.modul).some((m) => dayjs(m.expired).isBefore(dayjs(today), "day"))
  if (lewat) return "Expired"
  return s.verifikasi
}

export function hariTersisa(s: Sertifikat, today: Date = new Date()): number {
  const terdekat = Object.values(s.modul)
    .map((m) => dayjs(m.expired).startOf("day").diff(dayjs(today).startOf("day"), "day"))
    .sort((a, b) => a - b)[0]
  return terdekat ?? 0
}

export function segeraKedaluwarsa(s: Sertifikat, today: Date = new Date()): boolean {
  const sisa = hariTersisa(s, today)
  return sisa >= 0 && sisa <= AMBANG_SEGERA_HARI
}

export function dapatDiubah(s: Sertifikat, today: Date = new Date()): boolean {
  const status = deriveStatus(s, today)
  return status === "Menunggu" || status === "Tidak lulus"
}

export function alasanTerkunci(status: StatusSertifikat): string {
  return status === "Expired"
    ? "Sertifikat kedaluwarsa — ajukan perubahan lewat PIC"
    : "Sudah diverifikasi Admin — ajukan perubahan lewat PIC"
}

export function formatBulanTahun(iso: string): string {
  return dayjs(iso).format("MMM YYYY")
}

export const SERTIFIKAT: readonly Sertifikat[] = [
  {
    id: "goethe-b2",
    jenis: "Goethe",
    level: "B2",
    modul: {
      lesen: { nilai: 85, expired: "2028-12-31" },
      horen: { nilai: 82, expired: "2028-12-31" },
      schreiben: { nilai: 81, expired: "2028-12-31" },
      sprechen: { nilai: 80, expired: "2028-12-31" },
    },
    verifikasi: "Terverifikasi",
    berkas: "Goethe_B2.pdf",
  },
  {
    id: "goethe-b1",
    jenis: "Goethe",
    level: "B1",
    modul: {
      lesen: { nilai: 90, expired: "2027-06-30" },
      horen: { nilai: 88, expired: "2027-06-30" },
      schreiben: { nilai: 85, expired: "2027-06-30" },
      sprechen: { nilai: 92, expired: "2027-06-30" },
    },
    verifikasi: "Terverifikasi",
    berkas: "Goethe_B1.pdf",
  },
  {
    id: "osd-a2",
    jenis: "ÖSD",
    level: "A2",
    modul: {
      lesen: { nilai: 78, expired: "2025-03-31" },
      horen: { nilai: 75, expired: "2025-03-31" },
      schreiben: { nilai: null, expired: "2025-03-31" },
      sprechen: { nilai: 62, expired: "2025-03-31" },
    },
    verifikasi: "Tidak lulus",
    berkas: "OSD_A2.pdf",
  },
  {
    id: "goethe-a1",
    jenis: "Goethe",
    level: "A1",
    modul: {
      lesen: { nilai: 95, expired: "2024-09-30" },
      horen: { nilai: 90, expired: "2024-09-30" },
      schreiben: { nilai: 88, expired: "2024-09-30" },
      sprechen: { nilai: 94, expired: "2024-09-30" },
    },
    verifikasi: "Terverifikasi",
    berkas: "Goethe_A1.pdf",
  },
  // Satu baris Menunggu supaya jalur Edit dan Hapus punya contoh hidup.
  {
    id: "ecl-b2",
    jenis: "ECL",
    level: "B2",
    modul: {
      lesen: { nilai: 88, expired: "2029-03-31" },
      horen: { nilai: 84, expired: "2029-03-31" },
      schreiben: { nilai: 79, expired: "2029-03-31" },
      sprechen: { nilai: 86, expired: "2029-03-31" },
    },
    verifikasi: "Menunggu",
    berkas: "ECL_B2.pdf",
  },
]

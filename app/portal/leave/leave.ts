import dayjs from "dayjs"

import { type LeaveDetail, type LeaveState, type OwnLeaveRow } from "@/src/entities/leave/schema"
import type { PortalStatus } from "@/src/lib/auth/session"
import { formatDateLong } from "@/src/lib/format"

export const TERMS = [
  "Cuti hanya dapat diambil satu kali selama masa belajar.",
  "Durasi cuti maksimal 6 bulan.",
  "Pengajuan diajukan minimal 1 bulan sebelum tanggal mulai cuti.",
  "Wajib menyelesaikan biaya yang ditetapkan Finance sebelum cuti berjalan.",
  "Saat kembali, siswa ditempatkan di level yang kira-kira sama; bila harus turun level, siswa membayar selisihnya.",
  "Melewati tanggal masuk kembali berarti keluar dari manajemen Maxima dan kembali sebagai siswa baru.",
  "Surat kontrak tetap berlaku selama masa cuti.",
] as const

export const PAGE_SUBTITLE =
  "Cuti hanya dapat diambil sekali dan maksimal 6 bulan. Pengajuan akan diverifikasi Finance sebelum cuti disetujui."

export const TERMS_SUMMARY =
  "Cuti hanya dapat diambil satu kali sepanjang masa belajar dan durasi maksimal 6 bulan."

const HEADINGS: Readonly<Record<LeaveState, { title: string; description: string }>> = {
  draft: { title: "Pengajuan Cuti", description: PAGE_SUBTITLE },
  "awaiting-finance": {
    title: "Menunggu Verifikasi Finance",
    description: "Pengajuan sudah terkirim dan sedang diperiksa Finance.",
  },
  "payment-set": {
    title: "Pembayaran Ditetapkan",
    description: "Finance telah menetapkan kewajiban sebelum proses cuti dapat dilanjutkan.",
  },
  "awaiting-payment-check": {
    title: "Menunggu Verifikasi Pembayaran",
    description: "Bukti pembayaran sudah dikirim dan sedang diverifikasi Finance.",
  },
  processing: {
    title: "Cuti Diproses",
    description: "Pembayaran telah diverifikasi. Pengajuan kini masuk tahap persetujuan cuti.",
  },
  approved: {
    title: "Cuti Disetujui",
    description: "Pengajuan cuti selesai dan jadwal kembali telah ditetapkan.",
  },
  "on-leave": {
    title: "Cuti Dijalani",
    description: "Anda sedang cuti. Posisi kurikulum Anda disimpan sampai tanggal kembali.",
  },
  completed: { title: "Cuti Selesai", description: "Anda sudah kembali ke kelas." },
  rejected: {
    title: "Cuti Ditolak",
    description: "Pengajuan belum dapat dilanjutkan. Lihat alasan dan langkah berikutnya.",
  },
  expired: {
    title: "Pengajuan Gugur",
    description: "Batas pembayaran terlewat tanpa bukti. Anda dapat mengajukan ulang.",
  },
}

const WITHDRAWN_HEADING = {
  title: "Cuti Ditutup",
  description: "Tanggal masuk kembali terlewat, jadi Anda keluar dari manajemen Maxima.",
}

export const isWithdrawn = (leave: { state: LeaveState; returnedOn: string | null }) =>
  leave.state === "completed" && leave.returnedOn === null

export const headingOf = (leave: LeaveDetail) =>
  isWithdrawn(leave) ? WITHDRAWN_HEADING : HEADINGS[leave.state]

const NON_BLOCKING_STATES: readonly LeaveState[] = ["rejected", "expired"]

const todayInJakarta = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })

export const earliestLeaveStart = (): string =>
  dayjs(todayInJakarta()).add(1, "month").format("YYYY-MM-DD")

export function applyBlockOf(rows: readonly OwnLeaveRow[], status: PortalStatus): string | null {
  if (rows.some((row) => !NON_BLOCKING_STATES.includes(row.state))) {
    return "Kontrak Anda sudah punya cuti yang disetujui atau sedang berjalan. Cuti hanya dapat diambil satu kali per kontrak."
  }
  if (status !== "Aktif") {
    return `Cuti hanya dapat diajukan siswa berstatus Aktif, sedangkan status Anda ${status}. Hubungi Admission cabang Anda.`
  }
  const reapplyFrom = rows
    .map((row) => row.reapplyFrom)
    .filter((date): date is string => date !== null)
    .sort()
    .at(-1)
  if (reapplyFrom && reapplyFrom > todayInJakarta()) {
    return `Pengajuan ulang baru dapat dikirim mulai ${formatDateLong(reapplyFrom)}.`
  }
  return null
}

export function paymentOf(row: OwnLeaveRow): { amountIdr: number | null; label: string } {
  switch (row.state) {
    case "rejected":
    case "expired":
    case "draft":
      return { amountIdr: null, label: "Tidak ada kewajiban" }
    case "awaiting-finance":
      return { amountIdr: null, label: "Menunggu ketetapan Finance" }
    case "payment-set":
      return { amountIdr: row.amountIdr, label: "Belum dibayar" }
    case "awaiting-payment-check":
      return { amountIdr: row.amountIdr, label: "Menunggu verifikasi" }
    default:
      return row.amountIdr === null
        ? { amountIdr: null, label: "Tidak ada tagihan tambahan" }
        : { amountIdr: row.amountIdr, label: "Lunas" }
  }
}

export function noteOf(row: OwnLeaveRow): { text: string; isAlert?: boolean } {
  switch (row.state) {
    case "rejected":
      return {
        text: `${row.rejectReason ?? "Ditolak"}${row.reapplyFrom ? ` Dapat diajukan ulang mulai ${formatDateLong(row.reapplyFrom)}.` : ""}`,
        isAlert: true,
      }
    case "expired":
      return {
        text: `Batas bayar ${row.deadline ? formatDateLong(row.deadline) : ""} terlewat. Ajukan ulang bila masih perlu cuti.`,
        isAlert: true,
      }
    case "payment-set":
      return {
        text: `Batas bayar ${row.deadline ? `${formatDateLong(row.deadline)} pukul 23.59 WIB` : "-"}`,
      }
    case "awaiting-finance":
      return { text: "Finance memeriksa riwayat pembayaran" }
    case "awaiting-payment-check":
      return { text: "Bukti pembayaran sedang diverifikasi" }
    case "processing":
      return { text: "Menunggu persetujuan akhir" }
    case "approved":
      return { text: `Cuti mulai ${formatDateLong(row.startsOn)}` }
    case "on-leave":
      return { text: `Rencana kembali ${formatDateLong(row.returnsOn)}` }
    case "completed":
      return row.returnedOn
        ? { text: `Kembali ${formatDateLong(row.returnedOn)}` }
        : { text: "Ditutup karena tanggal masuk kembali terlewat", isAlert: true }
    case "draft":
      return { text: "Belum dikirim" }
  }
}

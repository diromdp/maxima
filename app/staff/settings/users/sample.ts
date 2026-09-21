// Angka dan nama dari wireframe 20a (Design/pov-admin-20.png). Peran memakai
// tujuh peran ROLE_ACCESS di permissions.ts, bukan "Admin" wireframe (temuan 6:
// peran adalah data). Jumlah pengguna per peran dihitung dari USERS.

import { ROLE_ACCESS } from "@/src/lib/auth/permissions"

export type UserStatus = "Aktif" | "Nonaktif"

export type StaffUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: string
  /** null = seluruh cabang. */
  readonly branches: readonly string[] | null
  readonly status: UserStatus
}

export const BRANCHES = ["Bandung", "Jakarta", "Surabaya"] as const

export const USERS: readonly StaffUser[] = [
  {
    id: "u-1",
    name: "Ratna Sari",
    email: "ratna.sari@maxima.id",
    role: "Kepala Marketing",
    branches: ["Bandung"],
    status: "Aktif",
  },
  {
    id: "u-2",
    name: "Mulyadi, S.Pd",
    email: "mulyadi@maxima.id",
    role: "Pengajar",
    branches: null,
    status: "Aktif",
  },
  {
    id: "u-3",
    name: "Hendra Wijaya",
    email: "hendra.w@maxima.id",
    role: "Manajer Finance",
    branches: null,
    status: "Aktif",
  },
  {
    id: "u-4",
    name: "Andi Wijaya",
    email: "andi@maxima.id",
    role: "Marketing",
    branches: ["Surabaya"],
    status: "Aktif",
  },
  {
    id: "u-5",
    name: "Rina Kumala",
    email: "rina.k@maxima.id",
    role: "Staf Finance",
    branches: ["Bandung"],
    status: "Aktif",
  },
  {
    id: "u-6",
    name: "Siti Rahma",
    email: "siti.rahma@maxima.id",
    role: "Admission",
    branches: null,
    status: "Aktif",
  },
  {
    id: "u-7",
    name: "Taufik Hidayat",
    email: "taufik.h@maxima.id",
    role: "Kepala Pengajar",
    branches: ["Jakarta"],
    status: "Nonaktif",
  },
]

export type Role = {
  readonly name: string
  readonly description: string
  readonly status: UserStatus
}

export const ROLES: readonly Role[] = [
  {
    name: "Admission",
    description: "Seluruh halaman, termasuk pengaturan dan hak akses peran lain",
    status: "Aktif",
  },
  { name: "Marketing", description: "Siswa yang menjadi tanggungannya sendiri", status: "Aktif" },
  {
    name: "Kepala Marketing",
    description: "Seluruh siswa di cabangnya, hanya membaca",
    status: "Aktif",
  },
  { name: "Pengajar", description: "Kelas yang diampunya: absensi dan nilai", status: "Aktif" },
  {
    name: "Kepala Pengajar",
    description: "Satu cabang: kelas, raport, sertifikat, monitoring",
    status: "Nonaktif",
  },
  {
    name: "Staf Finance",
    description: "Satu cabang: pembayaran, tagihan, verifikasi cuti",
    status: "Aktif",
  },
  {
    name: "Manajer Finance",
    description: "Seluruh cabang: paket, promo, laporan, pengesahan",
    status: "Aktif",
  },
]

export const ROLE_NAMES: readonly string[] = Object.keys(ROLE_ACCESS)

export const userCount = (role: string, users: readonly StaffUser[]): number =>
  users.filter((u) => u.role === role).length

export const branchLabel = (branches: readonly string[] | null): string =>
  branches === null ? "Semua cabang" : branches.join(", ")

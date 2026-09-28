import { z } from "zod"

import type { Access } from "@/src/lib/auth/permissions"

export type UserStatus = "Aktif" | "Nonaktif"
export type HomeArea = "Kesiswaan" | "Akademik" | "Keuangan" | "Pemberkasan" | "Pengaturan"
export type RoleScope = "all" | "branch" | "own-students" | "own-classes"

export const ACCESS_GRANT = "access.grant"

export type UserRow = {
  id: string
  name: string
  email: string
  role: { id: string; name: string } | null
  branches: { id: string; name: string }[]
  status: UserStatus
  isSuperAdmin: boolean
}

export type RoleRow = {
  id: string
  name: string
  description: string | null
  homeArea: HomeArea | null
  scope: RoleScope | null
  status: UserStatus
  userCount: number
  permissions: Record<string, Access>
  capabilities: string[]
}

export type PageRow = {
  code: string
  label: string
  href: string
  menuGroup: string | null
  hidden: boolean
}

export type BranchRow = { id: string; name: string; status: UserStatus }

export const HOME_AREAS: readonly HomeArea[] = [
  "Kesiswaan",
  "Akademik",
  "Keuangan",
  "Pemberkasan",
  "Pengaturan",
]

export const SCOPES: readonly { value: RoleScope; label: string }[] = [
  { value: "all", label: "Seluruh cabang" },
  { value: "branch", label: "Cabang pengguna" },
  { value: "own-students", label: "Siswa yang ia pegang" },
  { value: "own-classes", label: "Kelas yang ia ampu" },
]

export const CAPABILITIES: readonly { value: string; label: string }[] = [
  { value: "payments.ratify", label: "Mengesahkan pembayaran" },
  { value: "students.tab.finance", label: "Tab Keuangan" },
  { value: "students.tab.academic", label: "Tab Akademik" },
  { value: "students.tab.documents", label: "Tab Dokumen" },
  { value: "students.tab.admission", label: "Tab Admission" },
  { value: "students.tab.history", label: "Tab Riwayat" },
  { value: "sessions.fill", label: "Mengisi absensi" },
  { value: "leaves.finance-assessment", label: "Menilai kewajiban cuti" },
  { value: "leaves.verify-payment", label: "Memverifikasi pembayaran cuti" },
  { value: "leaves.approve", label: "Menyetujui cuti" },
  { value: "registrations.pic", label: "Dapat dipilih sebagai PIC Marketing" },
  { value: ACCESS_GRANT, label: "Memberi hak akses" },
]

const name = z.string().trim().min(1, "Isi nama.").max(120)

export const userFormSchema = z.object({
  name,
  email: z.string().trim().toLowerCase().pipe(z.email("Format email tidak valid.")),
  password: z
    .string()
    .max(200)
    .refine((value) => value === "" || value.length >= 8, "Kata sandi minimal 8 karakter."),
  roleId: z.uuid("Pilih peran."),
  isActive: z.boolean(),
  branchIds: z.array(z.uuid()),
})

export const roleFormSchema = z.object({
  name,
  description: z.string().trim().max(500),
  homeArea: z.enum(HOME_AREAS).nullable(),
  scope: z.enum(["all", "branch", "own-students", "own-classes"], "Pilih cakupan baris."),
  isActive: z.boolean(),
  permissions: z.record(z.string(), z.enum(["view", "edit"])),
  capabilities: z.array(z.string()),
})

export type UserForm = z.infer<typeof userFormSchema>
export type RoleForm = z.infer<typeof roleFormSchema>

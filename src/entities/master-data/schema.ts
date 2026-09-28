import { z } from "zod"

export type MasterStatus = "Aktif" | "Nonaktif"

export type MasterType =
  | "branch"
  | "program"
  | "major"
  | "level"
  | "lead_source"
  | "certificate_type"
  | "partner_category"
  | "gate"
  | "service"
  | "departure_item"

export type MasterItemRow = {
  id: string
  type: MasterType
  code: string
  name: string
  sortOrder: number
  status: MasterStatus
  contactEmail: string | null
  contactPhone: string | null
}

export type DocumentGroup = "Pribadi" | "Hasil Layanan" | "Bewerbung" | "Dari Betrieb"

export const DOCUMENT_GROUPS: readonly DocumentGroup[] = [
  "Pribadi",
  "Bewerbung",
  "Hasil Layanan",
  "Dari Betrieb",
]

export type DocumentTypeRow = {
  id: string
  code: string
  name: string
  group: DocumentGroup
  required: boolean
  sortOrder: number
  status: MasterStatus
}

export type HolidayRow = { id: string; name: string; date: string }

export type ContentRow = { id: string; name: string; descriptionHtml: string; status: MasterStatus }

export const MASTER_STATUSES: readonly MasterStatus[] = ["Aktif", "Nonaktif"]

const BRANCH_CODE = /^[A-Z]{3}$/
const PHONE = /^\+?[0-9][0-9 -]{5,19}$/

const name = z.string().trim().min(1, "Isi nama.").max(120)
const status = z.enum(["Aktif", "Nonaktif"])

export const masterItemFormSchema = z.object({
  name,
  status,
  code: z.string().trim(),
  contactEmail: z.union([z.literal(""), z.email("Format surel tidak valid.").max(120)]),
  contactPhone: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(PHONE, "Nomor telepon hanya boleh angka, spasi, tanda hubung, dan + di depan."),
  ]),
})

export const branchFormSchema = (initialCode: string | null) =>
  masterItemFormSchema.refine((form) => form.code === initialCode || BRANCH_CODE.test(form.code), {
    path: ["code"],
    message: "Kode cabang harus tiga huruf besar, misalnya BDG.",
  })

export const documentTypeFormSchema = z.object({
  name,
  group: z.enum(["Pribadi", "Hasil Layanan", "Bewerbung", "Dari Betrieb"], "Pilih rumpun."),
  required: z.boolean(),
  status,
})

export const holidayFormSchema = z.object({
  name,
  date: z.iso.date("Pilih tanggal."),
})

export const contentFormSchema = z.object({
  name,
  descriptionHtml: z.string().max(100_000, "Deskripsi terlalu panjang."),
  status,
})

export type MasterItemForm = z.infer<typeof masterItemFormSchema>
export type DocumentTypeForm = z.infer<typeof documentTypeFormSchema>
export type HolidayForm = z.infer<typeof holidayFormSchema>
export type ContentForm = z.infer<typeof contentFormSchema>

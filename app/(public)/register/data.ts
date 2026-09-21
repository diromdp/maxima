import { z } from "zod"

import { eur, formatMoney, idr, subtract, type Money } from "@/src/lib/money"

export type RegistrationPackage = {
  readonly id: string
  readonly program: string
  readonly name: string
  readonly dp: Money
  readonly installments: number
  readonly durationLabel: string
  readonly price: Money
  readonly serviceFeeEur: Money | null
}

export const PACKAGES: readonly RegistrationPackage[] = [
  {
    id: "ausbildung-36",
    program: "Ausbildung",
    name: "Ausbildung 36",
    dp: idr(5_000_000),
    installments: 15,
    durationLabel: "durasi 24 bulan",
    price: idr(38_000_000),
    serviceFeeEur: eur(80_000),
  },
  {
    id: "ausbildung-37",
    program: "Ausbildung",
    name: "Ausbildung 37",
    dp: idr(4_500_000),
    installments: 15,
    durationLabel: "durasi 33 bulan",
    price: idr(37_100_000),
    serviceFeeEur: eur(80_000),
  },
  {
    id: "ausbildung-39-2",
    program: "Ausbildung",
    name: "Ausbildung 39.2",
    dp: idr(4_500_000),
    installments: 13,
    durationLabel: "durasi 18 bulan",
    price: idr(38_500_000),
    serviceFeeEur: eur(80_000),
  },
  {
    id: "ausbildung-45",
    program: "Ausbildung",
    name: "Ausbildung 45",
    dp: idr(5_000_000),
    installments: 12,
    durationLabel: "durasi 18 bulan",
    price: idr(45_000_000),
    serviceFeeEur: eur(80_000),
  },
  {
    id: "ika-pasti",
    program: "Ausbildung",
    name: "Ika Pasti",
    dp: idr(5_000_000),
    installments: 8,
    durationLabel: "durasi 12 bulan",
    price: idr(25_000_000),
    serviceFeeEur: eur(80_000),
  },
  {
    id: "kursus-bahasa",
    program: "Kursus Bahasa",
    name: "Kursus Bahasa Saja",
    dp: idr(3_000_000),
    installments: 6,
    durationLabel: "tanpa penempatan kerja",
    price: idr(12_000_000),
    serviceFeeEur: null,
  },
] as const

export const DEFAULT_PACKAGE_ID = "ausbildung-45"

export const packageLabel = (pkg: RegistrationPackage): string =>
  `${formatMoney(pkg.dp)} · ${pkg.installments} angsuran · ${pkg.durationLabel}`

export const monthlyEstimate = (pkg: RegistrationPackage): Money => {
  const remaining = subtract(pkg.price, pkg.dp)
  return idr(Math.floor(remaining.amount / pkg.installments / 1_000) * 1_000)
}

export const PROMO_CODE = "MAXIMER625"
export const PROMO_DISCOUNT: Money = idr(1_500_000)

export function resolvePromo(code: string): { valid: boolean; message: string; discount: Money } {
  const trimmed = code.trim()
  if (!trimmed) return { valid: false, message: "", discount: idr(0) }
  if (trimmed.toUpperCase() === PROMO_CODE) {
    return {
      valid: true,
      message: `${PROMO_CODE} terpakai · potongan ${formatMoney(PROMO_DISCOUNT)}`,
      discount: PROMO_DISCOUNT,
    }
  }
  return {
    valid: false,
    message: "Kode promo tidak ditemukan atau sudah kedaluwarsa.",
    discount: idr(0),
  }
}

export const BRANCHES = ["Bandung"] as const

export const CONSULTANTS = ["Konsultan 1", "Konsultan 2", "Konsultan 3"] as const

export const PROGRAMS = ["Ausbildung", "FSJ", "Studium", "Kursus Bahasa"] as const
export const INTEREST_FIELDS = ["Pflege", "Gastronomie", "Logistik"] as const
export const INFO_SOURCES = ["Instagram", "Teman", "Alumni", "Website"] as const
export const ANREDE_OPTIONS = ["Herr", "Frau"] as const
export const GENDER_OPTIONS = ["Laki-laki", "Perempuan"] as const
export const EDUCATION_LEVELS = ["SMA", "SMK", "D3", "S1"] as const
export const GERMAN_LEVELS = ["Belum pernah", "A1", "A2", "B1", "B2"] as const

export type DocumentKey =
  | "pasFoto"
  | "aktaKelahiran"
  | "kartuKeluarga"
  | "ktp"
  | "ijazah"
  | "transkrip"
  | "paspor"
  | "suratKontrak"

export const DOCUMENTS: ReadonlyArray<{ key: DocumentKey; label: string; required: boolean }> = [
  { key: "pasFoto", label: "Pas Foto Latar Belakang Putih", required: true },
  { key: "aktaKelahiran", label: "Akta Kelahiran", required: true },
  { key: "kartuKeluarga", label: "Kartu Keluarga", required: true },
  { key: "ktp", label: "KTP", required: true },
  { key: "ijazah", label: "Ijazah Terakhir", required: true },
  { key: "transkrip", label: "Transkrip Nilai Terakhir", required: true },
  { key: "paspor", label: "Paspor", required: false },
  { key: "suratKontrak", label: "Surat Kontrak", required: false },
]

export const REQUIRED_DOCUMENT_COUNT = DOCUMENTS.filter((d) => d.required).length

export const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/jpg"]
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024

export const TERMS_TEXT = [
  "Siswa wajib melunasi biaya kursus sesuai jadwal angsuran pada paket yang dipilih. Keterlambatan pembayaran menunda pembukaan gerbang layanan yang belum tercapai.",
  "Kehadiran minimum wajib dipenuhi setiap bulan mengikuti ketentuan kelas yang berlaku di cabang tempat siswa terdaftar.",
  "Pengunduran diri dan pengembalian dana mengikuti kebijakan Maxima Stiftung yang berlaku saat pengajuan diajukan.",
  "Data pribadi yang diberikan dapat digunakan untuk keperluan proses admission, pembelajaran, dan pengajuan ke partner di Jerman.",
]

export const STEP_TITLES = [
  "Data Diri",
  "Program & Paket",
  "Kontak & Alamat",
  "Pendidikan",
  "Unggah Dokumen",
  "Persetujuan",
  "Akun Admission",
] as const

export const STEP_LABELS_SHORT = [
  "1 Data Diri",
  "2 Program & Paket",
  "3 Kontak & Alamat",
  "4 Pendidikan",
  "5 Unggah Dokumen",
  "6 Persetujuan",
  "7 Akun Admission",
] as const

export type RegistrationValues = {
  email: string
  password: string
  fullName: string
  anrede: string
  nik: string
  gender: string
  birthPlace: string
  birthDate: string
  height: string
  weight: string
  phonePersonal: string
  branch: string
  program: string
  interestField: string
  interestMajor: string
  packageId: string
  consultant: string
  infoSource: string
  referrerName: string
  promoCode: string
  whatsapp: string
  phoneMother: string
  phoneFather: string
  address: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
  emergencyContact: string
  emergencyContactPhone: string
  lastEducationLevel: string
  schoolName: string
  major: string
  graduationYear: string
  averageGrade: string
  germanLevel: string
  workExperience: string
  agreeAccurate: boolean
  agreeAdmission: boolean
  agreeDataUse: boolean
  adminEmail: string
  adminPassword: string
  adminPasswordConfirm: string
}

export const INITIAL_VALUES: RegistrationValues = {
  email: "",
  password: "",
  fullName: "",
  anrede: "",
  nik: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  height: "",
  weight: "",
  phonePersonal: "",
  branch: "",
  program: "",
  interestField: "",
  interestMajor: "",
  packageId: DEFAULT_PACKAGE_ID,
  consultant: "",
  infoSource: "",
  referrerName: "",
  promoCode: "",
  whatsapp: "",
  phoneMother: "",
  phoneFather: "",
  address: "",
  village: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  emergencyContact: "",
  emergencyContactPhone: "",
  lastEducationLevel: "",
  schoolName: "",
  major: "",
  graduationYear: "",
  averageGrade: "",
  germanLevel: "",
  workExperience: "",
  agreeAccurate: false,
  agreeAdmission: false,
  agreeDataUse: false,
  adminEmail: "",
  adminPassword: "",
  adminPasswordConfirm: "",
}

const requiredText = (message: string) => z.string().trim().min(1, message)

export const registrationSchema = z
  .object({
    email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
    password: z.string().min(8, "Kata sandi minimal 8 karakter."),
    fullName: requiredText("Nama lengkap wajib diisi."),
    anrede: requiredText("Panggilan wajib dipilih."),
    nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka."),
    gender: requiredText("Jenis kelamin wajib dipilih."),
    birthPlace: requiredText("Tempat lahir wajib diisi."),
    birthDate: requiredText("Tanggal lahir wajib diisi."),
    height: requiredText("Tinggi badan wajib diisi."),
    weight: requiredText("Berat badan wajib diisi."),
    phonePersonal: z
      .string()
      .regex(/^08\d{8,11}$/, "Format nomor HP tidak valid, contoh 08xxxxxxxxx."),

    branch: requiredText("Cabang wajib dipilih."),
    program: requiredText("Program wajib dipilih."),
    interestField: requiredText("Bidang yang diminati wajib dipilih."),
    interestMajor: requiredText("Jurusan yang diminati wajib diisi."),
    packageId: requiredText("Paket wajib dipilih."),
    consultant: requiredText("Konsultan wajib dipilih."),
    infoSource: requiredText("Sumber informasi wajib dipilih."),
    referrerName: z.string(),
    promoCode: z.string(),

    whatsapp: z
      .string()
      .regex(/^08\d{8,11}$/, "Format nomor WhatsApp tidak valid, contoh 08xxxxxxxxx."),
    phoneMother: z
      .string()
      .regex(/^08\d{8,11}$/, "Format nomor HP tidak valid, contoh 08xxxxxxxxx."),
    phoneFather: z
      .string()
      .regex(/^08\d{8,11}$/, "Format nomor HP tidak valid, contoh 08xxxxxxxxx."),
    address: requiredText("Alamat lengkap wajib diisi."),
    village: requiredText("Kelurahan wajib diisi."),
    district: requiredText("Kecamatan wajib diisi."),
    city: requiredText("Kota atau kabupaten wajib diisi."),
    province: requiredText("Provinsi wajib diisi."),
    postalCode: requiredText("Kode pos wajib diisi."),
    emergencyContact: requiredText("Nama dan hubungan kontak darurat wajib diisi."),
    emergencyContactPhone: z
      .string()
      .regex(/^08\d{8,11}$/, "Format nomor HP tidak valid, contoh 08xxxxxxxxx."),

    lastEducationLevel: requiredText("Jenjang pendidikan wajib dipilih."),
    schoolName: requiredText("Asal sekolah atau kampus wajib diisi."),
    major: requiredText("Jurusan wajib diisi."),
    graduationYear: requiredText("Tahun lulus wajib diisi."),
    averageGrade: requiredText("Nilai rata-rata rapor wajib diisi."),
    germanLevel: requiredText("Kemampuan bahasa Jerman wajib dipilih."),
    workExperience: z.string(),

    agreeAccurate: z.literal(true, "Persetujuan ini wajib dicentang."),
    agreeAdmission: z.literal(true, "Persetujuan ini wajib dicentang."),
    agreeDataUse: z.literal(true, "Persetujuan ini wajib dicentang."),

    adminEmail: z
      .string()
      .trim()
      .min(1, "Email admission wajib diisi.")
      .email("Format email tidak valid."),
    adminPassword: z.string().min(8, "Kata sandi minimal 8 karakter."),
    adminPasswordConfirm: z.string(),
  })
  .refine((v) => v.adminPassword === v.adminPasswordConfirm, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["adminPasswordConfirm"],
  })

export function zodFormResolver(schema: z.ZodType<RegistrationValues>) {
  return (values: RegistrationValues): Record<string, string> => {
    const result = schema.safeParse(values)
    if (result.success) return {}
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join(".")
      if (path && !errors[path]) errors[path] = issue.message
    }
    return errors
  }
}

export const STEP_FIELDS: readonly (keyof RegistrationValues)[][] = [
  [
    "email",
    "password",
    "fullName",
    "anrede",
    "nik",
    "gender",
    "birthPlace",
    "birthDate",
    "height",
    "weight",
    "phonePersonal",
  ],
  ["branch", "program", "interestField", "interestMajor", "packageId", "consultant", "infoSource"],
  [
    "phonePersonal",
    "whatsapp",
    "phoneMother",
    "phoneFather",
    "address",
    "village",
    "district",
    "city",
    "province",
    "postalCode",
    "emergencyContact",
    "emergencyContactPhone",
  ],
  ["lastEducationLevel", "schoolName", "major", "graduationYear", "averageGrade", "germanLevel"],
  [],
  ["agreeAccurate", "agreeAdmission", "agreeDataUse"],
  ["adminEmail", "adminPassword", "adminPasswordConfirm"],
]

export const DRAFT_STORAGE_KEY = "maxima-registration-draft"

import { z } from "zod"

import { PHONE_PATTERN, PHONE_RULE } from "@/src/components/ui/PhoneInput"
import type { PackageChoice } from "@/src/entities/registration/schema"
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

export const monthlyEstimate = (pkg: RegistrationPackage): Money => {
  const remaining = subtract(pkg.price, pkg.dp)
  return idr(Math.floor(remaining.amount / pkg.installments / 1_000) * 1_000)
}

export const INTEREST_FIELDS = ["Pflege", "Gastronomie", "Logistik"] as const
export const ANREDE_OPTIONS = ["Herr", "Frau"] as const
export const GENDER_OPTIONS = ["Laki-laki", "Perempuan"] as const
export const EDUCATION_LEVELS = ["SMA", "SMK", "D3", "S1"] as const
export const GERMAN_LEVELS = ["Belum pernah", "A1", "A2", "B1", "B2"] as const

export const choiceLabel = (pkg: PackageChoice): string =>
  [
    formatMoney(idr(pkg.dpIdr)),
    `${pkg.installments} angsuran`,
    pkg.durationMonths ? `durasi ${pkg.durationMonths} bulan` : null,
  ]
    .filter(Boolean)
    .join(" · ")

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
  branchId: string
  program: string
  interestField: string
  interestMajorId: string
  packageId: string
  picUserId: string
  leadSourceId: string
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
  schoolMajor: string
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
  branchId: "",
  program: "",
  interestField: "",
  interestMajorId: "",
  packageId: "",
  picUserId: "",
  leadSourceId: "",
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
  schoolMajor: "",
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
const phone = z.string().regex(PHONE_PATTERN, PHONE_RULE)

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
    phonePersonal: phone,

    branchId: requiredText("Cabang wajib dipilih."),
    program: requiredText("Program wajib dipilih."),
    interestField: requiredText("Bidang yang diminati wajib dipilih."),
    interestMajorId: requiredText("Jurusan yang diminati wajib dipilih."),
    packageId: requiredText("Paket wajib dipilih."),
    picUserId: requiredText("Konsultan wajib dipilih."),
    leadSourceId: requiredText("Sumber informasi wajib dipilih."),
    referrerName: z.string(),
    promoCode: z.string(),

    whatsapp: phone,
    phoneMother: phone,
    phoneFather: phone,
    address: requiredText("Alamat lengkap wajib diisi."),
    village: requiredText("Kelurahan wajib diisi."),
    district: requiredText("Kecamatan wajib diisi."),
    city: requiredText("Kota atau kabupaten wajib diisi."),
    province: requiredText("Provinsi wajib diisi."),
    postalCode: requiredText("Kode pos wajib diisi."),
    emergencyContact: requiredText("Nama dan hubungan kontak darurat wajib diisi."),
    emergencyContactPhone: phone,

    lastEducationLevel: requiredText("Jenjang pendidikan wajib dipilih."),
    schoolName: requiredText("Asal sekolah atau kampus wajib diisi."),
    schoolMajor: requiredText("Jurusan wajib diisi."),
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
    "whatsapp",
  ],
  [
    "branchId",
    "program",
    "interestField",
    "interestMajorId",
    "packageId",
    "picUserId",
    "leadSourceId",
  ],
  [
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
  [
    "lastEducationLevel",
    "schoolName",
    "schoolMajor",
    "graduationYear",
    "averageGrade",
    "germanLevel",
  ],
  [],
  ["agreeAccurate", "agreeAdmission", "agreeDataUse"],
  ["adminEmail", "adminPassword", "adminPasswordConfirm"],
]

import { z } from "zod"

export type Choice = { id: string; name: string }

export type PackageChoice = Choice & {
  programId: string
  priceIdr: number
  dpIdr: number
  installments: number
  durationMonths: number | null
  monthlyIdr: number | null
  isMonthlyEstimate: boolean
  serviceFeeEurCents: number | null
}

export type RegistrationOptions = {
  branches: Choice[]
  programs: Choice[]
  majors: Choice[]
  leadSources: Choice[]
  packages: PackageChoice[]
  consultants: Choice[]
}

export type DocumentStatus = "Perlu Verifikasi" | "Lengkap" | "Ditolak" | "Diproses"

export type RegistrationDocument = {
  code: string
  name: string
  required: boolean
  status: DocumentStatus | null
  sizeBytes: number | null
}

export type RegistrationContract = {
  id: string
  contractNumber: string | null
  package: Choice
  promoCode: string | null
  priceIdr: number
  discountIdr: number
  finalPriceIdr: number
  downPaymentIdr: number
  installments: number
  monthlyIdr: number | null
}

type Nullable<T> = { [Key in keyof T]: T[Key] | null }

export type RegistrationView = {
  studentId: string
  email: string | null
  submittedAt: string | null
  identity: Nullable<{
    fullName: string
    anrede: string
    nik: string
    gender: string
    birthPlace: string
    birthDate: string
    heightCm: number
    weightKg: number
    phonePersonal: string
    whatsapp: string
  }>
  program: {
    branch: Choice | null
    interestField: string | null
    interestMajorId: string | null
    picUserId: string | null
    leadSourceId: string | null
    referrerName: string | null
  }
  contact: Nullable<{
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
  }>
  education: Nullable<{
    lastEducationLevel: string
    schoolName: string
    schoolMajor: string
    graduationYear: string
    averageGrade: string
    germanLevel: string
    workExperience: string
  }>
  admissionAccount: { email: string | null; hasPassword: boolean }
  consent: { agreeAccurate: boolean; agreeAdmission: boolean; agreeDataUse: boolean }
  contract: RegistrationContract | null
  documents: RegistrationDocument[]
  missing: string[]
}

export type RegistrationListRow = {
  studentId: string
  name: string
  email: string | null
  phone: string | null
  branch: string | null
  packageName: string | null
  pic: string | null
  submittedAt: string | null
  registeredAt: string
}

export type RegistrationSection =
  "identity" | "program" | "contact" | "education" | "admission-account" | "consent"

export const SIGNATURE_DOCUMENT = "tanda-tangan"

export const newContractFormSchema = z.object({
  nis: z.string().trim().min(1, "Pilih siswa.").max(40),
  packageId: z.uuid("Pilih paket."),
  promoCode: z.string().trim().max(40),
})

export type NewContractForm = z.infer<typeof newContractFormSchema>

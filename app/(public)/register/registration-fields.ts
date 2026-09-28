import type { RegistrationView } from "@/src/entities/registration/schema"

import { INITIAL_VALUES, STEP_FIELDS, type RegistrationValues } from "./data"

type Draft = RegistrationView | null

const textOf = (value: string | number | null | undefined) =>
  value === null || value === undefined ? "" : String(value)

const blank = (value: string) => (value.trim() === "" ? null : value.trim())

const numberOf = (value: string) => (blank(value) === null ? null : Number(value))

const FORM_FIELD_OF: Readonly<Record<string, keyof RegistrationValues>> = {
  heightCm: "height",
  weightKg: "weight",
  admissionEmail: "adminEmail",
  admissionPassword: "adminPassword",
  admissionPasswordConfirmation: "adminPasswordConfirm",
}

export const formErrorsOf = (fieldErrors: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [FORM_FIELD_OF[field] ?? field, message]),
  )

export function valuesOf(
  draft: Draft,
  programOf: (packageId: string) => string,
): RegistrationValues {
  if (!draft) return { ...INITIAL_VALUES, packageId: "" }
  const { identity, program, contact, education, consent, contract } = draft
  const packageId = contract?.package.id ?? ""
  return {
    ...INITIAL_VALUES,
    email: draft.email ?? "",
    fullName: textOf(identity.fullName),
    anrede: textOf(identity.anrede),
    nik: textOf(identity.nik),
    gender: textOf(identity.gender),
    birthPlace: textOf(identity.birthPlace),
    birthDate: textOf(identity.birthDate),
    height: textOf(identity.heightCm),
    weight: textOf(identity.weightKg),
    phonePersonal: textOf(identity.phonePersonal),
    branchId: program.branch?.id ?? "",
    program: packageId ? programOf(packageId) : "",
    interestField: textOf(program.interestField),
    interestMajorId: textOf(program.interestMajorId),
    packageId,
    picUserId: textOf(program.picUserId),
    leadSourceId: textOf(program.leadSourceId),
    referrerName: textOf(program.referrerName),
    promoCode: textOf(contract?.promoCode),
    whatsapp: textOf(identity.whatsapp),
    phoneMother: textOf(contact.phoneMother),
    phoneFather: textOf(contact.phoneFather),
    address: textOf(contact.address),
    village: textOf(contact.village),
    district: textOf(contact.district),
    city: textOf(contact.city),
    province: textOf(contact.province),
    postalCode: textOf(contact.postalCode),
    emergencyContact: textOf(contact.emergencyContact),
    emergencyContactPhone: textOf(contact.emergencyContactPhone),
    lastEducationLevel: textOf(education.lastEducationLevel),
    schoolName: textOf(education.schoolName),
    schoolMajor: textOf(education.schoolMajor),
    graduationYear: textOf(education.graduationYear),
    averageGrade: textOf(education.averageGrade),
    germanLevel: textOf(education.germanLevel),
    workExperience: textOf(education.workExperience),
    agreeAccurate: consent.agreeAccurate,
    agreeAdmission: consent.agreeAdmission,
    agreeDataUse: consent.agreeDataUse,
    adminEmail: textOf(draft.admissionAccount.email),
  }
}

export const identityBodyOf = (values: RegistrationValues) => ({
  fullName: values.fullName.trim(),
  anrede: blank(values.anrede),
  nik: blank(values.nik),
  gender: blank(values.gender),
  birthPlace: blank(values.birthPlace),
  birthDate: blank(values.birthDate),
  heightCm: numberOf(values.height),
  weightKg: numberOf(values.weight),
  phonePersonal: blank(values.phonePersonal),
  whatsapp: blank(values.whatsapp),
})

export const programBodyOf = (values: RegistrationValues) => ({
  branchId: blank(values.branchId),
  interestField: blank(values.interestField),
  interestMajorId: blank(values.interestMajorId),
  packageId: blank(values.packageId),
  promoCode: blank(values.promoCode)?.toUpperCase() ?? null,
  picUserId: blank(values.picUserId),
  leadSourceId: blank(values.leadSourceId),
  referrerName: blank(values.referrerName),
})

export const contactBodyOf = (values: RegistrationValues) => ({
  phoneMother: blank(values.phoneMother),
  phoneFather: blank(values.phoneFather),
  address: blank(values.address),
  village: blank(values.village),
  district: blank(values.district),
  city: blank(values.city),
  province: blank(values.province),
  postalCode: blank(values.postalCode),
  emergencyContact: blank(values.emergencyContact),
  emergencyContactPhone: blank(values.emergencyContactPhone),
})

export const educationBodyOf = (values: RegistrationValues) => ({
  lastEducationLevel: blank(values.lastEducationLevel),
  schoolName: blank(values.schoolName),
  schoolMajor: blank(values.schoolMajor),
  graduationYear: blank(values.graduationYear),
  averageGrade: blank(values.averageGrade),
  germanLevel: blank(values.germanLevel),
  workExperience: blank(values.workExperience),
})

export const consentBodyOf = (values: RegistrationValues) => ({
  agreeAccurate: values.agreeAccurate,
  agreeAdmission: values.agreeAdmission,
  agreeDataUse: values.agreeDataUse,
})

export const admissionBodyOf = (values: RegistrationValues) => ({
  admissionEmail: values.adminEmail.trim(),
  admissionPassword: values.adminPassword,
  admissionPasswordConfirmation: values.adminPasswordConfirm,
})

const ACCOUNT_FIELDS: ReadonlySet<keyof RegistrationValues> = new Set(["email", "password"])
const ADMISSION_PASSWORD_FIELDS: ReadonlySet<keyof RegistrationValues> = new Set([
  "adminPassword",
  "adminPasswordConfirm",
])

export const keepsAdmissionPassword = (draft: Draft, values: RegistrationValues) =>
  draft !== null &&
  draft.admissionAccount.hasPassword &&
  values.adminPassword === "" &&
  values.adminEmail.trim() === (draft.admissionAccount.email ?? "")

export function fieldsToCheck(step: number, draft: Draft, values: RegistrationValues) {
  return (STEP_FIELDS[step] ?? []).filter(
    (field) =>
      !(draft !== null && ACCOUNT_FIELDS.has(field)) &&
      !(keepsAdmissionPassword(draft, values) && ADMISSION_PASSWORD_FIELDS.has(field)),
  )
}

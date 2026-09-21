// Kolom tabel Siswa mengikuti data formulir /register (permintaan pemilik repo
// 19 Sep 2026): langkah 1 Data Diri, 2 Program & Paket, 3 Kontak & Alamat,
// 4 Pendidikan, 5 Dokumen, dan dari langkah 6 hanya berkas tanda tangan.
// Nilai per siswa diturunkan dari data dasar di sample.ts secara deterministik -
// angka contoh untuk slicing, bukan data lampiran PRD.

import { DOCUMENTS } from "../../(public)/register/data"

import { type Student, STUDENTS } from "./sample"

export type Registration = {
  readonly email: string
  readonly anrede: string
  readonly nik: string
  readonly gender: string
  readonly birthPlace: string
  readonly birthDate: string
  readonly height: string
  readonly weight: string
  readonly phonePersonal: string
  readonly branch: string
  readonly program: string
  readonly interestField: string
  readonly interestMajor: string
  readonly packageName: string
  readonly consultant: string
  readonly infoSource: string
  readonly referrerName: string
  readonly promoCode: string
  readonly whatsapp: string
  readonly phoneMother: string
  readonly phoneFather: string
  readonly address: string
  readonly village: string
  readonly district: string
  readonly city: string
  readonly province: string
  readonly postalCode: string
  readonly emergencyContact: string
  readonly emergencyContactPhone: string
  readonly lastEducationLevel: string
  readonly schoolName: string
  readonly major: string
  readonly graduationYear: string
  readonly averageGrade: string
  readonly germanLevel: string
  readonly workExperience: string
  readonly documents: string
  readonly signatureFile: string
}

export const REGISTRATION_COLUMNS: readonly {
  readonly key: keyof Registration
  readonly header: string
  readonly step: string
}[] = [
  { key: "email", header: "Email", step: "Data Diri" },
  { key: "anrede", header: "Panggilan / Anrede", step: "Data Diri" },
  { key: "nik", header: "NIK", step: "Data Diri" },
  { key: "gender", header: "Jenis Kelamin", step: "Data Diri" },
  { key: "birthPlace", header: "Tempat Lahir", step: "Data Diri" },
  { key: "birthDate", header: "Tanggal Lahir", step: "Data Diri" },
  { key: "height", header: "Tinggi (cm)", step: "Data Diri" },
  { key: "weight", header: "Berat (kg)", step: "Data Diri" },
  { key: "phonePersonal", header: "HP Pribadi", step: "Data Diri" },
  { key: "branch", header: "Cabang", step: "Program & Paket" },
  { key: "program", header: "Program", step: "Program & Paket" },
  { key: "interestField", header: "Bidang Diminati", step: "Program & Paket" },
  { key: "interestMajor", header: "Jurusan Diminati", step: "Program & Paket" },
  { key: "packageName", header: "Paket", step: "Program & Paket" },
  { key: "consultant", header: "Konsultan", step: "Program & Paket" },
  { key: "infoSource", header: "Sumber Informasi", step: "Program & Paket" },
  { key: "referrerName", header: "Nama Perekomendasi", step: "Program & Paket" },
  { key: "promoCode", header: "Kode Promo", step: "Program & Paket" },
  { key: "whatsapp", header: "WhatsApp", step: "Kontak & Alamat" },
  { key: "phoneMother", header: "HP Ibu", step: "Kontak & Alamat" },
  { key: "phoneFather", header: "HP Ayah", step: "Kontak & Alamat" },
  { key: "address", header: "Alamat", step: "Kontak & Alamat" },
  { key: "village", header: "Kelurahan", step: "Kontak & Alamat" },
  { key: "district", header: "Kecamatan", step: "Kontak & Alamat" },
  { key: "city", header: "Kota / Kabupaten", step: "Kontak & Alamat" },
  { key: "province", header: "Provinsi", step: "Kontak & Alamat" },
  { key: "postalCode", header: "Kode Pos", step: "Kontak & Alamat" },
  { key: "emergencyContact", header: "Kontak Darurat", step: "Kontak & Alamat" },
  { key: "emergencyContactPhone", header: "HP Kontak Darurat", step: "Kontak & Alamat" },
  { key: "lastEducationLevel", header: "Jenjang", step: "Pendidikan" },
  { key: "schoolName", header: "Asal Sekolah", step: "Pendidikan" },
  { key: "major", header: "Jurusan", step: "Pendidikan" },
  { key: "graduationYear", header: "Tahun Lulus", step: "Pendidikan" },
  { key: "averageGrade", header: "Nilai Rapor", step: "Pendidikan" },
  { key: "germanLevel", header: "Bahasa Jerman", step: "Pendidikan" },
  { key: "workExperience", header: "Pengalaman Kerja", step: "Pendidikan" },
  { key: "documents", header: "Dokumen", step: "Unggah Dokumen" },
  { key: "signatureFile", header: "Tanda Tangan", step: "Persetujuan" },
]

const CITY: Readonly<Record<string, [city: string, province: string, code: string]>> = {
  Bandung: ["Kota Bandung", "Jawa Barat", "40131"],
  Jakarta: ["Jakarta Selatan", "DKI Jakarta", "12430"],
  Surabaya: ["Kota Surabaya", "Jawa Timur", "60241"],
  Medan: ["Kota Medan", "Sumatera Utara", "20112"],
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")
    .replace(/\.$/, "")

const phone = (nis: string, shift: number) => `08${(Number(nis) + shift).toString().slice(-10)}`

export function registrationOf(s: Student, index: number): Registration {
  const [city, province, postalCode] = CITY[s.branch] ?? [s.branch, "-", "-"]
  const female = index % 2 === 1
  const year = 2004 + (index % 4)
  const uploaded = DOCUMENTS.length - (s.missingFields > 0 ? 1 : 0)
  return {
    email: `${slug(s.name)}@email.com`,
    anrede: female ? "Frau" : "Herr",
    nik: `327${s.nis}0${index}`.padEnd(16, "0").slice(0, 16),
    gender: female ? "Perempuan" : "Laki-laki",
    birthPlace: city.replace("Kota ", ""),
    birthDate: `${year}-0${(index % 9) + 1}-1${index % 9}`,
    height: `${160 + (index % 5) * 3}`,
    weight: `${52 + (index % 6) * 3}`,
    phonePersonal: phone(s.nis, 11),
    branch: s.branch,
    program: s.program,
    interestField:
      s.major === "Pflege" ? "Kesehatan" : s.major === "Logistik" ? "Logistik" : "Hospitality",
    interestMajor: s.major,
    packageName: s.packageName,
    consultant: s.pic,
    infoSource: s.leadSource,
    referrerName: s.leadSource === "Referensi" ? "Alumni Maxima" : "-",
    promoCode: index % 3 === 0 ? "EARLYBIRD25" : "-",
    whatsapp: phone(s.nis, 11),
    phoneMother: phone(s.nis, 23),
    phoneFather: phone(s.nis, 37),
    address: `Jl. Contoh No. ${10 + index}`,
    village: "Cipaganti",
    district: "Coblong",
    city,
    province,
    postalCode,
    emergencyContact: `${female ? "Ibu" : "Bapak"} ${s.name.split(" ")[0]} - orang tua`,
    emergencyContactPhone: phone(s.nis, 23),
    lastEducationLevel: index % 3 === 0 ? "SMA" : "SMK",
    schoolName: `SMKN ${index + 1} ${city.replace("Kota ", "")}`,
    major: s.major === "Pflege" ? "Keperawatan" : s.major === "Logistik" ? "Teknik" : "Tata Boga",
    graduationYear: `${year + 18}`,
    averageGrade: `${82 + (index % 7)}`,
    germanLevel: s.level === "-" ? "Belum pernah" : s.level,
    workExperience: index % 2 === 0 ? "Belum ada" : "1 tahun, klinik swasta",
    documents: `${uploaded} dari ${DOCUMENTS.length}`,
    signatureFile: `ttd_${s.nis}.png`,
  }
}

export type IdentitySection = {
  readonly id: string
  readonly title: string
  readonly fields: readonly { readonly label: string; readonly value: string }[]
}

// Tab Identitas memakai kolom yang sama dengan tabel, dikelompokkan per langkah
// formulir; Nama Lengkap ditaruh paling depan di Data Diri.
export function identitySections(nis: string): readonly IdentitySection[] {
  const index = STUDENTS.findIndex((s) => s.nis === nis)
  if (index < 0) return []
  const student = STUDENTS[index]!
  const reg = registrationOf(student, index)
  const steps = [...new Set(REGISTRATION_COLUMNS.map((c) => c.step))]
  return steps.map((step) => ({
    id: step.toLowerCase().replace(/[^a-z]+/g, "-"),
    title: step,
    fields: [
      ...(step === "Data Diri" ? [{ label: "Nama Lengkap", value: student.name }] : []),
      ...REGISTRATION_COLUMNS.filter((c) => c.step === step).map((c) => ({
        label: c.header,
        value: reg[c.key],
      })),
    ],
  }))
}

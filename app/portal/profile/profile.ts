export type Reviewer = "Marketing" | "Admission"

export type ProfileField = {
  readonly key: string
  readonly label: string
  readonly value: string
  readonly reviewer: Reviewer
  readonly needsDocument?: boolean
}

export type ProfileSection = {
  readonly id: string
  readonly title: string
  readonly fields: readonly ProfileField[]
}

export const STUDENT = {
  fullName: "Andi Nugroho",
  status: "Aktif",
} as const

export const PERSONAL: ProfileSection = {
  id: "data-diri",
  title: "Data Diri",
  fields: [
    {
      key: "fullName",
      label: "Nama lengkap",
      value: "Andi Nugroho",
      reviewer: "Admission",
      needsDocument: true,
    },
    { key: "nickname", label: "Nama panggilan", value: "Andi", reviewer: "Marketing" },
    {
      key: "nik",
      label: "NIK",
      value: "3273xxxxxxxxxxxx",
      reviewer: "Admission",
      needsDocument: true,
    },
    {
      key: "birth",
      label: "Tempat, tanggal lahir",
      value: "Bandung, 14 Juni 2004",
      reviewer: "Admission",
      needsDocument: true,
    },
    {
      key: "gender",
      label: "Jenis kelamin",
      value: "Laki-laki",
      reviewer: "Admission",
      needsDocument: true,
    },
  ],
}

export const CONTACT: ProfileSection = {
  id: "kontak",
  title: "Kontak dan Alamat",
  fields: [
    { key: "phone", label: "HP pribadi", value: "0812xxxxxxx", reviewer: "Marketing" },
    { key: "whatsapp", label: "HP WhatsApp", value: "0813xxxxxxx", reviewer: "Marketing" },
    { key: "email", label: "Email", value: "andi.nugroho@email.com", reviewer: "Marketing" },
    {
      key: "address",
      label: "Alamat",
      value: "Jl. Cihampelas No. 45, Bandung",
      reviewer: "Marketing",
    },
  ],
}

export const EDUCATION: ProfileSection = {
  id: "pendidikan",
  title: "Pendidikan Terakhir",
  fields: [
    { key: "level", label: "Jenjang", value: "SMK", reviewer: "Admission", needsDocument: true },
    {
      key: "school",
      label: "Asal sekolah",
      value: "SMKN 4 Bandung",
      reviewer: "Admission",
      needsDocument: true,
    },
    {
      key: "major",
      label: "Jurusan",
      value: "Keperawatan",
      reviewer: "Admission",
      needsDocument: true,
    },
    {
      key: "graduation",
      label: "Tahun lulus",
      value: "2023",
      reviewer: "Admission",
      needsDocument: true,
    },
    {
      key: "interest",
      label: "Jurusan diminati",
      value: "Pflege · Gastronomie · Logistik",
      reviewer: "Marketing",
    },
  ],
}

export const COMPANIONS = [
  { label: "PIC Konsultan", value: "Ratna Sari" },
  { label: "Cabang", value: "Bandung" },
  { label: "Pengajar kelas", value: "Mulyadi, S.Pd" },
] as const

export const CHANGEABLE_SECTIONS: readonly ProfileSection[] = [PERSONAL, CONTACT, EDUCATION]

export const NOT_CHANGEABLE_HERE = ["Paket dan harga", "No Kontrak", "Sumber lead"] as const

export type StudentStatus = "Aktif" | "Cuti" | "Alumni" | "Mengundurkan Diri" | "Selesai Kursus"

export type Student = {
  readonly nis: string
  readonly name: string
  readonly contractNumber: string
  readonly branch: string
  readonly program: string
  readonly major: string
  readonly status: StudentStatus
  readonly level: string
  readonly packageName: string
  readonly pic: string
  readonly leadSource: string
  readonly missingFields: number
}

export const STUDENTS: readonly Student[] = [
  {
    nis: "20250233",
    name: "Andi Nugroho",
    contractNumber: "202/118-BDG-2025",
    branch: "Bandung",
    program: "Ausbildung",
    major: "Pflege",
    status: "Aktif",
    level: "A2",
    packageName: "Ausbildung 45",
    pic: "Ratna Sari",
    leadSource: "Instagram",
    missingFields: 0,
  },
  {
    nis: "20250241",
    name: "Rina Agustina",
    contractNumber: "204/118-BDG-2025",
    branch: "Bandung",
    program: "Ausbildung",
    major: "Gastronomie",
    status: "Aktif",
    level: "A1",
    packageName: "Ausbildung 45",
    pic: "Ratna Sari",
    leadSource: "Referensi",
    missingFields: 2,
  },
  {
    nis: "20250258",
    name: "Bayu Saputra",
    contractNumber: "213/118-JKT-2025",
    branch: "Jakarta",
    program: "Ausbildung",
    major: "Logistik",
    status: "Aktif",
    level: "A2",
    packageName: "Ausbildung 44",
    pic: "Hendra W.",
    leadSource: "Website",
    missingFields: 0,
  },
  {
    nis: "20250190",
    name: "Siti Rohmah",
    contractNumber: "198/118-SBY-2025",
    branch: "Surabaya",
    program: "Ausbildung",
    major: "Pflege",
    status: "Cuti",
    level: "B1",
    packageName: "Ausbildung 43",
    pic: "Andri W.",
    leadSource: "Instagram",
    missingFields: 0,
  },
  {
    nis: "20240172",
    name: "Nadia Putri",
    contractNumber: "172/118-JKT-2024",
    branch: "Jakarta",
    program: "Ausbildung",
    major: "Pflege",
    status: "Alumni",
    level: "B2",
    packageName: "Ausbildung 41",
    pic: "Siti Rahma",
    leadSource: "Pameran",
    missingFields: 0,
  },
  {
    nis: "20240187",
    name: "Rizky Ramadhan",
    contractNumber: "187/118-BDG-2024",
    branch: "Bandung",
    program: "Ausbildung",
    major: "Gastronomie",
    status: "Aktif",
    level: "A2",
    packageName: "Ausbildung 45",
    pic: "Ratna Sari",
    leadSource: "Website",
    missingFields: 1,
  },
  {
    nis: "20250254",
    name: "Dewi Lestari",
    contractNumber: "254/118-MDN-2025",
    branch: "Medan",
    program: "Ausbildung",
    major: "Pflege",
    status: "Mengundurkan Diri",
    level: "A1",
    packageName: "Ausbildung 45",
    pic: "Andri W.",
    leadSource: "Referensi",
    missingFields: 4,
  },
  {
    nis: "20240188",
    name: "Yoga Pratama",
    contractNumber: "188/118-JKT-2024",
    branch: "Jakarta",
    program: "Ausbildung",
    major: "Logistik",
    status: "Selesai Kursus",
    level: "B1",
    packageName: "Ausbildung 40",
    pic: "Siti Rahma",
    leadSource: "Instagram",
    missingFields: 0,
  },
  {
    nis: "20240199",
    name: "Lia Handayani",
    contractNumber: "199/118-BDG-2024",
    branch: "Bandung",
    program: "Ausbildung",
    major: "Pflege",
    status: "Aktif",
    level: "A1",
    packageName: "Ausbildung 45",
    pic: "Ratna Sari",
    leadSource: "Pameran",
    missingFields: 0,
  },
]

export const STATUS_BADGE: Readonly<Record<StudentStatus, string>> = {
  Aktif: "badge-beres",
  Cuti: "badge-terbuka",
  Alumni: "badge-terkunci",
  "Selesai Kursus": "badge-terkunci",
  "Mengundurkan Diri": "badge-tindakan",
}

export const STATUS_ORDER: readonly StudentStatus[] = [
  "Aktif",
  "Cuti",
  "Alumni",
  "Selesai Kursus",
  "Mengundurkan Diri",
]

export type FilterKey =
  "branch" | "program" | "major" | "status" | "level" | "packageName" | "pic" | "leadSource"

export const FILTERS: readonly { readonly key: FilterKey; readonly label: string }[] = [
  { key: "branch", label: "Cabang" },
  { key: "program", label: "Program" },
  { key: "major", label: "Jurusan" },
  { key: "status", label: "Status" },
  { key: "level", label: "Level" },
  { key: "packageName", label: "Paket" },
  { key: "pic", label: "PIC" },
  { key: "leadSource", label: "Sumber Lead" },
]

export function filterOptions(key: FilterKey): readonly string[] {
  if (key === "status") return STATUS_ORDER
  return [...new Set(STUDENTS.map((s) => s[key]))].sort()
}

export const findStudent = (nis: string): Student | undefined => STUDENTS.find((s) => s.nis === nis)

export function completenessLabel(s: Student): string {
  return s.missingFields === 0 ? "Lengkap" : `Kurang ${s.missingFields}`
}

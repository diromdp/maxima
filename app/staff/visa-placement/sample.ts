export const ALUMNI_STATUSES = ["Dapat Vertrag", "Proses Visa", "Alumni"] as const
export type AlumniStatus = (typeof ALUMNI_STATUSES)[number]

export const ALUMNI_STATUS_BADGE: Readonly<Record<AlumniStatus, string>> = {
  "Dapat Vertrag": "badge-berjalan",
  "Proses Visa": "badge-berjalan",
  Alumni: "badge-beres",
}

export const VISA_STATUSES = ["Belum Diajukan", "Diajukan", "Visa Terbit"] as const
export type VisaStatus = (typeof VISA_STATUSES)[number]

export const VISA_STATUS_BADGE: Readonly<Record<VisaStatus, string>> = {
  "Belum Diajukan": "badge-terkunci",
  Diajukan: "badge-berjalan",
  "Visa Terbit": "badge-beres",
}

export const VISA_TYPES = [
  "Visa D (Nationales Visa - Ausbildung)",
  "Visa D (Nationales Visa - FSJ)",
  "Visa D (Nationales Visa - Studium)",
] as const

export const BRANCHES = ["Bandung", "Jakarta", "Surabaya", "Malang"] as const
export const PROGRAMS = ["Ausbildung", "FSJ", "Studium"] as const

export type VisaData = {
  readonly appliedAt: string | null
  readonly interviewAt: string | null
  readonly issuedAt: string | null
  readonly type: (typeof VISA_TYPES)[number] | null
  readonly validity: string | null
}

export type PlacementData = {
  readonly company: string
  readonly school: string
  readonly major: string
  readonly cityState: string
  readonly contractStart: string | null
  readonly contractEnd: string | null
  readonly departureAt: string | null
}

export const DEPARTURE_CHECKLIST = [
  "Paspor masih berlaku",
  "Visa terbit",
  "Kontrak kerja ditandatangani",
  "Krankenversicherung",
  "Rahmenplan",
  "Tiket pesawat",
  "Schulvertrag",
  "Mietvertrag / Wohnungsbestätigung",
  "Akta Kelahiran (terjemah + apostille)",
  "Ijazah terakhir (terjemah + apostille)",
  "Transkrip nilai",
  "Kartu Keluarga",
  "Paket Roaming Data",
  "Uang Tunai Euro",
  "Obat Pribadi",
] as const

export const CHECKLIST_SHORT: Readonly<Record<(typeof DEPARTURE_CHECKLIST)[number], string>> = {
  "Paspor masih berlaku": "Paspor",
  "Visa terbit": "Visa",
  "Kontrak kerja ditandatangani": "Vertrag",
  Krankenversicherung: "KV",
  Rahmenplan: "Rahmen",
  "Tiket pesawat": "Tiket",
  Schulvertrag: "Schule",
  "Mietvertrag / Wohnungsbestätigung": "Wohnung",
  "Akta Kelahiran (terjemah + apostille)": "Akta",
  "Ijazah terakhir (terjemah + apostille)": "Ijazah",
  "Transkrip nilai": "Transkrip",
  "Kartu Keluarga": "KK",
  "Paket Roaming Data": "Roaming",
  "Uang Tunai Euro": "Euro",
  "Obat Pribadi": "Obat",
}

export type AlumniFile = { readonly label: string; readonly fileName: string | null }

export type Alumnus = {
  readonly nis: string
  readonly contractNumber: string
  readonly salutation: "Herr" | "Frau"
  readonly name: string
  readonly intakeYear: number
  readonly branch: (typeof BRANCHES)[number]
  readonly program: (typeof PROGRAMS)[number]
  readonly field: string
  readonly visa: VisaData
  readonly placement: PlacementData
  readonly proposal: Partial<VisaData & PlacementData> | null
  readonly checklist: readonly (typeof DEPARTURE_CHECKLIST)[number][]
  readonly files: readonly AlumniFile[]
}

const files = (suffix: string, missing: readonly string[] = []): readonly AlumniFile[] =>
  [
    ["Visa", `Visa_${suffix}.pdf`],
    ["Kontrak Kerja (Vertrag)", `Vertrag_${suffix}.pdf`],
    ["Krankenversicherung", `KV_${suffix}.pdf`],
    ["IHK", `IHK_${suffix}.pdf`],
    ["Rahmenplan", `Rahmenplan_${suffix}.pdf`],
    ["Paspor", `Paspor_${suffix}.pdf`],
    ["Akta Lahir (Terjemah + Apostille)", `Akta_Trj_Apo_${suffix}.pdf`],
    ["Ijazah (Terjemah + Apostille)", `Ijazah_Trj_Apo_${suffix}.pdf`],
    ["Sertifikat B1", `Sertifikat_B1_${suffix}.pdf`],
    ["Lebenslauf", `Lebenslauf_${suffix}.pdf`],
    ["Motivationsschreiben", `Motivasi_${suffix}.pdf`],
  ].map(([label, fileName]) => ({ label, fileName: missing.includes(label) ? null : fileName }))

const ALL_CHECKED = [...DEPARTURE_CHECKLIST]

export const ALUMNI: readonly Alumnus[] = [
  {
    nis: "20240101",
    contractNumber: "MXM-BDG-001-24",
    salutation: "Herr",
    name: "Rizky Pratama",
    intakeYear: 2024,
    branch: "Bandung",
    program: "Ausbildung",
    field: "Hotel",
    visa: {
      appliedAt: "2025-02-05",
      interviewAt: "2025-02-22",
      issuedAt: "2025-03-10",
      type: "Visa D (Nationales Visa - Ausbildung)",
      validity: "1 Tahun",
    },
    placement: {
      company: "Anabela Kliniken GmbH",
      school: "Berufliche Schule Hamburg-Harburg",
      major: "Altenpflege (Perawat Lansia)",
      cityState: "Hamburg",
      contractStart: "2025-09-01",
      contractEnd: "2028-08-31",
      departureAt: "2025-08-15",
    },
    proposal: null,
    checklist: ALL_CHECKED,
    files: files("Rizky"),
  },
  {
    nis: "20240115",
    contractNumber: "MXM-JKT-015-24",
    salutation: "Frau",
    name: "Sari Indah",
    intakeYear: 2024,
    branch: "Jakarta",
    program: "Ausbildung",
    field: "Pflege",
    visa: {
      appliedAt: "2025-03-03",
      interviewAt: "2025-03-20",
      issuedAt: "2025-04-08",
      type: "Visa D (Nationales Visa - Ausbildung)",
      validity: "1 Tahun",
    },
    placement: {
      company: "Diakonie Stuttgart",
      school: "Berufsfachschule für Pflege Stuttgart",
      major: "Pflegefachfrau",
      cityState: "Stuttgart, Baden-Württemberg",
      contractStart: "2025-09-01",
      contractEnd: "2028-08-31",
      departureAt: "2025-08-20",
    },
    proposal: null,
    checklist: ALL_CHECKED,
    files: files("Sari"),
  },
  {
    nis: "20240122",
    contractNumber: "MXM-BDG-022-24",
    salutation: "Herr",
    name: "Dimas Aryo",
    intakeYear: 2024,
    branch: "Bandung",
    program: "Ausbildung",
    field: "IT",
    visa: {
      appliedAt: "2025-02-10",
      interviewAt: "2025-02-28",
      issuedAt: "2025-03-18",
      type: "Visa D (Nationales Visa - Ausbildung)",
      validity: "1 Tahun",
    },
    placement: {
      company: "Sana Kliniken",
      school: "Berufsschule München",
      major: "Fachinformatiker",
      cityState: "München, Bayern",
      contractStart: "2025-09-01",
      contractEnd: "2028-08-31",
      departureAt: "2025-08-18",
    },
    proposal: null,
    checklist: ALL_CHECKED.filter((item) => item !== "Obat Pribadi"),
    files: files("Dimas"),
  },
  {
    nis: "20250108",
    contractNumber: "MXM-SBY-008-25",
    salutation: "Frau",
    name: "Amelia Putri",
    intakeYear: 2025,
    branch: "Surabaya",
    program: "Ausbildung",
    field: "Hotel",
    visa: {
      appliedAt: "2026-02-05",
      interviewAt: null,
      issuedAt: null,
      type: "Visa D (Nationales Visa - Ausbildung)",
      validity: null,
    },
    placement: {
      company: "Caritasverband",
      school: "",
      major: "Hotelfachfrau",
      cityState: "Köln, Nordrhein-Westfalen",
      contractStart: "2026-09-01",
      contractEnd: "2029-08-31",
      departureAt: null,
    },
    proposal: { interviewAt: "2026-02-20", school: "Berufskolleg Köln" },
    checklist: ["Paspor masih berlaku", "Kontrak kerja ditandatangani", "Kartu Keluarga"],
    files: files("Amelia", ["Visa", "Krankenversicherung", "Rahmenplan", "IHK"]),
  },
  {
    nis: "20250141",
    contractNumber: "MXM-BDG-041-25",
    salutation: "Herr",
    name: "Fajar Nugraha",
    intakeYear: 2025,
    branch: "Bandung",
    program: "Ausbildung",
    field: "Pflege",
    visa: { appliedAt: null, interviewAt: null, issuedAt: null, type: null, validity: null },
    placement: {
      company: "AWO Baden",
      school: "",
      major: "Altenpflege",
      cityState: "Karlsruhe, Baden-Württemberg",
      contractStart: null,
      contractEnd: null,
      departureAt: null,
    },
    proposal: { contractStart: "2026-10-01", contractEnd: "2029-09-30" },
    checklist: ["Paspor masih berlaku", "Kontrak kerja ditandatangani"],
    files: files("Fajar", ["Visa", "Krankenversicherung", "Rahmenplan", "IHK"]),
  },
  {
    nis: "20250203",
    contractNumber: "MXM-MLG-003-25",
    salutation: "Frau",
    name: "Nadia Safitri",
    intakeYear: 2025,
    branch: "Malang",
    program: "Ausbildung",
    field: "Koch",
    visa: {
      appliedAt: "2025-11-04",
      interviewAt: "2025-11-25",
      issuedAt: "2025-12-15",
      type: "Visa D (Nationales Visa - Ausbildung)",
      validity: "1 Tahun",
    },
    placement: {
      company: "Asklepios Kliniken",
      school: "Berufliche Schule Hamburg",
      major: "Koch / Köchin",
      cityState: "Hamburg",
      contractStart: "2026-03-01",
      contractEnd: "2029-02-28",
      departureAt: "2026-02-10",
    },
    proposal: null,
    checklist: ALL_CHECKED,
    files: files("Nadia"),
  },
]

export const alumnusStatus = (alumnus: Pick<Alumnus, "visa" | "placement">): AlumniStatus =>
  alumnus.placement.departureAt
    ? "Alumni"
    : alumnus.visa.appliedAt
      ? "Proses Visa"
      : "Dapat Vertrag"

export const visaStatus = (visa: VisaData): VisaStatus =>
  visa.issuedAt ? "Visa Terbit" : visa.appliedAt ? "Diajukan" : "Belum Diajukan"

export const findAlumnus = (nis: string) => ALUMNI.find((alumnus) => alumnus.nis === nis)

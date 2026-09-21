export const PARTNERSHIP_STATUSES = ["Aktif", "Non-aktif"] as const
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number]

export const PARTNERSHIP_BADGE: Readonly<Record<PartnershipStatus, string>> = {
  Aktif: "badge-beres",
  "Non-aktif": "badge-tindakan",
}

export const INDUSTRIES = [
  "Kesehatan / Perawat",
  "Sosial / FSJ",
  "Sosial / Altenpflege",
  "Sosial / Au Pair",
] as const

export type Partner = {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly city: string
  readonly industry: (typeof INDUSTRIES)[number]
  readonly openPositions: number
  readonly status: PartnershipStatus
  readonly contact: string
}

export const PARTNERS: readonly Partner[] = [
  {
    id: "asklepios",
    name: "Asklepios Kliniken",
    shortName: "Asklepios",
    city: "Hamburg",
    industry: "Kesehatan / Perawat",
    openPositions: 12,
    status: "Aktif",
    contact: "Dr. Müller (+49 40 ...)",
  },
  {
    id: "diakonie",
    name: "Diakonie Stuttgart",
    shortName: "Diakonie",
    city: "Stuttgart",
    industry: "Sosial / FSJ",
    openPositions: 8,
    status: "Aktif",
    contact: "Frau Becker (becker@...)",
  },
  {
    id: "sana",
    name: "Sana Kliniken",
    shortName: "Sana Kliniken",
    city: "München",
    industry: "Kesehatan / Perawat",
    openPositions: 15,
    status: "Aktif",
    contact: "Herr Wagner (+49 89 ...)",
  },
  {
    id: "awo",
    name: "AWO Baden",
    shortName: "AWO Baden",
    city: "Karlsruhe",
    industry: "Sosial / Altenpflege",
    openPositions: 6,
    status: "Aktif",
    contact: "Frau Fischer (fischer@...)",
  },
  {
    id: "caritas",
    name: "Caritasverband",
    shortName: "Caritas",
    city: "Köln",
    industry: "Sosial / Au Pair",
    openPositions: 5,
    status: "Aktif",
    contact: "Frau Weber (+49 221 ...)",
  },
  {
    id: "frankfurt",
    name: "Klinikum Frankfurt",
    shortName: "Klinikum Frankfurt",
    city: "Frankfurt",
    industry: "Kesehatan / Perawat",
    openPositions: 0,
    status: "Non-aktif",
    contact: "Dr. Schulz (+49 69 ...)",
  },
]

export const CITIES = [...new Set(PARTNERS.map((partner) => partner.city))]

export const partnerById = (id: string) =>
  PARTNERS.find((partner) => partner.id === id) ?? PARTNERS[0]

export const APPLICATION_STATUSES = [
  "Masih Dicarikan Betrieb",
  "Proses Bewerbung",
  "Unterlagen Masuk",
  "Unterlagen Pernah Masuk",
  "Interview Partner",
  "Menunggu Hasil Interview",
  "Gagal Interview - Partner",
  "Interview Betrieb",
  "Gagal Interview - Betrieb",
  "Dapat Vertrag",
  "Tidak Lanjut Proses",
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const FAILED_STATUSES: readonly ApplicationStatus[] = [
  "Gagal Interview - Partner",
  "Gagal Interview - Betrieb",
  "Tidak Lanjut Proses",
]

export const applicationBadge = (status: ApplicationStatus) =>
  status === "Dapat Vertrag"
    ? "badge-beres"
    : FAILED_STATUSES.includes(status)
      ? "badge-tindakan"
      : status === "Masih Dicarikan Betrieb"
        ? "badge-terkunci"
        : "badge-berjalan"

export const statusNumber = (status: ApplicationStatus) => APPLICATION_STATUSES.indexOf(status) + 1

export type Application = {
  readonly id: string
  readonly nis: string
  readonly studentName: string
  readonly partnerId: string
  readonly position: string
  readonly status: ApplicationStatus
  readonly date: string
  readonly partnerNote: string
  readonly admissionNote: string
  readonly admissionPic: string
}

export const APPLICATIONS: readonly Application[] = [
  {
    id: "app-1",
    nis: "20250233",
    studentName: "Andi Nugroho",
    partnerId: "diakonie",
    position: "Perawat (FSJ)",
    status: "Dapat Vertrag",
    date: "2025-02-15",
    partnerNote: "Dokumen lengkap, siap dikirim ke Betrieb.",
    admissionNote: "Kirim PDF kontrak asli via DHL.",
    admissionPic: "Sarah K.",
  },
  {
    id: "app-2",
    nis: "20250233",
    studentName: "Andi Nugroho",
    partnerId: "asklepios",
    position: "Perawat",
    status: "Gagal Interview - Partner",
    date: "2025-01-10",
    partnerNote: "Sprechen A2 kurang lancar.",
    admissionNote: "Lakukan remedial latihan wawancara sebelum pengajuan berikutnya.",
    admissionPic: "Sarah K.",
  },
  {
    id: "app-3",
    nis: "20250241",
    studentName: "Rina Agustina",
    partnerId: "awo",
    position: "FSJ Altenpflege",
    status: "Dapat Vertrag",
    date: "2025-02-14",
    partnerNote: "Vertrag sudah ditandatangani.",
    admissionNote: "Jadwal wawancara visa 25 Feb, lanjut di Visa & Penempatan.",
    admissionPic: "Dewi S.",
  },
  {
    id: "app-4",
    nis: "20250258",
    studentName: "Bayu Saputra",
    partnerId: "sana",
    position: "Ausbildung",
    status: "Masih Dicarikan Betrieb",
    date: "2025-02-12",
    partnerNote: "Menunggu kuota baru April.",
    admissionNote: "Prioritaskan pengiriman dokumen begitu kuota dibuka.",
    admissionPic: "Dewi S.",
  },
  {
    id: "app-5",
    nis: "20250190",
    studentName: "Siti Rohmah",
    partnerId: "caritas",
    position: "Au Pair",
    status: "Proses Bewerbung",
    date: "2025-02-11",
    partnerNote: "CV sudah diserahkan ke koordinator.",
    admissionNote: "Foto paspor perlu diperjelas.",
    admissionPic: "Sarah K.",
  },
  {
    id: "app-6",
    nis: "20250112",
    studentName: "Eko Prasetyo",
    partnerId: "asklepios",
    position: "Perawat",
    status: "Gagal Interview - Betrieb",
    date: "2025-02-10",
    partnerNote: "Betrieb memilih kandidat lain.",
    admissionNote: "Ajukan ke Sana Kliniken bulan depan.",
    admissionPic: "Dewi S.",
  },
  {
    id: "app-7",
    nis: "20250113",
    studentName: "Farhan Majid",
    partnerId: "asklepios",
    position: "Perawat (FSJ)",
    status: "Interview Partner",
    date: "2025-02-09",
    partnerNote: "Interview daring 17 Feb.",
    admissionNote: "Latihan Simulasi 2 dibatalkan, jadwalkan ulang.",
    admissionPic: "Sarah K.",
  },
  {
    id: "app-8",
    nis: "20240199",
    studentName: "Dewi Lestari",
    partnerId: "diakonie",
    position: "FSJ Altenpflege",
    status: "Dapat Vertrag",
    date: "2025-02-05",
    partnerNote: "Vertrag diterima, mulai September.",
    admissionNote: "Sudah berangkat, lanjut di Visa & Penempatan.",
    admissionPic: "Sarah K.",
  },
  {
    id: "app-9",
    nis: "20240172",
    studentName: "Budi Hartono",
    partnerId: "awo",
    position: "Ausbildung",
    status: "Dapat Vertrag",
    date: "2025-01-01",
    partnerNote: "Kontrak tiga tahun.",
    admissionNote: "Alumni, penempatan selesai.",
    admissionPic: "Dewi S.",
  },
]

export const placedCount = (partnerId: string) =>
  new Set(
    APPLICATIONS.filter(
      (application) =>
        application.partnerId === partnerId && application.status === "Dapat Vertrag",
    ).map((application) => application.nis),
  ).size

export type TrackingRow = {
  readonly nis: string
  readonly studentName: string
  readonly latest: Application
  readonly history: readonly Application[]
}

export const trackingRows = (applications: readonly Application[]): readonly TrackingRow[] => {
  const byStudent = new Map<string, Application[]>()
  for (const application of applications) {
    byStudent.set(application.nis, [...(byStudent.get(application.nis) ?? []), application])
  }
  return [...byStudent.values()].map((history) => {
    const sorted = [...history].sort((left, right) => right.date.localeCompare(left.date))
    return {
      nis: sorted[0].nis,
      studentName: sorted[0].studentName,
      latest: sorted[0],
      history: sorted,
    }
  })
}

export const PRACTICE_STATUSES = ["Dijadwalkan", "Selesai", "Dibatalkan"] as const
export type PracticeStatus = (typeof PRACTICE_STATUSES)[number]

export const PRACTICE_BADGE: Readonly<Record<PracticeStatus, string>> = {
  Dijadwalkan: "badge-info",
  Selesai: "badge-beres",
  Dibatalkan: "badge-tindakan",
}

export const PRACTICE_RESULTS = ["Siap", "Latihan Lagi"] as const
export type PracticeResult = (typeof PRACTICE_RESULTS)[number]

export const TRAINERS = ["Ari Wibowo", "Endah Sari", "Budi Santoso"] as const

export type InterviewPractice = {
  readonly id: string
  readonly date: string
  readonly nis: string
  readonly studentName: string
  readonly position: string
  readonly partnerId: string
  readonly session: number
  readonly trainer: (typeof TRAINERS)[number]
  readonly status: PracticeStatus
  readonly result: PracticeResult | null
  readonly evaluation?: string
}

export const PRACTICES: readonly InterviewPractice[] = [
  {
    id: "pr-1",
    date: "2025-02-22",
    nis: "20250233",
    studentName: "Andi Nugroho",
    position: "Perawat (FSJ)",
    partnerId: "diakonie",
    session: 2,
    trainer: "Ari Wibowo",
    status: "Dijadwalkan",
    result: null,
  },
  {
    id: "pr-2",
    date: "2025-02-20",
    nis: "20250241",
    studentName: "Rina Agustina",
    position: "FSJ Altenpflege",
    partnerId: "awo",
    session: 3,
    trainer: "Endah Sari",
    status: "Selesai",
    result: "Siap",
  },
  {
    id: "pr-3",
    date: "2025-02-19",
    nis: "20250258",
    studentName: "Bayu Saputra",
    position: "Ausbildung",
    partnerId: "sana",
    session: 1,
    trainer: "Ari Wibowo",
    status: "Selesai",
    result: "Latihan Lagi",
  },
  {
    id: "pr-4",
    date: "2025-02-18",
    nis: "20250190",
    studentName: "Siti Rohmah",
    position: "Au Pair",
    partnerId: "caritas",
    session: 1,
    trainer: "Endah Sari",
    status: "Selesai",
    result: "Siap",
  },
  {
    id: "pr-5",
    date: "2025-02-17",
    nis: "20250113",
    studentName: "Farhan Majid",
    position: "Perawat (FSJ)",
    partnerId: "asklepios",
    session: 2,
    trainer: "Budi Santoso",
    status: "Dibatalkan",
    result: null,
  },
  {
    id: "pr-6",
    date: "2025-02-15",
    nis: "20250114",
    studentName: "Denny Siregar",
    position: "FSJ Altenpflege",
    partnerId: "diakonie",
    session: 1,
    trainer: "Ari Wibowo",
    status: "Selesai",
    result: "Latihan Lagi",
  },
  {
    id: "pr-7",
    date: "2025-02-14",
    nis: "20250115",
    studentName: "Clara Shinta",
    position: "Ausbildung",
    partnerId: "asklepios",
    session: 3,
    trainer: "Endah Sari",
    status: "Selesai",
    result: "Siap",
  },
]

export type Candidate = {
  readonly nis: string
  readonly name: string
  readonly missingBewerbung: readonly string[]
  readonly certificateValid: boolean
}

export const CANDIDATES: readonly Candidate[] = [
  {
    nis: "20250233",
    name: "Andi Nugroho",
    missingBewerbung: ["Video Perkenalan"],
    certificateValid: true,
  },
  { nis: "20250241", name: "Rina Agustina", missingBewerbung: [], certificateValid: true },
  { nis: "20250258", name: "Bayu Saputra", missingBewerbung: [], certificateValid: true },
  { nis: "20250190", name: "Siti Rohmah", missingBewerbung: [], certificateValid: true },
  { nis: "20250112", name: "Eko Prasetyo", missingBewerbung: [], certificateValid: false },
  { nis: "20250113", name: "Farhan Majid", missingBewerbung: [], certificateValid: true },
]

export const ADMISSION_PICS = ["Sarah K.", "Dewi S."] as const

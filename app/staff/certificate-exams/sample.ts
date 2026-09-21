export const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const
export type Level = (typeof LEVELS)[number]

export const CERTIFICATE_KINDS = ["Goethe", "ÖSD", "ECL", "TestDaF"] as const
export type CertificateKind = (typeof CERTIFICATE_KINDS)[number]

export const CERTIFICATE_STATUSES = ["Berlaku", "Kedaluwarsa"] as const
export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number]

export const CERTIFICATE_STATUS_BADGE: Readonly<Record<CertificateStatus, string>> = {
  Berlaku: "badge-beres",
  Kedaluwarsa: "badge-tindakan",
}

export const MODULES = [
  { key: "lesen", label: "Lesen" },
  { key: "hoeren", label: "Hören" },
  { key: "schreiben", label: "Schreiben" },
  { key: "sprechen", label: "Sprechen" },
] as const
export type ModuleKey = (typeof MODULES)[number]["key"]

export type ModuleScore = {
  readonly score: number
  readonly expiresAt: string
}

export type Certificate = {
  readonly id: string
  readonly studentName: string
  readonly kind: CertificateKind
  readonly level: Level
  readonly modules: Readonly<Record<ModuleKey, ModuleScore>>
  readonly status: CertificateStatus
}

const modules = (
  scores: readonly [number, number, number, number],
  expiresAt: string,
): Readonly<Record<ModuleKey, ModuleScore>> => ({
  lesen: { score: scores[0], expiresAt },
  hoeren: { score: scores[1], expiresAt },
  schreiben: { score: scores[2], expiresAt },
  sprechen: { score: scores[3], expiresAt },
})

export const CERTIFICATES: readonly Certificate[] = [
  {
    id: "cert-1",
    studentName: "Emma Wilson",
    kind: "Goethe",
    level: "B2",
    modules: modules([85, 90, 80, 88], "2026-12"),
    status: "Berlaku",
  },
  {
    id: "cert-2",
    studentName: "Sarah Chen",
    kind: "ÖSD",
    level: "B1",
    modules: modules([75, 80, 78, 82], "2025-06"),
    status: "Berlaku",
  },
  {
    id: "cert-3",
    studentName: "James Park",
    kind: "ECL",
    level: "A2",
    modules: modules([60, 65, 55, 70], "2026-04"),
    status: "Berlaku",
  },
  {
    id: "cert-4",
    studentName: "Rizky Ramadhan",
    kind: "Goethe",
    level: "A2",
    modules: modules([45, 50, 40, 48], "2024-10"),
    status: "Kedaluwarsa",
  },
]

export const formatExpiry = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-")
  return `Exp: ${month}/${year}`
}

export const RECOMMENDATION_STATUSES = ["Siap Ujian", "Belum Siap"] as const
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number]

export const RECOMMENDATION_BADGE: Readonly<Record<RecommendationStatus, string>> = {
  "Siap Ujian": "badge-beres",
  "Belum Siap": "badge-tindakan",
}

export const READY_THRESHOLD = 80

export type ExamRecommendation = {
  readonly nis: string
  readonly studentName: string
  readonly level: Level
  readonly averageScore: number
  readonly recommendation: RecommendationStatus
  readonly recommendedAt: string
  readonly recommendedBy: string
}

export const RECOMMENDATIONS: readonly ExamRecommendation[] = [
  {
    nis: "20240101",
    studentName: "Aditya Pratama",
    level: "B1",
    averageScore: 86.5,
    recommendation: "Siap Ujian",
    recommendedAt: "2026-01-12",
    recommendedBy: "Herr Schmidt",
  },
  {
    nis: "20240102",
    studentName: "Clara Amalia",
    level: "B2",
    averageScore: 91.2,
    recommendation: "Siap Ujian",
    recommendedAt: "2026-01-11",
    recommendedBy: "Frau Müller",
  },
  {
    nis: "20240103",
    studentName: "Farhan Hakim",
    level: "A2",
    averageScore: 74.8,
    recommendation: "Belum Siap",
    recommendedAt: "2026-01-10",
    recommendedBy: "Herr Schmidt",
  },
  {
    nis: "20240104",
    studentName: "Grace Natalia",
    level: "B1",
    averageScore: 88,
    recommendation: "Siap Ujian",
    recommendedAt: "2026-01-10",
    recommendedBy: "Frau Wagner",
  },
  {
    nis: "20240105",
    studentName: "Kevin Sanjaya",
    level: "B1",
    averageScore: 79.4,
    recommendation: "Belum Siap",
    recommendedAt: "2026-01-09",
    recommendedBy: "Herr Schmidt",
  },
  {
    nis: "20240106",
    studentName: "Nadia Utami",
    level: "B2",
    averageScore: 84.3,
    recommendation: "Siap Ujian",
    recommendedAt: "2026-01-08",
    recommendedBy: "Frau Müller",
  },
  {
    nis: "20240107",
    studentName: "Rian Hidayat",
    level: "A2",
    averageScore: 82.1,
    recommendation: "Siap Ujian",
    recommendedAt: "2026-01-08",
    recommendedBy: "Frau Wagner",
  },
  {
    nis: "20240108",
    studentName: "Siti Rahma",
    level: "B1",
    averageScore: 72.5,
    recommendation: "Belum Siap",
    recommendedAt: "2026-01-07",
    recommendedBy: "Frau Müller",
  },
]

export const REGISTRATION_STATUSES = ["Pendaftaran Dibuka", "Pendaftaran Ditutup"] as const
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const REGISTRATION_BADGE: Readonly<Record<RegistrationStatus, string>> = {
  "Pendaftaran Dibuka": "badge-beres",
  "Pendaftaran Ditutup": "badge-tindakan",
}

export type ExamSchedule = {
  readonly id: string
  readonly name: string
  readonly level: Level
  readonly date: string
  readonly location: string
  readonly registered: number
  readonly capacity: number
  readonly status: RegistrationStatus
}

export const SCHEDULES: readonly ExamSchedule[] = [
  {
    id: "goethe-b1",
    level: "B1",
    name: "Goethe B1",
    date: "2026-02-24",
    location: "Pusat Jakarta",
    registered: 28,
    capacity: 30,
    status: "Pendaftaran Dibuka",
  },
  {
    id: "goethe-b2",
    level: "B2",
    name: "Goethe B2",
    date: "2026-03-10",
    location: "Bandung Branch",
    registered: 15,
    capacity: 15,
    status: "Pendaftaran Ditutup",
  },
  {
    id: "ecl-b1",
    level: "B1",
    name: "ECL B1",
    date: "2026-03-18",
    location: "Yogyakarta",
    registered: 8,
    capacity: 20,
    status: "Pendaftaran Dibuka",
  },
  {
    id: "testdaf-c1",
    level: "C1",
    name: "TestDaF C1",
    date: "2026-04-05",
    location: "Pusat Jakarta",
    registered: 4,
    capacity: 10,
    status: "Pendaftaran Dibuka",
  },
]

export const PAYMENT_STATUSES = ["Lunas", "Sebagian", "Belum Bayar"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_BADGE: Readonly<Record<PaymentStatus, string>> = {
  Lunas: "badge-beres",
  Sebagian: "badge-berjalan",
  "Belum Bayar": "badge-tindakan",
}

export type Registrant = {
  readonly nis: string
  readonly studentName: string
  readonly program: string
  readonly registeredAt: string
  readonly payment: PaymentStatus
}

export const REGISTRANTS_BY_SCHEDULE: Readonly<Record<string, readonly Registrant[]>> = {
  "goethe-b1": [
    {
      nis: "20240101",
      studentName: "Aditya Pratama",
      program: "Ausbildung 36",
      registeredAt: "2026-01-15",
      payment: "Lunas",
    },
    {
      nis: "20240102",
      studentName: "Clara Amalia",
      program: "Ausbildung 37",
      registeredAt: "2026-01-16",
      payment: "Lunas",
    },
    {
      nis: "20240104",
      studentName: "Grace Natalia",
      program: "General Worker",
      registeredAt: "2026-01-18",
      payment: "Belum Bayar",
    },
    {
      nis: "20240106",
      studentName: "Nadia Utami",
      program: "Ausbildung 36",
      registeredAt: "2026-01-20",
      payment: "Lunas",
    },
    {
      nis: "20240107",
      studentName: "Rian Hidayat",
      program: "Au Pair",
      registeredAt: "2026-01-22",
      payment: "Sebagian",
    },
  ],
}

export const quotaLabel = (schedule: ExamSchedule) =>
  `${schedule.registered} / ${schedule.capacity} Terdaftar`

export const isFull = (schedule: ExamSchedule) => schedule.registered >= schedule.capacity

export type Consultant = {
  readonly name: string
  readonly branch: string
  readonly handled: number
  readonly signed: number
  readonly downPayment: number
  readonly active: number
  readonly leftOrOnLeave: number
}

export const CONSULTANTS: readonly Consultant[] = [
  {
    name: "Ratna Sari",
    branch: "Bandung",
    handled: 142,
    signed: 135,
    downPayment: 120,
    active: 112,
    leftOrOnLeave: 4,
  },
  {
    name: "Hendra Wijaya",
    branch: "Jakarta",
    handled: 98,
    signed: 89,
    downPayment: 80,
    active: 72,
    leftOrOnLeave: 2,
  },
  {
    name: "Andi Wijaya",
    branch: "Surabaya",
    handled: 120,
    signed: 110,
    downPayment: 105,
    active: 95,
    leftOrOnLeave: 5,
  },
  {
    name: "Siti Rahma",
    branch: "Medan",
    handled: 110,
    signed: 102,
    downPayment: 98,
    active: 90,
    leftOrOnLeave: 1,
  },
]

export type LeadSource = {
  readonly name: string
  readonly students: number
}

export const LEAD_SOURCES: readonly LeadSource[] = [
  { name: "Media Sosial", students: 212 },
  { name: "Rekomendasi Teman", students: 104 },
  { name: "Alumni", students: 71 },
  { name: "Referral", students: 47 },
  { name: "Kontak Langsung", students: 23 },
  { name: "Lainnya", students: 14 },
]

export type DemographyGroup = {
  readonly id: string
  readonly title: string
  readonly items: readonly { readonly label: string; readonly students: number }[]
}

export const DEMOGRAPHY: readonly DemographyGroup[] = [
  {
    id: "program",
    title: "Program Terfavorit",
    items: [
      { label: "Ausbildung 45", students: 182 },
      { label: "Ausbildung 44", students: 120 },
      { label: "Kursus Bahasa", students: 64 },
    ],
  },
  {
    id: "branch",
    title: "Asal Cabang",
    items: [
      { label: "Bandung", students: 240 },
      { label: "Jakarta", students: 180 },
      { label: "Surabaya", students: 98 },
      { label: "Medan", students: 45 },
    ],
  },
  {
    id: "education",
    title: "Pendidikan Terakhir",
    items: [
      { label: "SMK/SMA", students: 72 },
      { label: "D3/S1", students: 24 },
      { label: "Lainnya", students: 4 },
    ],
  },
]

export const COVERED_PERCENT = 39

export const PERIOD = "sepanjang 2026"

export type ConsultantTotals = {
  readonly handled: number
  readonly signed: number
  readonly downPayment: number
  readonly active: number
  readonly leftOrOnLeave: number
}

export function consultantTotals(rows: readonly Consultant[]): ConsultantTotals {
  return rows.reduce<ConsultantTotals>(
    (total, row) => ({
      handled: total.handled + row.handled,
      signed: total.signed + row.signed,
      downPayment: total.downPayment + row.downPayment,
      active: total.active + row.active,
      leftOrOnLeave: total.leftOrOnLeave + row.leftOrOnLeave,
    }),
    { handled: 0, signed: 0, downPayment: 0, active: 0, leftOrOnLeave: 0 },
  )
}

export const ratio = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100)

export const totalLeadStudents = (sources: readonly LeadSource[]): number =>
  sources.reduce((sum, source) => sum + source.students, 0)

export function leadShare(
  sources: readonly LeadSource[],
): readonly { readonly name: string; readonly students: number; readonly percent: number }[] {
  const total = totalLeadStudents(sources)
  return [...sources]
    .sort((a, b) => b.students - a.students)
    .map((source) => ({ ...source, percent: ratio(source.students, total) }))
}

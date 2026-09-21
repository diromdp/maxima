import {
  Award01Icon,
  Book01Icon,
  Building02Icon,
  Calendar03Icon,
  Certificate01Icon,
  Chart01Icon,
  ChartAnalysisIcon,
  Clock01Icon,
  ClipboardCheckIcon,
  Database01Icon,
  DocumentAttachmentIcon,
  FileTextIcon,
  Home01Icon,
  MonitorCheckIcon,
  Package01Icon,
  Passport01Icon,
  PrinterIcon,
  ReceiptDollarIcon,
  ShieldUserIcon,
  StudentIcon,
  Task01Icon,
  UserAdd01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type Access = "view" | "edit"

export type MenuGroup =
  "Kesiswaan" | "Akademik" | "Keuangan" | "Pemberkasan & Penempatan" | "Pengaturan"

export type StaffPage = {
  readonly id: string
  readonly label: string
  readonly href: string
  readonly group: MenuGroup | null
  readonly icon: IconSvgElement
  /** Punya rute dan izin, tapi tidak tampil di sidebar - dibuka dari halaman lain. */
  readonly hidden?: true
}

export const PAGES = [
  { id: "home", label: "Dashboard", href: "/staff/dashboard", group: null, icon: Home01Icon },
  {
    id: "students",
    label: "Siswa",
    href: "/staff/students",
    group: "Kesiswaan",
    icon: StudentIcon,
  },
  {
    // Dicabut dari sidebar atas permintaan pemilik repo 19 Sep 2026; alurnya
    // dibuka lewat tombol "+ Tambah Siswa" di halaman Siswa.
    id: "registrations",
    label: "Pendaftaran Siswa",
    href: "/staff/registrations",
    group: "Kesiswaan",
    icon: UserAdd01Icon,
    hidden: true,
  },
  {
    id: "leave",
    label: "Pengajuan Cuti",
    href: "/staff/leave",
    group: "Kesiswaan",
    icon: Calendar03Icon,
  },
  {
    id: "marketing-performance",
    label: "Performa Marketing",
    href: "/staff/marketing-performance",
    group: "Kesiswaan",
    icon: ChartAnalysisIcon,
  },
  {
    id: "classes",
    label: "Kelas & Jadwal",
    href: "/staff/classes",
    group: "Akademik",
    icon: Book01Icon,
  },
  {
    id: "class-sessions",
    label: "Sesi Kelas",
    href: "/staff/class-sessions",
    group: "Akademik",
    icon: ClipboardCheckIcon,
  },
  {
    id: "assessments",
    label: "Penilaian",
    href: "/staff/assessments",
    group: "Akademik",
    icon: Award01Icon,
  },
  {
    id: "certificate-exams",
    label: "Ujian & Sertifikat",
    href: "/staff/certificate-exams",
    group: "Akademik",
    icon: Certificate01Icon,
  },
  {
    id: "report-cards",
    label: "Raport",
    href: "/staff/report-cards",
    group: "Akademik",
    icon: FileTextIcon,
  },
  {
    id: "monitoring",
    label: "Monitoring",
    href: "/staff/monitoring",
    group: "Akademik",
    icon: MonitorCheckIcon,
  },
  {
    id: "packages-promos",
    label: "Master Paket & Promo",
    href: "/staff/packages-promos",
    group: "Keuangan",
    icon: Package01Icon,
  },
  {
    id: "payments",
    label: "Pembayaran",
    href: "/staff/payments",
    group: "Keuangan",
    icon: Wallet01Icon,
  },
  {
    id: "invoices",
    label: "Tagihan & Piutang",
    href: "/staff/invoices",
    group: "Keuangan",
    icon: ReceiptDollarIcon,
  },
  { id: "reports", label: "Laporan", href: "/staff/reports", group: "Keuangan", icon: Chart01Icon },
  {
    id: "documents",
    label: "Dokumen",
    href: "/staff/documents",
    group: "Pemberkasan & Penempatan",
    icon: DocumentAttachmentIcon,
  },
  {
    id: "services",
    label: "Layanan",
    href: "/staff/services",
    group: "Pemberkasan & Penempatan",
    icon: Task01Icon,
  },
  {
    id: "partners",
    label: "Partner",
    href: "/staff/partners",
    group: "Pemberkasan & Penempatan",
    icon: Building02Icon,
  },
  {
    id: "visa-placement",
    label: "Visa & Penempatan",
    href: "/staff/visa-placement",
    group: "Pemberkasan & Penempatan",
    icon: Passport01Icon,
  },
  // Pengaturan (Admin 20) - empat tab di PRD, dibuka sebagai empat butir menu
  // atas permintaan pemilik repo 19 Sep 2026. Satu izin `settings` untuk keempatnya.
  {
    id: "settings",
    label: "Pengguna & Hak Akses",
    href: "/staff/settings/users",
    group: "Pengaturan",
    icon: ShieldUserIcon,
  },
  {
    id: "settings-master-data",
    label: "Master Data",
    href: "/staff/settings/master-data",
    group: "Pengaturan",
    icon: Database01Icon,
  },
  {
    id: "settings-print-templates",
    label: "Template Cetak",
    href: "/staff/settings/print-templates",
    group: "Pengaturan",
    icon: PrinterIcon,
  },
  {
    id: "settings-activity-log",
    label: "Log Aktivitas",
    href: "/staff/settings/activity-log",
    group: "Pengaturan",
    icon: Clock01Icon,
  },
] as const satisfies readonly StaffPage[]

export type PageId = (typeof PAGES)[number]["id"]

export const ROLE_ACCESS: Readonly<Record<string, Readonly<Partial<Record<PageId, Access>>>>> = {
  Marketing: {
    home: "view",
    students: "view",
    registrations: "edit",
    documents: "view",
    services: "view",
  },
  "Kepala Marketing": {
    home: "view",
    students: "view",
    "marketing-performance": "view",
  },
  Pengajar: {
    home: "view",
    students: "view",
    classes: "view",
    "class-sessions": "edit",
    assessments: "edit",
    "report-cards": "view",
  },
  "Kepala Pengajar": {
    home: "view",
    students: "view",
    leave: "view",
    classes: "edit",
    "class-sessions": "view",
    assessments: "view",
    "certificate-exams": "edit",
    "report-cards": "edit",
    monitoring: "view",
  },
  "Staf Finance": {
    home: "view",
    students: "view",
    leave: "edit",
    payments: "edit",
    invoices: "view",
    services: "view",
  },
  "Manajer Finance": {
    home: "view",
    students: "view",
    leave: "edit",
    "packages-promos": "edit",
    payments: "edit",
    invoices: "view",
    reports: "view",
    services: "view",
  },
  Admission: {
    home: "view",
    students: "edit",
    registrations: "edit",
    leave: "edit",
    "marketing-performance": "view",
    classes: "edit",
    "class-sessions": "edit",
    assessments: "edit",
    "certificate-exams": "edit",
    "report-cards": "edit",
    monitoring: "view",
    "packages-promos": "edit",
    payments: "edit",
    invoices: "view",
    reports: "view",
    documents: "edit",
    services: "edit",
    partners: "edit",
    "visa-placement": "edit",
    settings: "edit",
    "settings-master-data": "edit",
    "settings-print-templates": "edit",
    "settings-activity-log": "view",
  },
}

export const accessFor = (role: string, page: PageId): Access | undefined =>
  ROLE_ACCESS[role]?.[page]

export const canView = (role: string, page: PageId): boolean => accessFor(role, page) !== undefined

export const canEdit = (role: string, page: PageId): boolean => accessFor(role, page) === "edit"

export type MenuItem = {
  readonly label: string
  readonly href: string
  readonly icon: IconSvgElement
}

export type MenuSection = {
  readonly group: MenuGroup | null
  readonly items: ReadonlyArray<MenuItem>
}

export function menuFor(role: string): MenuSection[] {
  const sections: MenuSection[] = []

  for (const page of PAGES as readonly StaffPage[]) {
    if (page.hidden || !canView(role, page.id as PageId)) continue

    const item = { label: page.label, href: page.href, icon: page.icon }
    const last = sections.at(-1)

    if (last && last.group === page.group && page.group !== null) {
      sections[sections.length - 1] = { group: page.group, items: [...last.items, item] }
    } else {
      sections.push({ group: page.group, items: [item] })
    }
  }

  return sections.map((s) => (s.items.length === 1 ? { group: null, items: s.items } : s))
}

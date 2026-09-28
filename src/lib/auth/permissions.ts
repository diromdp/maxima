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

export type Permissions = Readonly<Partial<Record<string, Access>>>

export const canView = (permissions: Permissions, page: PageId): boolean =>
  permissions[page] !== undefined

export const canEdit = (permissions: Permissions, page: PageId): boolean =>
  permissions[page] === "edit"

export type MenuItem = {
  readonly label: string
  readonly href: string
  readonly icon: IconSvgElement
  readonly lockReason?: string
}

export type MenuSection = {
  readonly group: MenuGroup | null
  readonly items: ReadonlyArray<MenuItem>
}

export function menuFor(permissions: Permissions): MenuSection[] {
  const sections: MenuSection[] = []

  for (const page of PAGES as readonly StaffPage[]) {
    if (page.hidden || !canView(permissions, page.id as PageId)) continue

    const item = { label: page.label, href: page.href, icon: page.icon }
    const last = sections.at(-1)

    if (last && last.group === page.group && page.group !== null) {
      sections[sections.length - 1] = { group: page.group, items: [...last.items, item] }
    } else {
      sections.push({ group: page.group, items: [item] })
    }
  }

  return sections
}

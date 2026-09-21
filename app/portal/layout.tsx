import {
  Briefcase01Icon,
  Calendar03Icon,
  Certificate02Icon,
  DashboardSquare01Icon,
  DocumentAttachmentIcon,
  GraduationCapIcon,
  Route01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { redirect } from "next/navigation"

import { AppShell } from "@/src/components/layout/AppShell"
import type { MenuSection } from "@/src/lib/auth/permissions"
import { getSessionOrBypass, STUDENT_LOGIN } from "@/src/lib/auth/session"

const PORTAL_MENU: readonly MenuSection[] = [
  {
    group: null,
    items: [
      { label: "Dashboard", href: "/portal/dashboard", icon: DashboardSquare01Icon },
      { label: "Pembayaran", href: "/portal/payments", icon: Wallet01Icon },
      { label: "Progres Administrasi", href: "/portal/admin-progress", icon: Route01Icon },
      { label: "Pembelajaran", href: "/portal/learning", icon: GraduationCapIcon },
      {
        label: "Sertifikat Bahasa",
        href: "/portal/language-certificates",
        icon: Certificate02Icon,
      },
      { label: "Dokumen Saya", href: "/portal/documents", icon: DocumentAttachmentIcon },
      { label: "Pemberkasan Alumni", href: "/portal/alumni-files", icon: Briefcase01Icon },
      { label: "Cuti", href: "/portal/leave", icon: Calendar03Icon },
    ],
  },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrBypass("student")
  if (!session) redirect(STUDENT_LOGIN)
  if (session.kind !== "student") redirect("/staff/dashboard")

  return (
    <AppShell session={session} sections={PORTAL_MENU}>
      {children}
    </AppShell>
  )
}

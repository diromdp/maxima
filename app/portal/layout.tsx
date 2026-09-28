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
import type { IconSvgElement } from "@hugeicons/react"

import { AppShell } from "@/src/components/layout/AppShell"
import type { MenuSection } from "@/src/lib/auth/permissions"
import { requireSession, type PortalPageCode } from "@/src/lib/auth/session"

const PORTAL_MENU: readonly {
  code: PortalPageCode
  label: string
  href: string
  icon: IconSvgElement
}[] = [
  { code: "dashboard", label: "Dashboard", href: "/portal/dashboard", icon: DashboardSquare01Icon },
  { code: "payments", label: "Pembayaran", href: "/portal/payments", icon: Wallet01Icon },
  {
    code: "progress",
    label: "Progres Administrasi",
    href: "/portal/admin-progress",
    icon: Route01Icon,
  },
  { code: "learning", label: "Pembelajaran", href: "/portal/learning", icon: GraduationCapIcon },
  {
    code: "certificates",
    label: "Sertifikat Bahasa",
    href: "/portal/language-certificates",
    icon: Certificate02Icon,
  },
  {
    code: "documents",
    label: "Dokumen Saya",
    href: "/portal/documents",
    icon: DocumentAttachmentIcon,
  },
  {
    code: "alumni",
    label: "Pemberkasan Alumni",
    href: "/portal/alumni-files",
    icon: Briefcase01Icon,
  },
  { code: "leave", label: "Cuti", href: "/portal/leave", icon: Calendar03Icon },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("student")
  const sections: MenuSection[] = [
    {
      group: null,
      items: PORTAL_MENU.flatMap(({ code, ...item }) => {
        const page = session.pages.find((entry) => entry.code === code)
        if (page && !page.isVisible) return []
        return [page?.lockReason ? { ...item, lockReason: page.lockReason } : item]
      }),
    },
  ]

  return (
    <AppShell session={session} sections={sections}>
      {children}
    </AppShell>
  )
}

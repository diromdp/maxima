import { AppShell } from "@/src/components/layout/AppShell"
import { menuFor } from "@/src/lib/auth/permissions"
import { requireSession } from "@/src/lib/auth/session"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("staff")

  return (
    <AppShell session={session} sections={menuFor(session.permissions)}>
      {children}
    </AppShell>
  )
}

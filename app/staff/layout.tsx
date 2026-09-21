import { redirect } from "next/navigation"

import { AppShell } from "@/src/components/layout/AppShell"
import { menuFor } from "@/src/lib/auth/permissions"
import { getSessionOrBypass, STAFF_LOGIN } from "@/src/lib/auth/session"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrBypass("staff")
  if (!session) redirect(STAFF_LOGIN)
  if (session.kind !== "staff") redirect("/portal/dashboard")

  return (
    <AppShell session={session} sections={menuFor(session.role)}>
      {children}
    </AppShell>
  )
}

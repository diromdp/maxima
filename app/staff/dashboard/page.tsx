import { PageHeader } from "@/src/components/layout/PageHeader"
import { homeQuery } from "@/src/entities/home/queries"
import { yearlyReportQuery } from "@/src/entities/report/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canView, PAGES } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { formatDateLong } from "@/src/lib/format"

import { FinanceBalance } from "./FinanceBalance"
import { windowYears } from "./finance-window"
import { HomeSections } from "./HomeSections"

const INVOICES_HREF = PAGES.find((page) => page.id === "invoices")!.href

function greeting(now: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat("id-ID", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).format(now),
  )
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

export default async function HomePage() {
  const session = await requirePermission("home")
  const now = new Date()
  const showFinance = canView(session.permissions, "reports")
  const financeReads = showFinance ? windowYears(now).map(yearlyReportQuery) : []

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dashboard"
        badge={session.role ? <span className="badge">{session.role}</span> : undefined}
        subtitle={`${greeting(now)}, ${session.name}. ${formatDateLong(now)}. Ini yang menunggu Anda hari ini.`}
      />

      <Prefetched reads={[homeQuery(), ...financeReads]}>
        {showFinance && <FinanceBalance invoicesHref={INVOICES_HREF} />}
        <HomeSections />
      </Prefetched>
    </div>
  )
}

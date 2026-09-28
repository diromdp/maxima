import { PageHeader } from "@/src/components/layout/PageHeader"
import { marketingPerformanceQuery } from "@/src/entities/home/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { MarketingBoard } from "./MarketingBoard"

export default async function MarketingPerformancePage() {
  await requirePermission("marketing-performance")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Performa Marketing"
        subtitle="Analisis penjualan dan produktivitas konsultan."
      />

      <Prefetched reads={[marketingPerformanceQuery()]}>
        <MarketingBoard />
      </Prefetched>
    </div>
  )
}

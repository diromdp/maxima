import { Notice } from "@/src/components/ui/Notice"
import type { LeaveDetail } from "@/src/entities/leave/schema"
import { formatDateTime } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { SpecList } from "./SpecList"

export function PaymentConfirmed({ leave }: { leave: LeaveDetail }) {
  const { verifiedAt, amountIdr } = leave.finance

  return (
    <section className="card stack">
      <CardHeader title="Pembayaran Terkonfirmasi" />

      <SpecList
        items={[
          {
            name: "Status Keuangan",
            value:
              amountIdr === null
                ? "Pembayaran sudah mencukupi, tanpa setoran tambahan"
                : "Pembayaran Diverifikasi",
          },
          { name: "Diverifikasi pada", value: verifiedAt ? formatDateTime(verifiedAt) : "-" },
        ]}
      />

      <Notice tone="info">
        Finance meneruskan pengajuan ke tahap persetujuan cuti. Anda akan menerima keputusan dan
        rincian jadwal kembali.
      </Notice>
    </section>
  )
}

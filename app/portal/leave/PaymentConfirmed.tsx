import { formatDateTime } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import { CardHeader } from "./CardHeader"
import { SpecList } from "./SpecList"

export function PaymentConfirmed({ verifiedAt }: { verifiedAt: string }) {
  return (
    <section className="card stack">
      <CardHeader title="Pembayaran Terkonfirmasi" />

      <SpecList
        items={[
          { name: "Status Keuangan", value: "Pembayaran Diverifikasi" },
          { name: "Diverifikasi pada", value: formatDateTime(verifiedAt) },
        ]}
      />

      <Notice tone="info">
        Berikutnya Finance menyelesaikan verifikasi persetujuan cuti. Anda akan menerima keputusan
        dan rincian jadwal kembali.
      </Notice>
    </section>
  )
}

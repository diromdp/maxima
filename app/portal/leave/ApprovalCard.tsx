import { formatDateLong } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import { CardHeader } from "./CardHeader"
import { durationLabel, periodLabel, type LeaveApplication } from "./leave"
import { SpecList } from "./SpecList"

export function ApprovalCard({ application }: { application: LeaveApplication }) {
  return (
    <section className="card stack">
      <CardHeader title="Rincian Cuti Disetujui" />

      <SpecList
        items={[
          { name: "Tanggal Cuti", value: periodLabel(application) },
          { name: "Durasi", value: durationLabel(application) },
          { name: "Posisi kelas dijeda", value: application.position },
          {
            name: "Rencana Masuk Kelas",
            value: application.returnDate
              ? formatDateLong(application.returnDate)
              : "Belum ditetapkan",
          },
        ]}
      />

      <Notice tone="success">
        Kelas dan level Anda dijeda selama cuti. Tim akan menghubungi Anda 14 hari sebelum tanggal
        kembali untuk konfirmasi penempatan.
      </Notice>
    </section>
  )
}

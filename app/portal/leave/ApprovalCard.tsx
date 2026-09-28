import { Notice } from "@/src/components/ui/Notice"
import { type LeaveDetail, leaveMonths, positionLabel } from "@/src/entities/leave/schema"
import { formatDateLong } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { isWithdrawn } from "./leave"
import { SpecList } from "./SpecList"

function ApprovalNotice({ leave }: { leave: LeaveDetail }) {
  if (isWithdrawn(leave)) {
    return (
      <Notice tone="danger">
        Tanggal masuk kembali {formatDateLong(leave.returnsOn)} terlewat, jadi Anda keluar dari
        manajemen Maxima. Hubungi Admission cabang Anda bila ingin kembali sebagai siswa baru.
      </Notice>
    )
  }
  if (leave.state === "completed") {
    return (
      <Notice tone="success">
        Anda sudah kembali ke kelas pada {formatDateLong(leave.returnedOn ?? leave.returnsOn)}
        {leave.returnClass ? ` di kelas ${leave.returnClass.name}` : ""}.
      </Notice>
    )
  }
  if (leave.state === "on-leave") {
    return (
      <Notice tone="info">
        Anda sedang cuti sampai {formatDateLong(leave.returnsOn)}. Tim akan menghubungi Anda 14 hari
        sebelum tanggal kembali untuk konfirmasi penempatan.
      </Notice>
    )
  }
  return (
    <Notice tone="success">
      Status Anda berubah menjadi Cuti pada {formatDateLong(leave.startsOn)}; sampai tanggal itu
      Anda tetap belajar di kelas. Tim akan menghubungi Anda 14 hari sebelum tanggal kembali untuk
      konfirmasi penempatan.
    </Notice>
  )
}

export function ApprovalCard({ leave }: { leave: LeaveDetail }) {
  return (
    <section className="card stack">
      <CardHeader title="Rincian Cuti Disetujui" />

      <SpecList
        items={[
          {
            name: "Tanggal Cuti",
            value: `${formatDateLong(leave.startsOn)} - ${formatDateLong(leave.returnsOn)}`,
          },
          { name: "Durasi", value: `${leaveMonths(leave.startsOn, leave.returnsOn)} bulan` },
          {
            name: "Posisi saat cuti",
            value: positionLabel(leave.frozenPosition ?? leave.position),
          },
          { name: "Rencana Masuk Kelas", value: formatDateLong(leave.returnsOn) },
        ]}
      />

      <ApprovalNotice leave={leave} />
    </section>
  )
}

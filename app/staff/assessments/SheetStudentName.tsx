import type { MemberStatus } from "@/src/entities/class/schema"
import type { SheetStudent } from "@/src/entities/assessment/schema"
import { formatDate } from "@/src/lib/format"

const FORMER_BADGE: Readonly<Record<Exclude<MemberStatus, "Aktif">, string>> = {
  Cuti: "badge-berjalan",
  Keluar: "badge-tindakan",
}

export function SheetStudentName({ student }: { student: SheetStudent }) {
  const { status, leftOn } = student.membership
  const name =
    status === "Aktif" ? (
      student.name
    ) : (
      <span className="row row-wrap" style={{ gap: 6 }}>
        {student.name}
        <span
          className={`badge ${FORMER_BADGE[status]}`}
          title="Sudah tidak di kelas ini. Nilainya di periode ini hanya dapat dibaca."
        >
          {leftOn ? `${status} ${formatDate(leftOn)}` : status}
        </span>
      </span>
    )
  return (
    <span className="stack" style={{ gap: 0 }}>
      {name}
      <span className="caption text-muted tabular" style={{ fontWeight: 400 }}>
        {student.nis ?? "-"}
      </span>
    </span>
  )
}

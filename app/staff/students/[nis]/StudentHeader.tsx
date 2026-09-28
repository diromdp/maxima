"use client"

import { Avatar } from "@mantine/core"
import { useState } from "react"

import { STATUS_BADGE, stageLabel, type StudentDetail } from "@/src/entities/student/schema"
import { formatMonthYear } from "@/src/lib/format"

import { ActiveLetterModal } from "./ActiveLetterModal"
import { ChangeStatusModal } from "./ChangeStatusModal"

const DASH = "-"

export function StudentHeader({ student, canEdit }: { student: StudentDetail; canEdit: boolean }) {
  const [openDialog, setOpenDialog] = useState<"status" | "letter" | null>(null)
  const close = () => setOpenDialog(null)

  return (
    <section className="card row row-between row-wrap" style={{ gap: 16 }}>
      <div className="row" style={{ gap: 16, minWidth: 0 }}>
        <Avatar radius="md" size={64} color="dark" variant="light">
          {student.name.charAt(0)}
        </Avatar>
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          <h1 className="h4">{student.name}</h1>
          <span className="caption text-muted tabular">
            NIS {student.nis} · Kontrak {student.contractNumber ?? DASH}
          </span>
          <div className="row row-wrap" style={{ gap: 6 }}>
            <span className={`badge ${STATUS_BADGE[student.status]}`}>{student.status}</span>
            {student.stage && <span className="badge">{stageLabel(student.stage)}</span>}
            {student.package && <span className="badge">{student.package.name}</span>}
          </div>
        </div>
      </div>

      <div className="row row-wrap" style={{ gap: 24 }}>
        <Meta label="Cabang" value={student.branch.name} />
        <Meta label="PIC Konsultan" value={student.pic?.name ?? DASH} />
        <Meta label="Masuk" value={formatMonthYear(student.enrolledAt)} isTabular />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setOpenDialog("letter")}
          >
            Cetak Surat Keterangan
          </button>
          {canEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setOpenDialog("status")}
            >
              Ubah Status
            </button>
          )}
        </div>
      </div>

      {openDialog === "status" && <ChangeStatusModal student={student} onClose={close} />}
      {openDialog === "letter" && <ActiveLetterModal student={student} onClose={close} />}
    </section>
  )
}

function Meta({ label, value, isTabular }: { label: string; value: string; isTabular?: boolean }) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <span className="caption text-muted">{label}</span>
      <span className={`body-sm${isTabular ? " tabular" : ""}`} style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}

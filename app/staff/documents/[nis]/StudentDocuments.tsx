"use client"

import { modals } from "@mantine/modals"
import { useState } from "react"

import { notify } from "@/src/lib/notify"

import { CompletenessScheme, type FileAction } from "../CompletenessScheme"
import { RejectModal, type RejectTarget } from "../RejectModal"
import { type DocumentStudent, GROUPS, updateFile, waitingCount } from "../sample"

export function StudentDocuments({
  initial,
  readOnly,
}: {
  initial: DocumentStudent
  readOnly: boolean
}) {
  const [student, setStudent] = useState(initial)
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null)
  const waiting = waitingCount(student)

  const verify = (action: FileAction) =>
    modals.openConfirmModal({
      title: `Verifikasi ${action.fileName}?`,
      children: `Berkas ${action.fileName} milik ${student.name} ditandai Lengkap dan ikut menghitung kelengkapan rumpunnya. Siswa melihatnya sebagai Terverifikasi.`,
      labels: { confirm: "Verifikasi", cancel: "Batal" },
      onConfirm: () => {
        setStudent((current) =>
          updateFile(current, action, { status: "Lengkap", reason: undefined }),
        )
        notify.success(`${action.fileName} milik ${student.name} terverifikasi.`)
      },
    })

  const openReject = (action: FileAction) => {
    const file = student.files[action.groupId].find(
      (candidate) => candidate.name === action.fileName,
    )
    setRejectTarget({ ...action, studentName: student.name, uploadedName: file?.fileName })
  }

  const remind = (action: FileAction) =>
    notify.info(`Pengingat unggah ${action.fileName} dikirim ke email ${student.name}.`)

  const totals = GROUPS.map((group) => student.files[group.id]).flat()
  const done = totals.filter((file) => file.status === "Lengkap").length

  return (
    <div className="stack stack-lg">
      <section className="card">
        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            { label: "NIS", value: student.nis },
            { label: "Paket", value: student.packageName },
            { label: "Cabang", value: student.branch },
            { label: "Program", value: student.program },
            { label: "Berkas lengkap", value: `${done} dari ${totals.length}` },
            {
              label: "Menunggu verifikasi",
              value: waiting > 0 ? `${waiting} berkas` : "Tidak ada",
            },
          ].map(({ label, value }) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <CompletenessScheme
        student={student}
        readOnly={readOnly}
        onVerify={verify}
        onReject={openReject}
        onRemind={remind}
      />

      <RejectModal
        key={rejectTarget ? `${rejectTarget.nis}-${rejectTarget.fileName}` : "closed"}
        target={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onReject={(target, reason) => {
          setStudent((current) =>
            updateFile(
              current,
              { nis: target.nis, groupId: target.groupId, fileName: target.fileName },
              { status: "Ditolak", reason },
            ),
          )
          notify.success(`${target.fileName} ditolak. Alasan tampil di portal ${student.name}.`)
        }}
      />
    </div>
  )
}

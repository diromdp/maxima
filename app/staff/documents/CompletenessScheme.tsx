"use client"

import Link from "next/link"

import { formatDate } from "@/src/lib/format"

import {
  completeness,
  type DocumentStudent,
  FILE_STATUS_BADGE,
  type FileAction,
  type GroupId,
  GROUPS,
  isGroupLocked,
  type StudentFile,
} from "./sample"

export type { FileAction }

export function CompletenessScheme({
  student,
  readOnly,
  onVerify,
  onReject,
  onRemind,
}: {
  student: DocumentStudent
  readOnly: boolean
  onVerify: (action: FileAction) => void
  onReject: (action: FileAction) => void
  onRemind: (action: FileAction) => void
}) {
  const viewButton = (
    <button type="button" className="btn btn-ghost btn-sm">
      Lihat
    </button>
  )

  const renderActions = (groupId: GroupId, file: StudentFile) => {
    const action = { nis: student.nis, groupId, fileName: file.name }
    const group = GROUPS.find((candidate) => candidate.id === groupId)
    if (isGroupLocked(student, groupId)) {
      return <span className="caption text-muted">Terbuka setelah Dapat Vertrag</span>
    }
    if (group?.source === "service") {
      return file.status === "Lengkap" ? (
        viewButton
      ) : (
        <Link href="/staff/services" className="caption link">
          Dikerjakan di Layanan
        </Link>
      )
    }
    if (readOnly) return file.fileName ? viewButton : null
    switch (file.status) {
      case "Perlu Verifikasi":
        return (
          <>
            {viewButton}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onVerify(action)}
            >
              Verifikasi
            </button>
            <button type="button" className="btn btn-error btn-sm" onClick={() => onReject(action)}>
              Tolak
            </button>
          </>
        )
      case "Lengkap":
        return viewButton
      case "Belum Diunggah":
      case "Ditolak":
        return (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onRemind(action)}
          >
            Ingatkan
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      {GROUPS.map((group) => {
        const locked = isGroupLocked(student, group.id)
        const { done, total } = completeness(student, group.id)
        return (
          <section key={group.id} className="card stack">
            <div className="row row-between" style={{ alignItems: "flex-start", gap: 8 }}>
              <h3 className="h6">{group.title}</h3>
              <span
                className={`badge tabular ${locked ? "badge-terkunci" : done === total ? "badge-beres" : done === 0 ? "badge-tindakan" : "badge-berjalan"}`}
              >
                {locked ? "Terkunci" : `${done}/${total}`}
              </span>
            </div>

            {group.source === "service" && (
              <span className="caption text-muted">
                Diproduksi Maxima di halaman Layanan; siswa hanya mengunduh.
              </span>
            )}
            {group.id === "dari-betrieb" && !locked && (
              <span className="caption text-danger">Satu-satunya tempat berkas Betrieb masuk.</span>
            )}

            {locked && (
              <span className="caption text-muted">
                Tersedia setelah siswa berstatus Dapat Vertrag dari partner. Daftar di bawah
                mengikuti permintaan perusahaan dan belum bisa diisi.
              </span>
            )}
            <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {student.files[group.id].map((file) => (
                <li key={file.name} className="stack" style={{ gap: 6, paddingBlock: 10 }}>
                  <div className="row row-between" style={{ gap: 8, alignItems: "flex-start" }}>
                    <span className="stack min-w-0" style={{ gap: 0 }}>
                      <span className="body-sm break-words">{file.name}</span>
                      {file.uploadedAt && (
                        <span className="caption text-muted">
                          {file.fileName} · {formatDate(file.uploadedAt)}
                        </span>
                      )}
                      {file.status === "Ditolak" && file.reason && (
                        <span className="caption text-danger">{file.reason}</span>
                      )}
                    </span>
                    <span
                      className={`badge shrink-0 whitespace-nowrap ${FILE_STATUS_BADGE[file.status]}`}
                    >
                      {file.status}
                    </span>
                  </div>
                  <div className="row row-wrap" style={{ gap: 4 }}>
                    {renderActions(group.id, file)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

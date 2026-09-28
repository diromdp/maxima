"use client"

import { ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { studentDocumentsQuery } from "@/src/entities/student/queries"
import type { DocumentState, StudentDocuments } from "@/src/entities/student/schema"
import { openStoredObject } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { Panel, TabBody } from "./Panel"

type DocumentGroup = StudentDocuments["groups"][number]

const GROUP_TITLES: Readonly<Record<DocumentGroup["group"], string>> = {
  Pribadi: "Dokumen Pribadi",
  "Hasil Layanan": "Hasil Layanan",
  Bewerbung: "Bewerbung",
  "Dari Betrieb": "Dokumen dari Betrieb",
}

const STATE_BADGE: Readonly<Record<DocumentState, string>> = {
  Lengkap: "badge-beres",
  "Perlu Verifikasi": "badge-berjalan",
  Diproses: "badge-berjalan",
  Ditolak: "badge-tindakan",
  "Belum Diunggah": "badge-terkunci",
}

async function viewDocument(key: string) {
  try {
    await openStoredObject(key)
  } catch (error) {
    if (error instanceof ApiError) notify.error(error.message)
    else throw error
  }
}

function completenessBadge(group: DocumentGroup) {
  const tone =
    group.complete === group.total
      ? "badge-beres"
      : group.complete === 0
        ? "badge-tindakan"
        : "badge-berjalan"
  return (
    <span className={`badge ${tone} tabular`}>
      {group.complete}/{group.total} Lengkap
    </span>
  )
}

function DocumentsView({ documents }: { documents: StudentDocuments }) {
  return (
    <div className="grid-2">
      {documents.groups.map((group) => (
        <Panel key={group.group} title={GROUP_TITLES[group.group]} aside={completenessBadge(group)}>
          <div className="list-rows">
            {group.items.map((item) => (
              <div key={item.code ?? item.name} className="row row-between">
                <div className="stack" style={{ gap: 0, minWidth: 0 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {item.name}
                    {item.isOptional && <span className="caption text-muted"> (opsional)</span>}
                  </span>
                  {item.uploadedAt && (
                    <span className="caption text-muted">
                      {item.originalName ?? "Berkas"} · {formatDate(item.uploadedAt)}
                    </span>
                  )}
                </div>
                <div className="row" style={{ gap: 4, flexShrink: 0 }}>
                  <span className={`badge ${STATE_BADGE[item.state]}`}>{item.state}</span>
                  {item.objectKey && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      aria-label={`Lihat ${item.name}`}
                      onClick={() => void viewDocument(item.objectKey ?? "")}
                    >
                      <HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  )
}

export function DocumentsTab({ nis }: { nis: string }) {
  const documents = useRead(studentDocumentsQuery(nis))
  return <TabBody query={documents}>{(data) => <DocumentsView documents={data} />}</TabBody>
}

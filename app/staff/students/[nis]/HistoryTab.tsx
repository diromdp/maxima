"use client"

import { studentHistoryQuery } from "@/src/entities/student/queries"
import type { StudentHistory } from "@/src/entities/student/schema"
import { openPresigned } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate, formatDateTime } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { EmptyText, Panel, TabBody } from "./Panel"

const DASH = "-"

async function downloadEvidence(nis: string, id: string) {
  try {
    await openPresigned(`/students/${encodeURIComponent(nis)}/status-changes/${id}/evidence`)
  } catch (error) {
    if (error instanceof ApiError) notify.error(error.message)
    else throw error
  }
}

function HistoryView({ nis, history }: { nis: string; history: StudentHistory }) {
  return (
    <div className="grid-main-aside">
      <Panel title="Log Aktivitas Terkait">
        {history.activities.length === 0 ? (
          <EmptyText>Belum ada aktivitas tercatat.</EmptyText>
        ) : (
          <div className="list-rows">
            {history.activities.map((entry, index) => (
              <div
                key={`${entry.at}-${index}`}
                className="row row-between"
                style={{ alignItems: "flex-start" }}
              >
                <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {entry.action}
                  </span>
                  <span className="caption text-muted tabular">{formatDateTime(entry.at)}</span>
                </div>
                <span className="caption text-muted" style={{ flexShrink: 0, textAlign: "right" }}>
                  Oleh: {entry.actor ?? "Sistem"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Riwayat Perubahan Status">
        {history.statusChanges.length === 0 ? (
          <EmptyText>Status siswa belum pernah diubah.</EmptyText>
        ) : (
          <div className="stack stack-sm">
            {history.statusChanges.map((change) => (
              <div key={change.id} className="card-soft stack" style={{ gap: 4 }}>
                <div className="row row-between">
                  <span className="caption text-muted tabular">
                    Berlaku {formatDate(change.effectiveAt)}
                  </span>
                  <span className="caption text-muted">Oleh: {change.changedBy ?? "Sistem"}</span>
                </div>
                <span className="body-sm" style={{ fontWeight: 600 }}>
                  {change.fromStatus ?? DASH} → {change.toStatus}
                </span>
                {change.reason && (
                  <span className="caption text-muted">Alasan: {change.reason}</span>
                )}
                {change.hasEvidence && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => void downloadEvidence(nis, change.id)}
                  >
                    Unduh berkas pendukung
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

export function HistoryTab({ nis }: { nis: string }) {
  const history = useRead(studentHistoryQuery(nis))
  return <TabBody query={history}>{(data) => <HistoryView nis={nis} history={data} />}</TabBody>
}

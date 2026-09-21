import { formatDate, formatDateTime } from "@/src/lib/format"

import { Panel } from "./Panel"
import { ACTIVITY_LOG, STATUS_HISTORY } from "./sample"

export function HistoryTab() {
  return (
    <div className="grid-main-aside">
      <Panel title="Log Aktivitas Terkait">
        <div className="list-rows">
          {ACTIVITY_LOG.map((entry) => (
            <div key={entry.id} className="row row-between" style={{ alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                <span className="body-sm" style={{ fontWeight: 600 }}>
                  {entry.text}
                </span>
                <span className="caption text-muted tabular">{formatDateTime(entry.at)}</span>
              </div>
              <span className="caption text-muted" style={{ flexShrink: 0, textAlign: "right" }}>
                Oleh: {entry.actor}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Riwayat Perubahan Status">
        <div className="stack stack-sm">
          {STATUS_HISTORY.map((change) => (
            <div key={change.id} className="card-soft stack" style={{ gap: 4 }}>
              <div className="row row-between">
                <span className="caption text-muted tabular">{formatDate(change.date)}</span>
                <span className="caption text-muted">Oleh: {change.actor}</span>
              </div>
              <span className="body-sm" style={{ fontWeight: 600 }}>
                {change.from} → {change.to}
              </span>
              <span className="caption text-muted">Alasan: {change.reason}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

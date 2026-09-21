import { SquareLock02Icon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Panel } from "./Panel"
import { DOCUMENT_GROUPS, type DocumentGroup } from "./sample"

function completenessBadge(group: DocumentGroup) {
  const done = group.rows.filter((r) => r.status === "Terverifikasi").length
  const total = group.rows.length
  const tone = done === total ? "badge-beres" : done === 0 ? "badge-tindakan" : "badge-berjalan"
  return (
    <span className={`badge ${tone} tabular`}>
      {done}/{total} Lengkap
    </span>
  )
}

export function DocumentsTab() {
  return (
    <div className="grid-2">
      {DOCUMENT_GROUPS.map((group) => (
        <Panel key={group.id} title={group.title} aside={completenessBadge(group)}>
          <div className="list-rows">
            {group.rows.map((row) => (
              <div key={row.name} className="row row-between">
                <div className="stack" style={{ gap: 0, minWidth: 0 }}>
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {row.name}
                  </span>
                  {row.file && <span className="caption text-muted">{row.file}</span>}
                </div>
                <div className="row" style={{ gap: 4, flexShrink: 0 }}>
                  <span
                    className={`badge ${row.status === "Terverifikasi" ? "badge-beres" : "badge-tindakan"}`}
                  >
                    {row.status}
                  </span>
                  {row.file && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      aria-label={`Lihat ${row.name}`}
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

      <section
        className="card-soft stack"
        style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8 }}
      >
        <HugeiconsIcon
          icon={SquareLock02Icon}
          size={24}
          strokeWidth={1.5}
          className="text-muted"
          aria-hidden
        />
        <h2 className="h6">Dokumen dari Betrieb</h2>
        <span className="body-sm text-muted">
          Tersedia setelah status kepesertaan Dapat Vertrag dari partner.
        </span>
      </section>
    </div>
  )
}

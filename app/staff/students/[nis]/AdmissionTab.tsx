import { formatDate } from "@/src/lib/format"

import { Panel } from "./Panel"
import {
  ADMISSION_NOTE,
  INTERVIEWS,
  PARTNER_APPLICATIONS,
  PARTNER_NOTE,
  SERVICES,
  type ServiceStatus,
} from "./sample"

const SERVICE_TONE: Readonly<Record<ServiceStatus, string>> = {
  Selesai: "text-success",
  Dikerjakan: "text-warning",
  Terbuka: "text-info",
  "Belum Terbuka": "text-muted",
}

const APPLICATION_TONE = {
  "Sedang Diproses": "badge-berjalan",
  Diterima: "badge-beres",
  Ditolak: "badge-tindakan",
} as const

function ServiceRow({ name, status }: { name: string; status: ServiceStatus }) {
  return (
    <div className="row row-between">
      <span className="body-sm">{name}</span>
      <span className={`label ${SERVICE_TONE[status]}`}>{status}</span>
    </div>
  )
}

export function AdmissionTab() {
  const activeCount = PARTNER_APPLICATIONS.filter((a) => a.status === "Sedang Diproses").length

  return (
    <div className="grid-main-aside">
      <div className="stack">
        <Panel title={`Progres Pengajuan Partner (${activeCount} aktif)`}>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Posisi</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {PARTNER_APPLICATIONS.map((a) => (
                  <tr key={`${a.partner}-${a.date}`}>
                    <td style={{ fontWeight: 600 }}>{a.partner}</td>
                    <td>{a.position}</td>
                    <td>
                      <span className={`badge ${APPLICATION_TONE[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="tabular">{formatDate(a.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Riwayat Latihan Wawancara (Interview)">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Posisi</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>PIC</th>
                </tr>
              </thead>
              <tbody>
                {INTERVIEWS.map((i) => (
                  <tr key={i.date}>
                    <td className="tabular">{formatDate(i.date)}</td>
                    <td>{i.position}</td>
                    <td>{i.trainer}</td>
                    <td>
                      <span
                        className={`badge ${i.status === "Lulus" ? "badge-beres" : "badge-tindakan"}`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td>{i.pic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid-2">
          <Panel title="Catatan Partner">
            <p className="body-sm text-muted">{PARTNER_NOTE}</p>
          </Panel>
          <Panel title="Catatan Admission">
            <p className="body-sm text-muted">{ADMISSION_NOTE}</p>
          </Panel>
        </div>
      </div>

      <div className="stack">
        <Panel title="Status Progres Layanan">
          <div className="list-rows">
            {SERVICES.map((s) =>
              s.steps ? (
                <details key={s.name}>
                  <summary
                    className="row row-between"
                    style={{ cursor: "pointer", listStyle: "none" }}
                  >
                    <span className="body-sm">{s.name}</span>
                    <span className={`label ${SERVICE_TONE[s.status]}`}>{s.status}</span>
                  </summary>
                  <div className="stack stack-sm" style={{ paddingTop: 8, paddingLeft: 16 }}>
                    {s.steps.map((step) => (
                      <ServiceRow key={step.name} name={step.name} status={step.status} />
                    ))}
                  </div>
                </details>
              ) : (
                <ServiceRow key={s.name} name={s.name} status={s.status} />
              ),
            )}
          </div>
        </Panel>

        <Panel title="Visa & Penempatan">
          <p className="body-sm text-muted">Belum ada data visa dan penempatan saat ini.</p>
        </Panel>
      </div>
    </div>
  )
}

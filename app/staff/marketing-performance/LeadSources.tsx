import { leadShare, LEAD_SOURCES, totalLeadStudents } from "./sample"

const TONE = ["success", "info", "warning", "neutral", "neutral", "neutral"] as const

export function LeadSources() {
  const rows = leadShare(LEAD_SOURCES)
  const total = totalLeadStudents(LEAD_SOURCES)

  return (
    <section className="card stack" aria-labelledby="lead-heading">
      <div className="stack" style={{ gap: 2 }}>
        <h2 className="h5" id="lead-heading">
          Distribusi Sumber Lead
        </h2>
        <span className="caption text-muted">
          Dari {total} siswa yang punya sumber lead. Pilihannya tetap, diatur di Master Data.
        </span>
      </div>

      <dl className="stack" style={{ margin: 0 }}>
        {rows.map((row, index) => (
          <div key={row.name} className="stack" style={{ gap: 4 }}>
            <div className="row row-between">
              <dt className="body-sm">{row.name}</dt>
              <dd className="row" style={{ margin: 0, gap: 8 }}>
                <span className="caption text-muted tabular">{row.students} siswa</span>
                <span className="body-sm tabular" style={{ fontWeight: 600 }}>
                  {row.percent}%
                </span>
              </dd>
            </div>
            <div
              className={`progress progress-${TONE[index] ?? "neutral"}`}
              role="img"
              aria-label={`${row.name} ${row.percent} persen`}
            >
              <div className="progress-fill" style={{ width: `${row.percent}%` }} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

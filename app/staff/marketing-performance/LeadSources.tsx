import type { MarketingPerformance } from "@/src/entities/home/schema"
import { formatPercent } from "@/src/lib/format"

const TONE = ["success", "info", "warning", "neutral", "neutral", "neutral"] as const

export function LeadSources({ sources }: { sources: MarketingPerformance["leadSources"] }) {
  const total = sources.reduce((sum, source) => sum + source.count, 0)

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

      {sources.length === 0 ? (
        <span className="body-sm text-muted">Belum ada pilihan sumber lead di Master Data.</span>
      ) : (
        <dl className="stack" style={{ margin: 0 }}>
          {sources.map((source, index) => {
            const percent = formatPercent(source.percent / 100)
            return (
              <div key={source.name} className="stack" style={{ gap: 4 }}>
                <div className="row row-between">
                  <dt className="body-sm">{source.name}</dt>
                  <dd className="row" style={{ margin: 0, gap: 8 }}>
                    <span className="caption text-muted tabular">{source.count} siswa</span>
                    <span className="body-sm tabular" style={{ fontWeight: 600 }}>
                      {percent}
                    </span>
                  </dd>
                </div>
                <div
                  className={`progress progress-${TONE[index] ?? "neutral"}`}
                  role="img"
                  aria-label={`${source.name} ${percent}`}
                >
                  <div className="progress-fill" style={{ width: `${source.percent}%` }} />
                </div>
              </div>
            )
          })}
        </dl>
      )}
    </section>
  )
}

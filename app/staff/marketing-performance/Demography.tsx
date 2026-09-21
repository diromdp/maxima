import { DEMOGRAPHY, ratio } from "./sample"

export function Demography() {
  return (
    <section className="card stack" aria-labelledby="demography-heading">
      <div className="stack" style={{ gap: 2 }}>
        <h2 className="h5" id="demography-heading">
          Ringkasan Program & Demografi
        </h2>
        <span className="caption text-muted">
          Segmentasi siswa aktif berdasarkan kategori profil.
        </span>
      </div>

      <div className="stack">
        {DEMOGRAPHY.map((group) => {
          const total = group.items.reduce((sum, item) => sum + item.students, 0)
          return (
            <div key={group.id} className="stack stack-sm">
              <span className="label text-muted">{group.title}</span>
              <div className="row row-wrap" style={{ gap: 8 }}>
                {group.items.map((item) => (
                  <span key={item.label} className="pill">
                    {item.label}
                    <span className="caption text-muted tabular">
                      {item.students} siswa · {ratio(item.students, total)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

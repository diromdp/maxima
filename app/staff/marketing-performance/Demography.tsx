import type { Tally } from "@/src/entities/home/schema"

export type DemographyGroup = {
  readonly title: string
  readonly items: readonly Tally[]
}

export function Demography({ groups }: { groups: readonly DemographyGroup[] }) {
  return (
    <section className="card stack" aria-labelledby="demography-heading">
      <div className="stack" style={{ gap: 2 }}>
        <h2 className="h5" id="demography-heading">
          Ringkasan Program & Demografi
        </h2>
        <span className="caption text-muted">
          Segmentasi siswa ber-NIS berdasarkan kategori profil.
        </span>
      </div>

      <div className="stack">
        {groups.map((group) => (
          <div key={group.title} className="stack stack-sm">
            <span className="label text-muted">{group.title}</span>
            {group.items.length === 0 ? (
              <span className="caption text-muted">Belum ada siswa.</span>
            ) : (
              <div className="row row-wrap" style={{ gap: 8 }}>
                {group.items.map((item) => (
                  <span key={item.name} className="pill">
                    {item.name}
                    <span className="caption text-muted tabular">{item.count} siswa</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

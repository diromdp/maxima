export function CardHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="section-head">
      <div className="row row-between row-wrap">
        <h2 className="h5">{title}</h2>
        {note && (
          <span className="caption text-muted" style={{ marginInlineStart: "auto" }}>
            {note}
          </span>
        )}
      </div>
    </div>
  )
}

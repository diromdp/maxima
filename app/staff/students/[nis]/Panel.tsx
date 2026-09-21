export function Panel({
  title,
  aside,
  className,
  children,
}: {
  title: string
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`card stack${className ? ` ${className}` : ""}`}>
      <div className="row row-between row-wrap">
        <h2 className="h6">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function FieldValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="stack" style={{ gap: 2, minWidth: 0 }}>
      <span className="caption text-muted">{label}</span>
      <span className="body-sm" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {value}
      </span>
    </div>
  )
}

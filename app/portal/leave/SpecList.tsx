export type Spec = {
  readonly name: string
  readonly value: React.ReactNode
  readonly danger?: boolean
}

export function SpecList({ items }: { items: readonly Spec[] }) {
  return (
    <dl className="stack" style={{ margin: 0 }}>
      {items.map(({ name, value, danger }) => (
        <div key={name} className="stack" style={{ gap: 2 }}>
          <dt className="spec-name">{name}</dt>
          <dd
            className={`body-sm${danger ? " text-tindakan" : ""}`}
            style={{ margin: 0, fontWeight: 600 }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

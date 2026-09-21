import { Skeleton } from "@mantine/core"

import { PARTNERS } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="14%" radius="xl" />
        <Skeleton height={16} width="44%" radius="xl" />
      </div>

      <div className="row" style={{ gap: 16 }} aria-hidden>
        <Skeleton height={36} width={130} radius="xl" />
        <Skeleton height={36} width={110} radius="xl" />
        <Skeleton height={36} width={160} radius="xl" />
        <Skeleton height={36} width={100} radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Skeleton height={36} width={240} radius="xl" />
          <Skeleton height={36} width={150} radius="xl" />
          <Skeleton height={36} width={200} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {PARTNERS.map((partner) => (
            <Skeleton key={partner.id} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}

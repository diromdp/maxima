import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="56%" radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <Skeleton height={20} width="70%" radius="xl" />
      </section>

      <div className="grid-2" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <section key={index} className="card stack">
            <Skeleton height={20} width="50%" radius="xl" />
            <div className="stack stack-sm">
              {Array.from({ length: 6 }, (_, row) => (
                <Skeleton key={row} height={36} radius="sm" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="55%" radius="xl" />
      </div>

      <Skeleton height={88} radius="md" aria-hidden />

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="grid-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((field) => (
            <Skeleton key={field} height={64} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}

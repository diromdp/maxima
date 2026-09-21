import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { canView, PAGES, type PageId } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { formatDateLong } from "@/src/lib/format"

import { FinanceBalance } from "./FinanceBalance"
import { PIPELINE, QUEUE, STATUSES } from "./sample"

const STUDENTS = "/staff/students"

// Kartu yang seluruhnya tautan: warna dan garis bawah ikut isinya, bukan gaya <a>.
const CARD_LINK = { color: "inherit", textDecoration: "none" } as const

const hrefOf = (page: PageId): string => PAGES.find((p) => p.id === page)!.href

// Sapaan mengikuti jam WIB; Beranda dibuka pagi hari oleh hampir semua peran.
function greeting(now: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat("id-ID", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).format(now),
  )
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

function CardHead({
  title,
  caption,
  aside,
}: {
  title: string
  caption?: string
  aside?: React.ReactNode
}) {
  return (
    <div className="row row-between row-wrap">
      <div className="stack" style={{ gap: 2 }}>
        <h2 className="h5">{title}</h2>
        {caption && <span className="caption text-muted">{caption}</span>}
      </div>
      {aside}
    </div>
  )
}

export default async function HomePage() {
  const session = await requirePermission("home")
  const now = new Date()

  const queue = QUEUE.filter((q) => canView(session.role, q.page))
  const pending = queue.reduce((sum, q) => sum + q.count, 0)
  const total = PIPELINE.reduce((sum, s) => sum + s.count, 0)
  const largest = Math.max(...PIPELINE.map((s) => s.count))
  const showFinance = canView(session.role, "invoices")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Dashboard"
        badge={<span className="badge">{session.role}</span>}
        subtitle={`${greeting(now)}, ${session.name}. ${formatDateLong(now)}. Ini yang menunggu Anda hari ini.`}
      />

      {showFinance && <FinanceBalance invoicesHref={hrefOf("invoices")} />}

      <section className="card stack">
        <CardHead
          title="Antrian Pekerjaan Utama"
          caption="Tiap baris membuka halamannya langsung, bukan sekadar angka."
          aside={
            pending > 0 ? (
              <span className="badge badge-tindakan">{pending} perlu tindakan</span>
            ) : (
              <span className="badge badge-beres">Tidak ada yang menunggu</span>
            )
          }
        />

        {queue.length > 0 ? (
          <div className="stack stack-sm">
            {queue.map((q) => (
              <Link key={q.page} href={hrefOf(q.page)} className="row-soft" style={CARD_LINK}>
                <div className="row" style={{ minWidth: 0 }}>
                  <span className={`badge badge-${q.tone}-solid tabular`}>{q.count}</span>
                  <span className="body-sm">{q.label}</span>
                </div>
                <span className="row link" style={{ gap: 4, flexShrink: 0 }}>
                  <span className="hide-mobile">{q.linkLabel}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="body-sm text-muted">
            Belum ada antrian untuk peran {session.role}. Rancangan Beranda peran ini menyusul.
          </p>
        )}
      </section>

      <section className="card stack">
        <CardHead
          title="Angka Ringkas Pipeline"
          caption="Alur tahapan program penempatan Jerman. Satu siswa berada tepat di satu tahap."
          aside={<span className="pill tabular">Total {total} siswa</span>}
        />

        <div className="journey" style={{ gap: 12 }}>
          {PIPELINE.map((s) => (
            <Link
              key={s.id}
              href={`${STUDENTS}?stage=${s.id}`}
              className="level-card"
              style={CARD_LINK}
              title={s.hint}
            >
              <span className="label text-muted">{s.label}</span>
              <span className="h4 tabular">{s.count}</span>
              <div className="progress progress-info" aria-hidden>
                <div className="progress-fill" style={{ width: `${(s.count / largest) * 100}%` }} />
              </div>
              <span className="caption text-muted tabular">
                {Math.round((s.count / total) * 100)}% dari total
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid-4">
        {STATUSES.map((s) => (
          <Link
            key={s.id}
            href={`${STUDENTS}?status=${s.id}`}
            className="card stack stack-sm"
            style={CARD_LINK}
          >
            <div className="row row-between">
              <span className="label text-muted">{s.label}</span>
              <span className={`badge badge-${s.tone}`}>{s.badge}</span>
            </div>
            <span className="h3 tabular">{s.count}</span>
            <span className="caption text-muted">Lihat daftarnya di Siswa</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

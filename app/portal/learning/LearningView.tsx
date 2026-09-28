"use client"

import { Modal, NativeSelect, Skeleton } from "@mantine/core"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { portalLearningQuery } from "@/src/entities/portal/queries"
import type {
  BadgeTone,
  ChapterStatus,
  LevelState,
  PortalLearning,
  PortalLevelCard,
} from "@/src/entities/portal/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate, formatMonthYear } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

const CHAPTERS_PER_LEVEL = 12

const LEVEL_TONE: Readonly<Record<LevelState, BadgeTone>> = {
  Lulus: "beres",
  Berjalan: "berjalan",
  "Sudah diikuti": "terkunci",
  Terkunci: "terkunci",
  "Belum mulai": "terkunci",
}

const CHAPTER_TONE: Readonly<Record<ChapterStatus, BadgeTone>> = {
  Tuntas: "beres",
  Remedial: "tindakan",
  Berjalan: "berjalan",
}

const RECORDING_STARTS = "Pencatatan dimulai sejak sistem berjalan."

const monthLabel = (month: string) => formatMonthYear(`${month}-01`)

async function downloadReportCard(id: string) {
  try {
    await openRenderedFile(`/report-cards/me/${encodeURIComponent(id)}/pdf`)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

function levelDetail(card: PortalLevelCard): React.ReactNode {
  switch (card.state) {
    case "Lulus":
      return card.finalScore === null ? DASH : `nilai akhir ${card.finalScore}`
    case "Berjalan":
      return card.chapter === null
        ? "belum ada bab berjalan"
        : `bab ${card.chapter} dari ${CHAPTERS_PER_LEVEL}`
    case "Terkunci":
      return card.shortfallIdr === null ? (
        DASH
      ) : (
        <span className="text-danger">butuh {formatMoney(idr(card.shortfallIdr))}</span>
      )
    case "Sudah diikuti":
      return "lihat nilai"
    case "Belum mulai":
      return DASH
  }
}

function subtitleOf({ class: classroom }: PortalLearning): string {
  if (!classroom) return "Anda belum tergabung di kelas mana pun. Hubungi PIC cabang Anda."
  return [classroom.name, classroom.schedule, classroom.teacher && `Pengajar ${classroom.teacher}`]
    .filter(Boolean)
    .join(" · ")
}

function LevelCards({
  learning,
  selected,
  onSelect,
}: {
  learning: PortalLearning
  selected: PortalLevelCard | null
  onSelect: (levelId: string) => void
}) {
  const current = learning.currentLevel
  return (
    <div className="level-grid">
      {learning.levels.map((card) => {
        const tone = LEVEL_TONE[card.state]
        const isPreparation =
          card.state === "Berjalan" && current !== null && current.code !== card.level.code
        const content = (
          <>
            <span className="h5 text-ink">{card.level.name}</span>
            <span className={`caption text-${tone}`}>{card.state}</span>
            <span className="body-sm text-ink tabular" style={{ marginTop: 4 }}>
              {levelDetail(card)}
            </span>
            {isPreparation && <span className="caption text-muted">{current.name}</span>}
          </>
        )
        return card.chapters ? (
          <button
            key={card.level.id}
            type="button"
            className={`level-card level-card-${tone}`}
            aria-pressed={selected?.level.id === card.level.id}
            aria-label={`Lihat nilai per bab level ${card.level.name}`}
            onClick={() => onSelect(card.level.id)}
          >
            {content}
          </button>
        ) : (
          <div key={card.level.id} className={`level-card level-card-${tone}`}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

function ChaptersCard({ card, hasClass }: { card: PortalLevelCard | null; hasClass: boolean }) {
  const chapters = card?.chapters ?? null
  return (
    <section className="card stack" aria-labelledby="chapters-heading">
      <div className="row row-between">
        <h2 className="h5" id="chapters-heading">
          {card ? `Nilai per Bab — Level ${card.level.name}` : "Nilai per Bab"}
        </h2>
        {chapters && chapters.kkm !== null && (
          <span className="badge badge-terkunci">KKM {chapters.kkm}</span>
        )}
      </div>

      {!chapters || chapters.rows.length === 0 ? (
        <p className="body-sm text-muted">
          {card || hasClass
            ? `Belum ada nilai tercatat untuk level ini. ${RECORDING_STARTS}`
            : "Nilai per bab tampil setelah Anda tergabung di kelas."}
        </p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Bab</th>
                <th scope="col">Materi</th>
                <th scope="col" className="numeric">
                  Nilai
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {chapters.rows.map((row) => (
                <tr key={row.chapter}>
                  <td>Bab {row.chapter}</td>
                  <td className="text-muted">{DASH}</td>
                  <td className="numeric tabular">{row.score ?? DASH}</td>
                  <td>
                    {row.status ? (
                      <span className={`badge badge-${CHAPTER_TONE[row.status]}`}>
                        {row.status}
                      </span>
                    ) : (
                      DASH
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function AttendanceCard({ months }: { months: PortalLearning["attendance"] }) {
  const [month, setMonth] = useState(months[0]?.month ?? null)
  const shown = months.find((row) => row.month === month) ?? months[0]

  return (
    <section className="card stack" aria-labelledby="attendance-heading">
      <div className="row row-between">
        <h2 className="h5" id="attendance-heading">
          Kehadiran
        </h2>
        {months.length > 1 ? (
          <NativeSelect
            aria-label="Pilih bulan kehadiran"
            radius="xl"
            size="xs"
            value={shown?.month}
            onChange={(event) => setMonth(event.currentTarget.value)}
            data={months.map((row) => ({ value: row.month, label: monthLabel(row.month) }))}
          />
        ) : (
          shown && <span className="caption text-muted">{monthLabel(shown.month)}</span>
        )}
      </div>

      {!shown ? (
        <p className="body-sm text-muted">Belum ada kehadiran tercatat. {RECORDING_STARTS}</p>
      ) : (
        <>
          <div className="list-rows">
            {[
              { label: "Hadir", value: shown.present, className: "text-beres" },
              { label: "Izin", value: shown.excused },
              { label: "Sakit", value: shown.sick },
              { label: "Alpha", value: shown.absent },
            ].map((row) => (
              <div key={row.label} className="row row-between">
                <span className="body-sm">{row.label}</span>
                <span className={`body-sm tabular ${row.className ?? ""}`}>
                  {row.value} pertemuan
                </span>
              </div>
            ))}
          </div>
          <span className="body-sm text-beres">
            {shown.percent === null
              ? "Persentase kehadiran belum terhitung"
              : `Persentase kehadiran ${shown.percent} persen`}
          </span>
        </>
      )}
    </section>
  )
}

function ReportCardsCard({ cards }: { cards: PortalLearning["reportCards"] }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const latest = cards[0]

  return (
    <section className="card stack" aria-labelledby="report-heading">
      <h2 className="h5" id="report-heading">
        Rapor
      </h2>
      <p className="body-sm">
        Rapor memuat nilai bab terhadap KKM, nilai ujian, sepuluh aspek sikap, presensi, dan catatan
        pengajar. Rapor tampil di sini setelah cabang mengirimkannya.
      </p>

      <div className="row row-wrap" style={{ gap: 12 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!latest}
          title={latest ? undefined : "Belum ada rapor yang dikirim ke Anda."}
          onClick={() => latest && void downloadReportCard(latest.id)}
        >
          {latest ? `Unduh Raport ${latest.period}` : "Unduh Raport"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!latest}
          onClick={() => setIsHistoryOpen(true)}
        >
          Riwayat Raport
        </button>
      </div>

      {!latest && <span className="caption text-muted">Belum ada rapor yang dikirim ke Anda.</span>}

      <Modal
        opened={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Riwayat Raport"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        <div className="list-rows">
          {cards.map((card) => (
            <div key={card.id} className="row row-between">
              <div className="stack" style={{ gap: 0 }}>
                <span className="body-sm">
                  {card.level} · {card.period}
                </span>
                <span className="caption text-muted">Dikirim {formatDate(card.sentAt)}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => void downloadReportCard(card.id)}
              >
                Unduh
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  )
}

export function LearningView() {
  const read = useRead(portalLearningQuery())

  if (read.isError) {
    return (
      <div className="stack stack-lg">
        <PageHeader title="Pembelajaran" />
        <QueryError message={read.error.message} onRetry={() => void read.refetch()} />
      </div>
    )
  }
  if (read.isPending) return <LearningSkeleton />

  return <LearningContent learning={read.data} />
}

function LearningContent({ learning }: { learning: PortalLearning }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    learning.levels.find((card) => card.level.id === selectedId) ??
    learning.levels.find((card) => card.state === "Berjalan") ??
    null

  return (
    <div className="stack stack-lg">
      <PageHeader title="Pembelajaran" subtitle={subtitleOf(learning)} />

      {learning.levels.length > 0 && (
        <LevelCards learning={learning} selected={selected} onSelect={setSelectedId} />
      )}

      <div className="grid-main-aside">
        <ChaptersCard card={selected} hasClass={learning.class !== null} />
        <AttendanceCard months={learning.attendance} />
      </div>

      <ReportCardsCard cards={learning.reportCards} />
    </div>
  )
}

const LEVEL_SLOTS = 4

export function LearningSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="65%" radius="xl" />
      </div>

      <div className="level-grid" aria-hidden>
        {Array.from({ length: LEVEL_SLOTS }, (_, index) => (
          <Skeleton key={index} height={96} radius="sm" />
        ))}
      </div>

      <div className="grid-main-aside" aria-hidden>
        <section className="card stack stack-sm">
          <Skeleton height={24} width="50%" radius="xl" />
          <Skeleton height={36} radius="sm" />
          {Array.from({ length: CHAPTERS_PER_LEVEL / 2 }, (_, index) => (
            <Skeleton key={index} height={40} radius="sm" />
          ))}
        </section>
        <section className="card stack stack-sm">
          <Skeleton height={24} width="40%" radius="xl" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={24} radius="sm" />
          ))}
          <Skeleton height={20} width="70%" radius="xl" />
        </section>
      </div>

      <section className="card stack stack-sm" aria-hidden>
        <Skeleton height={24} width="20%" radius="xl" />
        <Skeleton height={40} radius="sm" />
        <Skeleton height={40} width="40%" radius="xl" />
      </section>
    </div>
  )
}

import { Group, Stack, Text, Title } from "@mantine/core"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { DASH, formatPercent } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { ReportCard } from "./ReportCard"
import { ATTENDANCE, CLASS_INFO, LEVELS, type LevelState } from "./data"

/** Kartu level memakai nada yang sama dengan dashboard: hijau lulus, kuning berjalan, abu sisanya. */
const LEVEL_TONE: Readonly<Record<LevelState["kind"], { label: string; tone: string }>> = {
  lulus: { label: "Lulus", tone: "beres" },
  berjalan: { label: "Berjalan", tone: "berjalan" },
  terkunci: { label: "Terkunci", tone: "terkunci" },
  belum: { label: "Belum mulai", tone: "terkunci" },
}

function levelCaption(state: LevelState): React.ReactNode {
  switch (state.kind) {
    case "lulus":
      return (
        <>
          Nilai akhir <span className="tabular">{state.finalScore}</span>
        </>
      )
    case "berjalan":
      return `Bab ${state.chapter} dari ${state.totalChapters}`
    case "terkunci":
      // Nominal yang masih kurang selalu merah, tidak pernah badge.
      return <span className="text-danger">Butuh {formatMoney(state.needed)}</span>
    case "belum":
      return DASH
  }
}

const ATTENDANCE_ROWS = [
  { label: "Hadir", value: ATTENDANCE.hadir, className: "text-beres" },
  { label: "Izin", value: ATTENDANCE.izin },
  { label: "Sakit", value: ATTENDANCE.sakit },
  { label: "Alpha", value: ATTENDANCE.alpha },
] as const

export default async function LearningPage() {
  const session = await requireSession("student")

  const shouldAttend = ATTENDANCE.hadir + ATTENDANCE.izin + ATTENDANCE.sakit + ATTENDANCE.alpha
  const attendanceRate = shouldAttend === 0 ? 0 : ATTENDANCE.hadir / shouldAttend

  return (
    <Stack gap="lg">
      <PageHeader
        title="Pembelajaran"
        subtitle={`${CLASS_INFO.name} · ${CLASS_INFO.schedule} · Pengajar ${CLASS_INFO.teacher}`}
      />

      {/* 4.1 Empat level. Warna kartu = keadaan; kata selalu menyertai warnanya. */}
      <div className="level-grid">
        {LEVELS.map(({ level, state }) => {
          const { label, tone } = LEVEL_TONE[state.kind]
          return (
            <div key={level} className={`level-card level-card-${tone}`}>
              <span className="h5 text-ink">{level}</span>
              <span className={`caption text-${tone}`}>{label}</span>
              <span className="body-sm text-ink" style={{ marginTop: 4 }}>
                {levelCaption(state)}
              </span>
            </div>
          )
        })}
      </div>

      {/* 4.3 Kehadiran bulan berjalan — lima angka sebaris; persentase dihitung, tidak diketik. */}
      <section className="card" aria-labelledby="attendance-heading">
        <Group justify="space-between" align="baseline" wrap="nowrap" mb="md">
          <Title order={5} id="attendance-heading">
            Kehadiran
          </Title>
          <Text size="sm" c="dimmed">
            {ATTENDANCE.period}
          </Text>
        </Group>

        <div className="grid-4" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          {ATTENDANCE_ROWS.map((r) => (
            <div key={r.label} className="stack" style={{ gap: 2 }}>
              <span className="spec-name">{r.label}</span>
              <span className={`h5 tabular ${"className" in r ? r.className : ""}`}>{r.value}</span>
              <span className="caption text-muted">pertemuan</span>
            </div>
          ))}
          <div className="stack" style={{ gap: 2 }}>
            <span className="spec-name">Persentase</span>
            <span className="h5 tabular text-beres">{formatPercent(attendanceRate)}</span>
            <span className="caption text-muted">kehadiran</span>
          </div>
        </div>
      </section>

      <ReportCard studentName={session.name} />
    </Stack>
  )
}

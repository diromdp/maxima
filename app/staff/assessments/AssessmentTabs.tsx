"use client"

import { Select, Skeleton, Tabs, TextInput } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { assessmentFiltersQuery, assessmentSheetQuery } from "@/src/entities/assessment/queries"
import type { AssessmentFilters, SheetKey } from "@/src/entities/assessment/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useUrlParam } from "@/src/lib/use-url-param"

import { AttitudeTab } from "./AttitudeTab"
import { ChapterScoresTab } from "./ChapterScoresTab"
import { InternalExamsTab } from "./InternalExamsTab"
import { NotesTab } from "./NotesTab"
import { SheetSkeleton } from "./SheetSkeleton"

const TABS = [
  { value: "chapters", label: "Nilai Kapitel" },
  { value: "exams", label: "Ujian Internal" },
  { value: "attitude", label: "Sikap & Karakter" },
  { value: "notes", label: "Deskripsi & Catatan" },
] as const

type Access = { readOnly: boolean; canDownloadReport: boolean }

export function AssessmentTabs(access: Access) {
  const filters = useRead(assessmentFiltersQuery())

  if (filters.isError) {
    return <QueryError message={filters.error.message} onRetry={() => void filters.refetch()} />
  }
  if (filters.isPending) return <FiltersSkeleton />

  const { classes, periods } = filters.data
  if (classes.length === 0 || periods.length === 0) {
    return (
      <section className="card">
        <p className="body-sm text-muted">
          {classes.length === 0
            ? "Belum ada kelas aktif dalam cakupanmu. Kelas berstatus Draft baru muncul di sini setelah diaktifkan di halaman Kelas & Jadwal."
            : "Belum ada periode akademik aktif. Tambahkan periodenya di halaman Kelas & Jadwal, tab Periode Akademik."}
        </p>
      </section>
    )
  }

  return <AssessmentSheetView filters={filters.data} {...access} />
}

function AssessmentSheetView({
  filters,
  readOnly,
  canDownloadReport,
}: Access & { filters: AssessmentFilters }) {
  const { classes, periods, defaultPeriodId } = filters
  const [classId, setClassId] = useUrlParam("class", classes[0]!.id, (value) =>
    classes.some((room) => room.id === value),
  )
  const [periodId, setPeriodId] = useUrlParam(
    "period",
    defaultPeriodId ?? periods[0]!.id,
    (value) => periods.some((period) => period.id === value),
  )
  const [tab, setTab] = useUrlParam("tab", TABS[0].value, (value) =>
    TABS.some((candidate) => candidate.value === value),
  )
  const room = classes.find((candidate) => candidate.id === classId) ?? classes[0]!
  const sheetKey: SheetKey = { classId: room.id, periodId }
  const sheet = useRead(assessmentSheetQuery(sheetKey))
  const tabKey = `${room.id}-${periodId}`

  return (
    <div className="stack">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <Select
              label="Kelas"
              size="sm"
              w={220}
              allowDeselect={false}
              searchable
              data={classes.map((candidate) => ({
                value: candidate.id,
                label: `${candidate.name} (${candidate.level.name})`,
              }))}
              value={room.id}
              onChange={(value) => value && setClassId(value)}
            />
            <TextInput
              label="Level (ikut kelas)"
              size="sm"
              w={140}
              readOnly
              value={`Deutsch ${room.level.name}`}
            />
            <Select
              label="Periode"
              size="sm"
              w={160}
              allowDeselect={false}
              data={periods.map((period) => ({ value: period.id, label: period.name }))}
              value={periodId}
              onChange={(value) => value && setPeriodId(value)}
            />
          </div>
          {sheet.isSuccess ? (
            <span className="body-sm text-muted">
              {sheet.data.students.length} siswa · KKM {sheet.data.kkm ?? "-"}
            </span>
          ) : (
            <Skeleton height={16} width={120} radius="xl" aria-hidden />
          )}
        </div>
      </section>

      <Tabs value={tab} onChange={(value) => value && setTab(value)}>
        <ScrollableTabsList>
          {TABS.map(({ value, label }) => (
            <Tabs.Tab key={value} value={value}>
              {label}
            </Tabs.Tab>
          ))}
        </ScrollableTabsList>

        {sheet.isError ? (
          <div style={{ marginTop: 16 }}>
            <QueryError message={sheet.error.message} onRetry={() => void sheet.refetch()} />
          </div>
        ) : sheet.isPending ? (
          <div style={{ marginTop: 16 }}>
            <SheetSkeleton />
          </div>
        ) : sheet.data.students.length === 0 ? (
          <section className="card" style={{ marginTop: 16 }}>
            <p className="body-sm text-muted">
              Belum ada siswa aktif di {room.name}. Tambahkan anggotanya di halaman Kelas &amp;
              Jadwal, tab Anggota Kelas.
            </p>
          </section>
        ) : (
          <>
            <Tabs.Panel value="chapters">
              <ChapterScoresTab
                key={tabKey}
                sheet={sheet.data}
                sheetKey={sheetKey}
                readOnly={readOnly}
              />
            </Tabs.Panel>
            <Tabs.Panel value="exams">
              <InternalExamsTab
                key={tabKey}
                sheet={sheet.data}
                sheetKey={sheetKey}
                readOnly={readOnly}
              />
            </Tabs.Panel>
            <Tabs.Panel value="attitude">
              <AttitudeTab
                key={tabKey}
                sheet={sheet.data}
                sheetKey={sheetKey}
                readOnly={readOnly}
              />
            </Tabs.Panel>
            <Tabs.Panel value="notes">
              <NotesTab
                key={tabKey}
                sheet={sheet.data}
                sheetKey={sheetKey}
                readOnly={readOnly}
                canDownloadReport={canDownloadReport}
              />
            </Tabs.Panel>
          </>
        )}
      </Tabs>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="stack" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <section className="card" aria-hidden>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Skeleton height={36} width={220} radius="xl" />
          <Skeleton height={36} width={140} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
      </section>
      <SheetSkeleton />
    </div>
  )
}

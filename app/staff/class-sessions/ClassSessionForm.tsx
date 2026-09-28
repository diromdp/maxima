"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { sessionDatesQuery, sessionsOnDateQuery } from "@/src/entities/session/queries"
import { jakartaToday, monthOf } from "@/src/entities/session/schema"
import { useRead } from "@/src/lib/api/use-read"

import { FactsSkeleton, SessionFacts, SessionSheet } from "./SessionSheet"

export function ClassSessionForm({ roleName }: { roleName: string }) {
  const [date, setDate] = useState(jakartaToday)
  const [shownMonth, setShownMonth] = useState(() => monthOf(date))
  const [classId, setClassId] = useState<string | null>(null)
  const sessionDates = useRead(sessionDatesQuery(shownMonth))
  const sessions = useRead(sessionsOnDateQuery(date))

  const datesInMonth = sessionDates.data?.dates
  const onDate = sessions.data ?? []
  const session = onDate.find((candidate) => candidate.classId === classId) ?? onDate[0]

  return (
    <div className="stack">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <DatesProvider settings={{ locale: "id" }}>
              <DateInput
                label="Tanggal Sesi"
                size="sm"
                w={180}
                valueFormat="DD MMM YYYY"
                leftSection={<HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />}
                value={date}
                onChange={(value) => {
                  if (!value) return
                  setDate(value)
                  setClassId(null)
                }}
                onDateChange={(value) => setShownMonth(monthOf(value))}
                excludeDate={(candidate) =>
                  datesInMonth !== undefined &&
                  monthOf(candidate) === shownMonth &&
                  !datesInMonth.includes(candidate)
                }
                hideOutsideDates
                allowDeselect={false}
                clearable={false}
              />
            </DatesProvider>
            {onDate.length > 0 && session && (
              <Select
                label="Pilih Kelas Aktif"
                size="sm"
                w={240}
                allowDeselect={false}
                comboboxProps={{ position: "bottom-start" }}
                data={onDate.map((candidate) => ({
                  value: candidate.classId,
                  label: `${candidate.className} (${candidate.level.name})`,
                }))}
                value={session.classId}
                onChange={setClassId}
              />
            )}
          </div>

          {sessions.isPending ? (
            <FactsSkeleton />
          ) : session ? (
            <SessionFacts sessionId={session.sessionId} />
          ) : (
            !sessions.isError && (
              <p className="body-sm text-muted" style={{ margin: 0 }}>
                Tidak ada sesi pada tanggal ini. Pilih tanggal lain yang punya jadwal kelas.
              </p>
            )
          )}
        </div>
      </section>

      {sessionDates.isError && (
        <QueryError
          message={`Tanggal bersesi tidak dapat dimuat, jadi semua tanggal dapat dipilih. ${sessionDates.error.message}`}
          onRetry={() => void sessionDates.refetch()}
        />
      )}

      {sessions.isError && (
        <QueryError message={sessions.error.message} onRetry={() => void sessions.refetch()} />
      )}

      {session && (
        <SessionSheet key={session.sessionId} sessionId={session.sessionId} roleName={roleName} />
      )}
    </div>
  )
}

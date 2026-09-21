"use client"

import { Select, Tabs, TextInput } from "@mantine/core"
import { useState } from "react"

import { AttitudeTab } from "./AttitudeTab"
import { ChapterScoresTab } from "./ChapterScoresTab"
import { InternalExamsTab } from "./InternalExamsTab"
import { NotesTab } from "./NotesTab"
import { CLASSES, classLabel, KKM, PERIODS, STUDENTS_BY_CLASS } from "./sample"

const TAB_VALUES = ["chapters", "exams", "attitude", "notes"] as const
type TabValue = (typeof TAB_VALUES)[number]

const TAB_LABELS: Readonly<Record<TabValue, string>> = {
  chapters: "Nilai Kapitel",
  exams: "Ujian Internal",
  attitude: "Sikap & Karakter",
  notes: "Deskripsi & Catatan",
}

export function AssessmentTabs({
  initialTab,
  readOnly,
}: {
  initialTab?: string
  readOnly: boolean
}) {
  const [classId, setClassId] = useState(CLASSES[0].id)
  const [period, setPeriod] = useState<string>(PERIODS[0])
  const room = CLASSES.find((candidate) => candidate.id === classId) ?? CLASSES[0]
  const studentCount = (STUDENTS_BY_CLASS[room.id] ?? []).length
  const initial = TAB_VALUES.find((value) => value === initialTab) ?? TAB_VALUES[0]

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
              data={CLASSES.map((candidate) => ({
                value: candidate.id,
                label: classLabel(candidate),
              }))}
              value={room.id}
              onChange={(value) => value && setClassId(value)}
            />
            <TextInput
              label="Level (ikut kelas)"
              size="sm"
              w={140}
              readOnly
              value={`Deutsch ${room.level}`}
            />
            <Select
              label="Periode"
              size="sm"
              w={160}
              allowDeselect={false}
              data={[...PERIODS]}
              value={period}
              onChange={(value) => value && setPeriod(value)}
            />
          </div>
          <span className="body-sm text-muted">
            {studentCount} siswa · KKM {KKM}
          </span>
        </div>
      </section>

      <Tabs defaultValue={initial} keepMounted={false}>
        <Tabs.List mb="lg">
          {TAB_VALUES.map((value) => (
            <Tabs.Tab key={value} value={value}>
              {TAB_LABELS[value]}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="chapters">
          <ChapterScoresTab key={`${room.id}-${period}`} room={room} readOnly={readOnly} />
        </Tabs.Panel>
        <Tabs.Panel value="exams">
          <InternalExamsTab key={`${room.id}-${period}`} room={room} readOnly={readOnly} />
        </Tabs.Panel>
        <Tabs.Panel value="attitude">
          <AttitudeTab key={`${room.id}-${period}`} room={room} readOnly={readOnly} />
        </Tabs.Panel>
        <Tabs.Panel value="notes">
          <NotesTab key={`${room.id}-${period}`} room={room} period={period} readOnly={readOnly} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Checkbox, SegmentedControl } from "@mantine/core"
import dayjs, { type Dayjs } from "dayjs"
import { useState } from "react"

import { formatDate } from "@/src/lib/format"

import {
  CALENDAR_CLASS_IDS,
  CALENDAR_START,
  type CalendarEvent,
  classLabel,
  CLASSES,
  EVENT_KINDS,
  EVENTS,
} from "./sample"

type View = "month" | "week"

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
const DAY_KEY = "YYYY-MM-DD"
const MONTH_TITLE = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
const FILTER_CLASSES = CLASSES.filter((room) => CALENDAR_CLASS_IDS.includes(room.id))
const BADGE_BY_KIND = Object.fromEntries(EVENT_KINDS.map(({ kind, badge }) => [kind, badge]))

const mondayOf = (date: Dayjs) => date.subtract((date.day() + 6) % 7, "day")

function daysOf(anchor: Dayjs, view: View): readonly Dayjs[] {
  if (view === "week") {
    const monday = mondayOf(anchor)
    return Array.from({ length: 7 }, (_, index) => monday.add(index, "day"))
  }
  const first = anchor.startOf("month")
  const gridStart = mondayOf(first)
  const cellCount = Math.ceil((first.diff(gridStart, "day") + anchor.daysInMonth()) / 7) * 7
  return Array.from({ length: cellCount }, (_, index) => gridStart.add(index, "day"))
}

function periodTitle(anchor: Dayjs, view: View) {
  if (view === "month") return MONTH_TITLE.format(anchor.toDate())
  const monday = mondayOf(anchor)
  return `${formatDate(monday.toDate())} - ${formatDate(monday.add(6, "day").toDate())}`
}

const isVisible = (event: CalendarEvent, selected: ReadonlySet<string>) =>
  !event.classId || selected.has(event.classId)

export function AcademicCalendar() {
  const [view, setView] = useState<View>("month")
  const [anchor, setAnchor] = useState(() => dayjs(CALENDAR_START))
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(FILTER_CLASSES.map((room) => room.id)),
  )

  const days = daysOf(anchor, view)
  const weeks = Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  )
  const today = dayjs().format(DAY_KEY)
  const isAllSelected = selected.size === FILTER_CLASSES.length
  const visibleEvents = EVENTS.filter((event) => isVisible(event, selected))

  const toggleClass = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="stack">
      <div className="row row-between row-wrap">
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            aria-label={view === "month" ? "Bulan sebelumnya" : "Minggu sebelumnya"}
            onClick={() => setAnchor((current) => current.subtract(1, view))}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          </button>
          <h2 className="h6" aria-live="polite" style={{ minWidth: 160, textAlign: "center" }}>
            {periodTitle(anchor, view)}
          </h2>
          <button
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            aria-label={view === "month" ? "Bulan berikutnya" : "Minggu berikutnya"}
            onClick={() => setAnchor((current) => current.add(1, view))}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAnchor(dayjs())}>
            Hari ini
          </button>
        </div>
        <SegmentedControl
          size="sm"
          aria-label="Tampilan kalender"
          value={view}
          onChange={(value) => setView(value === "week" ? "week" : "month")}
          data={[
            { label: "Bulan", value: "month" },
            { label: "Minggu", value: "week" },
          ]}
        />
      </div>

      <div className="calendar-layout">
        <aside className="card stack">
          <div className="stack stack-sm">
            <h3 className="caption text-muted">Legenda Event</h3>
            <ul className="stack stack-sm" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {EVENT_KINDS.map(({ kind, label, badge }) => (
                <li key={kind}>
                  <span className={`badge ${badge}`}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="stack stack-sm">
            <h3 className="caption text-muted">Filter Kelas</h3>
            <Checkbox
              size="sm"
              label="Semua Kelas"
              checked={isAllSelected}
              indeterminate={!isAllSelected && selected.size > 0}
              onChange={() =>
                setSelected(
                  isAllSelected ? new Set() : new Set(FILTER_CLASSES.map((room) => room.id)),
                )
              }
            />
            {FILTER_CLASSES.map((room) => (
              <Checkbox
                key={room.id}
                size="sm"
                label={classLabel(room)}
                checked={selected.has(room.id)}
                onChange={() => toggleClass(room.id)}
              />
            ))}
          </div>
        </aside>

        <div className="table-scroll">
          <table className={`calendar${view === "week" ? " calendar-week" : ""}`}>
            <thead>
              <tr>
                {WEEKDAYS.map((weekday) => (
                  <th key={weekday} scope="col">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0].format(DAY_KEY)}>
                  {week.map((day) => {
                    const key = day.format(DAY_KEY)
                    const events = visibleEvents.filter((event) => event.date === key)
                    const isOutside = view === "month" && !day.isSame(anchor, "month")
                    return (
                      <td
                        key={key}
                        className={
                          [
                            isOutside ? "calendar-day-outside" : "",
                            key === today ? "calendar-day-today" : "",
                          ]
                            .filter(Boolean)
                            .join(" ") || undefined
                        }
                      >
                        <span
                          className="calendar-date tabular"
                          aria-label={formatDate(day.toDate())}
                        >
                          {day.date()}
                        </span>
                        {events.map((event) => (
                          <span
                            key={`${key}-${event.title}`}
                            className={`badge ${BADGE_BY_KIND[event.kind]} calendar-event`}
                          >
                            {event.title}
                          </span>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

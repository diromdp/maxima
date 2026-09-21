"use client"

import { Chip, Group, Modal, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, TimeInput } from "@mantine/dates"
import { useState } from "react"

import { notify } from "@/src/lib/notify"

import {
  BRANCHES,
  CLASS_STATUSES,
  type ClassRoom,
  DAYS,
  type Day,
  LEVELS,
  scheduleLabel,
  TEACHERS,
} from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function ClassFormModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: ClassRoom
}) {
  const [days, setDays] = useState<string[]>(initial ? [...initial.days] : [])
  const [startTime, setStartTime] = useState(initial?.startTime ?? "")
  const [endTime, setEndTime] = useState(initial?.endTime ?? "")
  const isScheduleSet = days.length > 0 && startTime !== "" && endTime !== ""
  const isTimeReversed = startTime !== "" && endTime !== "" && endTime <= startTime

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? `Ubah ${initial.name}` : "Tambah Kelas"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(initial ? `Perubahan ${initial.name} disimpan.` : "Kelas baru disimpan.")
          onClose()
        }}
        onReset={onClose}
      >
        <div className="grid-2">
          <TextInput
            name="name"
            label="Nama Kelas"
            placeholder="Kelas Berlin"
            defaultValue={initial?.name}
            required
          />
          <Select
            name="level"
            label="Level"
            placeholder="Pilih level"
            data={[...LEVELS]}
            defaultValue={initial?.level}
            required
          />
        </div>

        <div className="grid-2">
          <Select
            name="branch"
            label="Cabang"
            placeholder="Pilih cabang"
            data={[...BRANCHES]}
            defaultValue={initial?.branch}
            required
          />
          <Select
            name="teacher"
            label="Pengajar"
            description="Diambil dari pengguna staf berperan Pengajar."
            placeholder="Pilih pengajar"
            data={[...TEACHERS]}
            defaultValue={initial?.teacher}
            searchable
            required
          />
        </div>

        <div className="grid-2">
          <NumberInput
            name="capacity"
            label="Kapasitas"
            description={
              initial
                ? `${initial.enrolled} siswa sudah terdaftar di kelas ini.`
                : "Daya tampung siswa untuk kelas ini."
            }
            placeholder="20"
            min={initial?.enrolled || 1}
            max={40}
            defaultValue={initial?.capacity}
            required
          />
          <Select
            name="status"
            label="Status"
            description="Kelas Draft belum muncul di Anggota Kelas dan di kelas tujuan pemindahan."
            data={[...CLASS_STATUSES]}
            defaultValue={initial?.status ?? "Draft"}
            required
          />
        </div>

        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
          <div className="stack" style={{ gap: 2 }}>
            <span className="field-label">Jadwal Mingguan</span>
            <span className="field-hint">
              Hari dan jam di sini yang menerbitkan sesi kelas beserta daftar absensinya, dan yang
              tampil sebagai chip di Kalender Akademik.
            </span>
          </div>

          <Chip.Group multiple value={days} onChange={setDays}>
            <div className="row row-wrap" style={{ gap: 8 }}>
              {DAYS.map((day) => (
                <Chip key={day} value={day} size="sm">
                  {day}
                </Chip>
              ))}
            </div>
          </Chip.Group>

          <div className="grid-2">
            <TimeInput
              name="startTime"
              label="Jam Mulai"
              value={startTime}
              onChange={(event) => setStartTime(event.currentTarget.value)}
              required
            />
            <TimeInput
              name="endTime"
              label="Jam Selesai"
              value={endTime}
              onChange={(event) => setEndTime(event.currentTarget.value)}
              error={isTimeReversed ? "Jam selesai harus lewat dari jam mulai." : undefined}
              required
            />
          </div>

          <span className="caption text-muted">
            {isScheduleSet
              ? `Tertulis "${scheduleLabel({ days: days as readonly Day[], startTime, endTime })}" - ${days.length} pertemuan per minggu.`
              : "Pilih hari dan jam untuk melihat jadwal yang tertulis di daftar kelas."}
          </span>
        </fieldset>

        <div className="grid-2">
          <DateInput
            name="start"
            label="Mulai"
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            defaultValue={initial ? new Date(initial.start) : undefined}
            required
          />
          <DateInput
            name="end"
            label="Selesai"
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            defaultValue={initial ? new Date(initial.end) : undefined}
            required
          />
        </div>

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isScheduleSet || isTimeReversed}
            title={
              isScheduleSet
                ? isTimeReversed
                  ? "Perbaiki jam selesai dulu"
                  : undefined
                : "Lengkapi hari dan jam belajar dulu"
            }
          >
            Simpan Kelas
          </button>
        </Group>
      </form>
    </Modal>
  )
}

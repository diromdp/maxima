"use client"

import { Chip, Group, Modal, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider, TimeInput } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { saveClass } from "@/src/entities/class/actions"
import { teachersQuery } from "@/src/entities/class/queries"
import {
  CLASS_STATUSES,
  classFormSchema,
  DAY_SHORT,
  scheduleLabel,
  WEEK_DAYS,
  type ClassForm,
  type ClassRow,
  type WeekDay,
} from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

import { TITLE_STYLE } from "./DialogParts"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"

const initialOf = (room?: ClassRow): ClassForm => ({
  name: room?.name ?? "",
  levelId: room?.level.id ?? "",
  branchId: room?.branch.id ?? "",
  teacherUserId: room?.teacher?.id ?? null,
  capacity: room?.capacity ?? "",
  status: room?.status ?? "Draft",
  days: room ? [...room.days] : [],
  startTime: room?.startTime ?? "",
  endTime: room?.endTime ?? "",
  startDate: room?.startDate ?? "",
  endDate: room?.endDate ?? "",
})

export function ClassFormModal({ initial, onClose }: { initial?: ClassRow; onClose: () => void }) {
  const { branches, levels } = useMasterOptions()
  const teachers = useRead(teachersQuery())
  const form = useForm<ClassForm>({
    initialValues: initialOf(initial),
    validate: schemaResolver(classFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveClass(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Kelas baru disimpan.",
    invalidates: [["classes"], ["class-calendar"], ["kkm-standards"]],
    onSuccess: onClose,
  })

  const { days, startTime, endTime } = form.values
  const isScheduleSet = days.length > 0 && startTime !== "" && endTime !== ""
  const isTimeReversed = isScheduleSet && endTime <= startTime
  const blockedReason = !isScheduleSet
    ? "Lengkapi hari dan jam belajar dulu"
    : isTimeReversed
      ? "Perbaiki jam selesai dulu"
      : undefined

  return (
    <Modal
      opened
      onClose={onClose}
      title={initial ? `Ubah ${initial.name}` : "Tambah Kelas"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <div className="grid-2">
          <TextInput
            label="Nama Kelas"
            placeholder="Kelas Berlin"
            withAsterisk
            data-autofocus
            {...form.getInputProps("name")}
          />
          <Select
            label="Level"
            placeholder="Pilih level"
            data={[...levels]}
            withAsterisk
            {...form.getInputProps("levelId")}
          />
        </div>

        <div className="grid-2">
          <Select
            label="Cabang"
            placeholder="Pilih cabang"
            data={[...branches]}
            withAsterisk
            {...form.getInputProps("branchId")}
          />
          <Select
            label="Pengajar"
            description="Pengguna staf berwilayah utama Akademik."
            placeholder={teachers.isPending ? "Memuat pengajar" : "Pilih pengajar"}
            data={(teachers.data?.data ?? []).map((teacher) => ({
              value: teacher.id,
              label: teacher.name,
            }))}
            error={teachers.isError ? teachers.error.message : form.errors.teacherUserId}
            searchable
            clearable
            value={form.values.teacherUserId}
            onChange={(value) => form.setFieldValue("teacherUserId", value)}
          />
        </div>

        <div className="grid-2">
          <NumberInput
            label="Kapasitas"
            description={
              initial
                ? `${initial.memberCount} siswa sudah terdaftar di kelas ini.`
                : "Daya tampung siswa untuk kelas ini."
            }
            placeholder="20"
            min={initial?.memberCount || 1}
            max={200}
            allowDecimal={false}
            withAsterisk
            {...form.getInputProps("capacity")}
          />
          <Select
            label="Status"
            description="Kelas Draft belum muncul di Anggota Kelas dan di kelas tujuan pemindahan."
            data={[...CLASS_STATUSES]}
            allowDeselect={false}
            {...form.getInputProps("status")}
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

          <Chip.Group
            multiple
            value={days}
            onChange={(value) => form.setFieldValue("days", value as WeekDay[])}
          >
            <div className="row row-wrap" style={{ gap: 8 }}>
              {WEEK_DAYS.map((day) => (
                <Chip key={day} value={day} size="sm">
                  {DAY_SHORT[day]}
                </Chip>
              ))}
            </div>
          </Chip.Group>
          {form.errors.days && <span className="field-error">{form.errors.days}</span>}

          <div className="grid-2">
            <TimeInput label="Jam Mulai" withAsterisk {...form.getInputProps("startTime")} />
            <TimeInput
              label="Jam Selesai"
              withAsterisk
              {...form.getInputProps("endTime")}
              error={isTimeReversed ? "Jam selesai harus sesudah jam mulai." : form.errors.endTime}
            />
          </div>

          <span className="caption text-muted">
            {isScheduleSet
              ? `Tertulis "${scheduleLabel(days, startTime, endTime)}", ${days.length} pertemuan per minggu.`
              : "Pilih hari dan jam untuk melihat jadwal yang tertulis di daftar kelas."}
          </span>
        </fieldset>

        <DatesProvider settings={{ locale: "id" }}>
          <div className="grid-2">
            <DateInput
              label="Mulai"
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              withAsterisk
              {...form.getInputProps("startDate")}
            />
            <DateInput
              label="Selesai"
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              withAsterisk
              {...form.getInputProps("endDate")}
            />
          </div>
        </DatesProvider>

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={blockedReason !== undefined || isPending}
            title={blockedReason}
          >
            {isPending ? "Menyimpan..." : "Simpan Kelas"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}

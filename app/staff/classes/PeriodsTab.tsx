"use client"

import { Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import dayjs from "dayjs"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { FormModal } from "@/src/components/ui/FormModal"
import { savePeriod } from "@/src/entities/class/actions"
import { academicPeriodsQuery } from "@/src/entities/class/queries"
import {
  PERIOD_STATUSES,
  periodFormSchema,
  type PeriodForm,
  type PeriodRow,
} from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { useActionForm } from "@/src/lib/use-action-form"

import { ClassTableSkeleton } from "./MasterClassTable"

const DATE_KEY = "YYYY-MM-DD"

const oneYearFrom = (start: string) =>
  dayjs(start).add(1, "year").subtract(1, "day").format(DATE_KEY)

function columnsFor(
  canEdit: boolean,
  onEdit: (period: PeriodRow) => void,
): readonly DataColumn<PeriodRow>[] {
  const columns: DataColumn<PeriodRow>[] = [
    {
      key: "name",
      header: "Nama Periode",
      sort: (period) => period.name,
      cell: (period) => <span style={{ fontWeight: 600 }}>{period.name}</span>,
    },
    {
      key: "start",
      header: "Tanggal Mulai",
      sort: (period) => period.startDate,
      cell: (period) => <span className="tabular">{formatDate(period.startDate)}</span>,
    },
    {
      key: "end",
      header: "Tanggal Selesai",
      sort: (period) => period.endDate,
      cell: (period) => <span className="tabular">{formatDate(period.endDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sort: (period) => period.status,
      cell: (period) => (
        <span className={`badge ${period.status === "Aktif" ? "badge-beres" : "badge-terkunci"}`}>
          {period.status}
        </span>
      ),
    },
  ]
  if (!canEdit) return columns
  return [
    ...columns,
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (period) => (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(period)}>
          Ubah
        </button>
      ),
    },
  ]
}

export function PeriodsTab({ canEdit }: { canEdit: boolean }) {
  const periods = useRead(academicPeriodsQuery())
  const [dialog, setDialog] = useState<{ readonly period?: PeriodRow } | null>(null)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5">Periode Akademik</h2>
          <span className="caption text-muted">
            Kunci raport bersama siswa dan level. Satu periode satu tahun.
          </span>
        </div>
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setDialog({})}>
            Tambah Periode
          </button>
        )}
      </div>

      {periods.isError ? (
        <QueryError message={periods.error.message} onRetry={() => void periods.refetch()} />
      ) : periods.isPending ? (
        <ClassTableSkeleton />
      ) : (
        <DataTable
          rows={periods.data.data}
          columns={columnsFor(canEdit, (period) => setDialog({ period }))}
          rowKey={(period) => period.id}
          emptyText="Belum ada periode akademik."
        />
      )}

      {dialog && <PeriodModal initial={dialog.period} onClose={() => setDialog(null)} />}
    </section>
  )
}

function PeriodModal({ initial, onClose }: { initial?: PeriodRow; onClose: () => void }) {
  const form = useForm<PeriodForm>({
    initialValues: {
      name: initial?.name ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      status: initial?.status ?? "Aktif",
    },
    validate: schemaResolver(periodFormSchema, { sync: true }),
    onValuesChange: (values, previous) => {
      if (values.startDate && values.startDate !== previous.startDate) {
        form.setFieldValue("endDate", oneYearFrom(values.startDate))
      }
    },
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => savePeriod(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Periode baru disimpan.",
    invalidates: [["academic-periods"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Periode"}
      submitLabel="Simpan Periode"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextInput
        label="Nama Periode"
        placeholder="2026"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <DatesProvider settings={{ locale: "id" }}>
        <div className="grid-2">
          <DateInput
            label="Tanggal Mulai"
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            withAsterisk
            {...form.getInputProps("startDate")}
          />
          <DateInput
            label="Tanggal Selesai"
            description="Terisi satu tahun sesudah Tanggal Mulai."
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            withAsterisk
            {...form.getInputProps("endDate")}
          />
        </div>
      </DatesProvider>
      <Select
        label="Status"
        description="Periode Nonaktif tetap terbaca di raport lama, tetapi tidak dapat diisi nilai."
        data={[...PERIOD_STATUSES]}
        allowDeselect={false}
        {...form.getInputProps("status")}
      />
    </FormModal>
  )
}

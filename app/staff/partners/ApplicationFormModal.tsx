"use client"

import { Modal, Select, Skeleton, Textarea, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useQuery } from "@tanstack/react-query"

import { Notice } from "@/src/components/ui/Notice"
import { createApplication } from "@/src/entities/partner/actions"
import { APPLICATION_KEYS, requirementsQuery } from "@/src/entities/partner/queries"
import {
  APPLICATION_STATUSES,
  applicationFormSchema,
  type ApplicationForm,
} from "@/src/entities/partner/schema"
import { readApi } from "@/src/lib/api/read"
import { useActionForm } from "@/src/lib/use-action-form"

import { STATUS_OPTIONS } from "./StatusBadge"
import { StudentPicker } from "./StudentPicker"
import { usePartnerOptions } from "./use-partner-options"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

function useRequirements(studentId: string) {
  const read = requirementsQuery(studentId)
  return useQuery({
    queryKey: read.queryKey,
    queryFn: () => readApi(read),
    enabled: studentId !== "",
    staleTime: 0,
  })
}

export function ApplicationFormModal({ onClose }: { onClose: () => void }) {
  const { activePartners } = usePartnerOptions()
  const form = useForm<ApplicationForm>({
    initialValues: {
      studentId: "",
      partnerId: "",
      status: APPLICATION_STATUSES[0],
      position: "",
      partnerNote: "",
      admissionNote: "",
    },
    validate: schemaResolver(applicationFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: createApplication,
    successMessage: "Pengajuan ke partner disimpan.",
    invalidates: APPLICATION_KEYS,
    onSuccess: onClose,
  })

  const { studentId } = form.values
  const requirements = useRequirements(studentId)
  const holds = requirements.data?.missing ?? []
  const blockedReason = !studentId
    ? "Pilih siswa dulu"
    : requirements.isPending
      ? "Syarat pengajuan sedang diperiksa"
      : requirements.isError
        ? "Syarat pengajuan belum terbaca"
        : holds.length > 0
          ? "Syarat pengajuan belum terpenuhi"
          : undefined

  return (
    <Modal opened onClose={onClose} title="Tambah Pengajuan" size="lg" styles={TITLE_STYLE}>
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <StudentPicker
          value={studentId}
          error={form.errors.studentId}
          onChange={(next) => form.setFieldValue("studentId", next)}
        />

        {studentId && requirements.isPending && (
          <div aria-busy="true">
            <span className="sr-only" role="status">
              Memuat
            </span>
            <Skeleton height={56} radius="md" aria-hidden />
          </div>
        )}
        {requirements.isError && <Notice tone="danger">{requirements.error.message}</Notice>}
        {holds.length > 0 && (
          <Notice tone="danger" title="Pengajuan ditahan">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {holds.map((hold) => (
                <li key={hold}>{hold}</li>
              ))}
            </ul>
          </Notice>
        )}

        <div className="grid-2">
          <Select
            label="Partner"
            placeholder="Pilih partner aktif"
            withAsterisk
            searchable
            data={activePartners}
            {...form.getInputProps("partnerId")}
          />
          <TextInput
            label="Posisi"
            placeholder="Perawat (FSJ)"
            {...form.getInputProps("position")}
          />
        </div>

        <Select
          label="Status Progres"
          data={STATUS_OPTIONS}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("status")}
        />

        <div className="grid-2">
          <Textarea
            label="Catatan Partner"
            placeholder="Umpan balik dari partner"
            autosize
            minRows={2}
            {...form.getInputProps("partnerNote")}
          />
          <Textarea
            label="Catatan Admission"
            description="Internal, tidak tampil di portal siswa."
            placeholder="Tindak lanjut internal"
            autosize
            minRows={2}
            {...form.getInputProps("admissionNote")}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending || blockedReason !== undefined}
            title={blockedReason}
          >
            {isPending ? "Menyimpan..." : "Simpan Pengajuan"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

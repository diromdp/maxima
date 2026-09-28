"use client"

import { Select, Textarea, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { updateApplication } from "@/src/entities/partner/actions"
import { APPLICATION_KEYS } from "@/src/entities/partner/queries"
import {
  applicationUpdateFormSchema,
  statusesAfter,
  VERTRAG,
  WITHDRAWN,
  type ApplicationRow,
  type ApplicationUpdateForm,
} from "@/src/entities/partner/schema"
import { useActionForm } from "@/src/lib/use-action-form"

export function ApplicationEditModal({
  application,
  onClose,
}: {
  application: ApplicationRow
  onClose: () => void
}) {
  const form = useForm<ApplicationUpdateForm>({
    initialValues: {
      status: application.status,
      position: application.position ?? "",
      partnerNote: application.partnerNote ?? "",
      admissionNote: application.admissionNote ?? "",
      reason: "",
    },
    validate: schemaResolver(applicationUpdateFormSchema(application.status), { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => updateApplication(application.id, values),
    successMessage: `Pengajuan ${application.student.name} ke ${application.partner.name} disimpan.`,
    invalidates: APPLICATION_KEYS,
    onSuccess: onClose,
  })
  const isWithdrawingVertrag = application.status === VERTRAG && form.values.status === WITHDRAWN

  return (
    <FormModal
      title="Ubah Pengajuan"
      size="lg"
      submitLabel="Simpan Pengajuan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <dl className="row row-wrap" style={{ gap: 20, margin: 0 }}>
        {[
          { label: "Siswa", value: application.student.name },
          { label: "Partner", value: application.partner.name },
        ].map(({ label, value }) => (
          <div key={label} className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">{label}</dt>
            <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid-2">
        <TextInput label="Posisi" placeholder="Perawat (FSJ)" {...form.getInputProps("position")} />
        <Select
          label="Status Progres"
          description={
            application.status === VERTRAG
              ? "Dapat Vertrag hanya dapat diubah ke Tidak Lanjut Proses."
              : undefined
          }
          data={statusesAfter(application.status).map((status) => ({
            value: status,
            label: status,
          }))}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("status")}
        />
      </div>

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

      {isWithdrawingVertrag && (
        <Textarea
          label="Alasan"
          description="Tersimpan di jejak perpindahan status pengajuan ini."
          placeholder="Contoh: Betrieb membatalkan Vertrag karena siswa tidak lolos pemeriksaan kesehatan."
          autosize
          minRows={2}
          withAsterisk
          {...form.getInputProps("reason")}
        />
      )}
    </FormModal>
  )
}

"use client"

import { Checkbox, Group, Modal, Select, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { transferClassMembers } from "@/src/entities/class/actions"
import { activeClassesQuery } from "@/src/entities/class/queries"
import {
  capacityLabel,
  classLabel,
  seatsLeft,
  transferFormSchema,
  type ClassRow,
  type MemberRow,
  type TransferForm,
} from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { useActionForm } from "@/src/lib/use-action-form"

import { CapacityWarning, Facts, MEMBER_INVALIDATIONS, TITLE_STYLE } from "./DialogParts"

export function TransferModal({
  room,
  members,
  student,
  onClose,
}: {
  room: ClassRow
  members: readonly MemberRow[]
  student?: MemberRow
  onClose: () => void
}) {
  const classes = useRead(activeClassesQuery())
  const targets = (classes.data?.data ?? []).filter((candidate) => candidate.id !== room.id)
  const form = useForm<TransferForm>({
    initialValues: {
      studentIds: student ? [student.studentId] : [],
      targetClassId: "",
      reason: "",
      isOverCapacityConfirmed: false,
    },
    validate: schemaResolver(transferFormSchema, { sync: true }),
  })
  const target = targets.find((candidate) => candidate.id === form.values.targetClassId)
  const chosen = form.values.studentIds.length
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => transferClassMembers(room.id, values),
    successMessage: `${chosen} siswa dipindahkan dari ${room.name} ke ${target?.name ?? "kelas tujuan"}.`,
    invalidates: MEMBER_INVALIDATIONS,
    onSuccess: onClose,
  })

  const seats = target ? seatsLeft(target) : 0
  const isOverCapacity = target !== undefined && chosen > seats
  const blockedReason = !target
    ? "Pilih dulu kelas tujuan"
    : chosen === 0
      ? "Pilih dulu siswa yang akan dipindahkan"
      : isOverCapacity && !form.values.isOverCapacityConfirmed
        ? "Centang persetujuan melebihi kapasitas dulu"
        : undefined

  return (
    <Modal
      opened
      onClose={onClose}
      title={student ? `Pindahkan ${student.fullName}` : "Pindahkan Siswa Massal"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}

        {student ? (
          <Facts
            items={[
              { label: "NIS", value: student.nis ?? DASH },
              { label: "Kelas asal", value: classLabel(room) },
              { label: "Bab terakhir", value: student.lastChapter ?? DASH },
            ]}
          />
        ) : (
          <Checkbox.Group
            label={`Siswa ${room.name}`}
            description="Siswa berstatus Keluar tidak bisa dipindahkan."
            {...form.getInputProps("studentIds")}
          >
            <div className="stack" style={{ gap: 12, marginBlockStart: 12 }}>
              {members.map((member) => (
                <Checkbox
                  key={member.studentId}
                  value={member.studentId}
                  label={member.fullName}
                  description={[`NIS ${member.nis ?? DASH}`, member.lastChapter, member.status]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))}
            </div>
          </Checkbox.Group>
        )}

        <Select
          label="Kelas tujuan"
          placeholder={classes.isPending ? "Memuat kelas" : "Pilih kelas aktif"}
          data={targets.map((candidate) => ({
            value: candidate.id,
            label: `${classLabel(candidate)} - ${capacityLabel(candidate)}`,
          }))}
          nothingFoundMessage="Tidak ada kelas aktif lain."
          searchable
          withAsterisk
          comboboxProps={{ position: "bottom-start" }}
          {...form.getInputProps("targetClassId")}
          error={classes.isError ? classes.error.message : form.errors.targetClassId}
        />

        <Textarea
          label="Alasan pemindahan"
          description="Tercatat di log aktivitas kelas asal dan kelas tujuan."
          placeholder="Contoh: naik level setelah lulus ujian A2."
          autosize
          minRows={2}
          withAsterisk
          {...form.getInputProps("reason")}
        />

        {isOverCapacity && target && (
          <CapacityWarning
            className={target.name}
            seats={seats}
            chosen={chosen}
            checked={form.values.isOverCapacityConfirmed}
            onChange={(checked) => form.setFieldValue("isOverCapacityConfirmed", checked)}
            consent="Saya tetap memindahkan siswa melebihi kapasitas."
          />
        )}

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
            {isPending ? "Menyimpan..." : `Pindahkan ${chosen > 0 ? `${chosen} Siswa` : "Siswa"}`}
          </button>
        </Group>
      </form>
    </Modal>
  )
}

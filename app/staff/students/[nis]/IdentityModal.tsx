"use client"

import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { IdentityFieldInput } from "@/src/components/ui/IdentityFieldInput"
import { updateIdentity } from "@/src/entities/student/actions"
import {
  identityFormSchema,
  type IdentityFieldSpec,
  type IdentityForm,
  type IdentityValues,
  type StudentDetail,
} from "@/src/entities/student/schema"
import type { ActionResult } from "@/src/lib/api/errors"
import { useActionForm } from "@/src/lib/use-action-form"

const NOTHING_CHANGED: ActionResult = { ok: true, data: null }

const textOf = (value: string | number | null) => (value === null ? "" : String(value))

function apiValueOf(field: IdentityFieldSpec, text: string | null): string | number | null {
  const value = (text ?? "").trim()
  if (value === "") return null
  return field.input === "number" ? Number(value) : value
}

function changesOf(
  fields: readonly IdentityFieldSpec[],
  form: IdentityForm,
  identity: IdentityValues,
): Partial<IdentityValues> {
  return Object.fromEntries(
    fields
      .filter((field) => (form[field.key] ?? "").trim() !== textOf(identity[field.key]))
      .map((field) => [field.key, apiValueOf(field, form[field.key] ?? null)]),
  )
}

export function IdentityModal({
  student,
  title,
  fields,
  onClose,
}: {
  student: StudentDetail
  title: string
  fields: readonly IdentityFieldSpec[]
  onClose: () => void
}) {
  const form = useForm<IdentityForm>({
    initialValues: Object.fromEntries(
      fields.map((field) => [field.key, textOf(student.identity[field.key])]),
    ),
    validate: schemaResolver(identityFormSchema(fields), { sync: true }),
    validateInputOnBlur: true,
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => {
      const changes = changesOf(fields, values, student.identity)
      return Object.keys(changes).length === 0
        ? Promise.resolve(NOTHING_CHANGED)
        : updateIdentity(student.nis, changes)
    },
    successMessage: `${title} ${student.name} disimpan.`,
    invalidates: [["students"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`Edit ${title}`}
      size="lg"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        {fields.map((field) => (
          <div key={field.key}>
            <IdentityFieldInput field={field} inputProps={form.getInputProps(field.key)} />
          </div>
        ))}
      </div>
    </FormModal>
  )
}

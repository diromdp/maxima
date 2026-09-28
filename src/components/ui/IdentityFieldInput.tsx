"use client"

import { Select, Textarea, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import type { GetInputPropsReturnType } from "@mantine/form"

import { PhoneInput } from "@/src/components/ui/PhoneInput"
import type { IdentityFieldSpec } from "@/src/entities/student/schema"

const ANREDE = ["Herr", "Frau"]
const GENDERS = ["Laki-laki", "Perempuan"]

export function IdentityFieldInput({
  field,
  label = field.label,
  description,
  isRequired = field.key === "fullName",
  inputProps,
}: {
  field: IdentityFieldSpec
  label?: string
  description?: string
  isRequired?: boolean
  inputProps: GetInputPropsReturnType
}) {
  const props = { label, description, withAsterisk: isRequired, ...inputProps }
  if (field.input === "anrede" || field.input === "gender") {
    return (
      <Select
        {...props}
        data={field.input === "anrede" ? ANREDE : GENDERS}
        placeholder="Pilih"
        clearable
      />
    )
  }
  if (field.input === "date") {
    return (
      <DatesProvider settings={{ locale: "id" }}>
        <DateInput {...props} valueFormat="DD MMMM YYYY" placeholder="Pilih tanggal" clearable />
      </DatesProvider>
    )
  }
  if (field.input === "textarea") return <Textarea {...props} autosize minRows={2} />
  if (field.input === "phone") return <PhoneInput {...props} value={props.value ?? ""} />
  return <TextInput {...props} inputMode={field.input === "number" ? "numeric" : undefined} />
}

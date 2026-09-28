import { TextInput, type TextInputProps } from "@mantine/core"

export const PHONE_PATTERN = /^08\d{8,11}$/
export const PHONE_RULE =
  "Nomor HP harus diawali 08 dan berisi 10 sampai 13 angka, contoh 081234567890."
const PHONE_MAX_DIGITS = 13

export function PhoneInput({
  onChange,
  ...props
}: Omit<TextInputProps, "onChange"> & { onChange?: (value: string) => void }) {
  return (
    <TextInput
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="08xxxxxxxxxx"
      maxLength={PHONE_MAX_DIGITS}
      {...props}
      onChange={(event) => onChange?.(event.currentTarget.value.replace(/\D/g, ""))}
    />
  )
}

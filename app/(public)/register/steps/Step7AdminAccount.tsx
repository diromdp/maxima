import { PasswordInput, Stack, Text, TextInput } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form"

import type { RegistrationValues } from "../data"

export function Step7AdminAccount({ form }: { form: UseFormReturnType<RegistrationValues> }) {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Buat akun email khusus admission untuk proses pengajuan visa dan dokumen ke Jerman. Email
        dan password ini akan digunakan untuk login ke portal pengajuan visa.
      </Text>

      <TextInput
        label="Email Khusus Admission"
        withAsterisk
        placeholder="contoh: nama.admission@email.com"
        description="Gunakan email khusus untuk proses admission, bukan email pribadi."
        type="email"
        {...form.getInputProps("adminEmail")}
      />

      <PasswordInput
        label="Password Khusus Admission"
        withAsterisk
        placeholder="8 sampai 16 karakter"
        description="Pola tetap: 8–16 karakter, kombinasi huruf besar, huruf kecil, dan angka."
        autoComplete="new-password"
        {...form.getInputProps("adminPassword")}
      />

      <PasswordInput
        label="Konfirmasi Password"
        withAsterisk
        placeholder="Ketik ulang password"
        autoComplete="new-password"
        {...form.getInputProps("adminPasswordConfirm")}
      />
    </Stack>
  )
}

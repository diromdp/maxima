"use client"

import { Anchor, Button, PasswordInput, Stack } from "@mantine/core"
import { useActionState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { resetPassword, type FormResult } from "@/src/lib/auth/actions"
import { STUDENT_LOGIN } from "@/src/lib/auth/paths"

export function PasswordResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(resetPassword, undefined)

  if (state && "done" in state) {
    return (
      <Stack gap="md">
        <Notice tone="success">Kata sandi sudah diganti. Masuk dengan kata sandi baru.</Notice>
        <Anchor href={STUDENT_LOGIN} size="sm" fw={600} c="var(--ink)">
          Masuk sebagai siswa
        </Anchor>
      </Stack>
    )
  }

  return (
    <form action={action}>
      <Stack gap="md">
        {state && "error" in state && <Notice tone="danger">{state.error}</Notice>}
        <input type="hidden" name="token" value={token} />
        <PasswordInput
          name="password"
          label="Kata Sandi Baru"
          description="Minimal delapan karakter."
          autoComplete="new-password"
        />
        <PasswordInput
          name="confirmation"
          label="Ulangi Kata Sandi Baru"
          autoComplete="new-password"
        />
        <Button type="submit" loading={pending} fullWidth mt="xs">
          Simpan Kata Sandi
        </Button>
      </Stack>
    </form>
  )
}

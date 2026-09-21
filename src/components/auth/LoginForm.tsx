"use client"

import { Button, PasswordInput, Stack, TextInput } from "@mantine/core"
import { useActionState } from "react"

import { login, type LoginResult } from "@/src/lib/auth/actions"
import { Notice } from "@/src/components/ui/Notice"
import type { SessionKind } from "@/src/lib/auth/session"

export function LoginForm({
  kind,
  next,
  identityLabel = "Email",
  identityPlaceholder,
}: {
  kind: SessionKind
  next?: string
  identityLabel?: string
  identityPlaceholder?: string
}) {
  const [state, action, pending] = useActionState<LoginResult, FormData>(login, undefined)

  return (
    <form action={action}>
      <Stack gap="md">
        {state?.error && <Notice tone="danger">{state.error}</Notice>}

        <input type="hidden" name="next" value={next ?? ""} />
        <input type="hidden" name="kind" value={kind} />

        <TextInput
          name="identity"
          label={identityLabel}
          placeholder={identityPlaceholder}
          autoComplete="username"
        />

        <PasswordInput
          name="password"
          label="Kata Sandi"
          placeholder="Masukkan kata sandi"
          autoComplete="current-password"
        />

        <Button type="submit" loading={pending} fullWidth mt="xs">
          Masuk
        </Button>
      </Stack>
    </form>
  )
}

"use client"

import { Anchor, Button, PasswordInput, Stack, TextInput } from "@mantine/core"
import { useActionState } from "react"

import { login, type FormResult } from "@/src/lib/auth/actions"
import { Notice } from "@/src/components/ui/Notice"
import type { SessionKind } from "@/src/lib/auth/paths"

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
  const [state, action, pending] = useActionState<FormResult, FormData>(login, undefined)

  return (
    <form action={action}>
      <Stack gap="md">
        {state && "error" in state && <Notice tone="danger">{state.error}</Notice>}

        <input type="hidden" name="next" value={next ?? ""} />
        <input type="hidden" name="kind" value={kind} />

        <TextInput
          name="email"
          type="email"
          label={identityLabel}
          placeholder={identityPlaceholder}
          autoComplete="email"
        />

        <PasswordInput
          name="password"
          label="Kata Sandi"
          placeholder="Masukkan kata sandi"
          autoComplete="current-password"
        />

        <Anchor href={`/forgot-password?kind=${kind}`} size="sm" c="dimmed" ta="right">
          Lupa kata sandi?
        </Anchor>

        <Button type="submit" loading={pending} fullWidth mt="xs">
          Masuk
        </Button>
      </Stack>
    </form>
  )
}

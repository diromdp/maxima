"use client"

import { Button, Stack, TextInput } from "@mantine/core"
import { useActionState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { requestPasswordReset, type FormResult } from "@/src/lib/auth/actions"
import type { SessionKind } from "@/src/lib/auth/paths"

export function PasswordRequestForm({ kind }: { kind: SessionKind }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(
    requestPasswordReset,
    undefined,
  )

  if (state && "done" in state) {
    return (
      <Notice tone="success">
        Bila email itu terdaftar, tautan untuk mengganti kata sandi sudah kami kirim. Tautannya
        berlaku satu jam.
      </Notice>
    )
  }

  return (
    <form action={action}>
      <Stack gap="md">
        {state && "error" in state && <Notice tone="danger">{state.error}</Notice>}
        <input type="hidden" name="kind" value={kind} />
        <TextInput
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          autoComplete="email"
        />
        <Button type="submit" loading={pending} fullWidth mt="xs">
          Kirim Tautan
        </Button>
      </Stack>
    </form>
  )
}

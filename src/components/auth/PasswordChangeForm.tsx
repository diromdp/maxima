"use client"

import { PasswordInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useRouter } from "next/navigation"

import { Notice } from "@/src/components/ui/Notice"
import { changeOwnPassword } from "@/src/lib/auth/actions"
import { MIN_PASSWORD_LENGTH, type PasswordForm, passwordFormSchema } from "@/src/lib/auth/password"
import type { SessionKind } from "@/src/lib/auth/paths"
import { useActionForm } from "@/src/lib/use-action-form"

export function PasswordChangeForm({
  kind,
  onCancel,
}: {
  kind: SessionKind
  onCancel?: () => void
}) {
  const router = useRouter()
  const form = useForm<PasswordForm>({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validate: schemaResolver(passwordFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: changeOwnPassword,
    successMessage: "Kata sandi diganti. Masuk lagi dengan kata sandi baru.",
    onSuccess: () => router.replace(`/auth/signout?kind=${kind}`),
  })

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {formError && <Notice tone="danger">{formError}</Notice>}
      <PasswordInput
        label="Kata sandi saat ini"
        autoComplete="current-password"
        {...form.getInputProps("currentPassword")}
      />
      <PasswordInput
        label="Kata sandi baru"
        description={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}
        autoComplete="new-password"
        {...form.getInputProps("newPassword")}
      />
      <PasswordInput
        label="Ulangi kata sandi baru"
        autoComplete="new-password"
        {...form.getInputProps("confirmPassword")}
      />
      <p className="caption text-muted" style={{ margin: 0 }}>
        Setelah diganti, Anda keluar dari semua perangkat dan masuk lagi dengan kata sandi baru.
      </p>
      <div className="row justify-end" style={{ gap: 8 }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Batal
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Mengganti" : "Ganti Kata Sandi"}
        </button>
      </div>
    </form>
  )
}

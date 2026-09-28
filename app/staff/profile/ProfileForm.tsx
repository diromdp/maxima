"use client"

import { TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useRouter } from "next/navigation"

import { useActionForm } from "@/src/lib/use-action-form"

import { saveOwnProfile } from "./actions"
import { profileFormSchema, type ProfileForm as ProfileValues } from "./forms"

type AccountRow = { readonly label: string; readonly value: string }

export function ProfileForm({
  name,
  accountRows,
}: {
  name: string
  accountRows: readonly AccountRow[]
}) {
  const router = useRouter()
  const form = useForm<ProfileValues>({
    initialValues: { name },
    validate: schemaResolver(profileFormSchema, { sync: true }),
  })
  const { submit, isPending } = useActionForm({
    form,
    action: saveOwnProfile,
    successMessage: "Nama disimpan.",
    onSuccess: (saved) => {
      form.resetDirty({ name: saved.name })
      router.refresh()
    },
  })

  return (
    <section className="card stack" aria-labelledby="account-heading">
      <h2 className="h5" id="account-heading">
        Data akun
      </h2>

      <form className="stack" onSubmit={submit} noValidate>
        <TextInput
          label="Nama"
          description="Nama ini tampil di menu akun dan di Log Aktivitas."
          autoComplete="name"
          maxLength={120}
          {...form.getInputProps("name")}
        />
        <div className="row justify-end">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan" : "Simpan Nama"}
          </button>
        </div>
      </form>

      <dl style={{ margin: 0 }}>
        {accountRows.map(({ label, value }) => (
          <div key={label} className="spec-row">
            <dt className="spec-name">{label}</dt>
            <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="caption text-muted" style={{ margin: 0 }}>
        Surel, peran, dan cabang diatur admin di Pengaturan, Pengguna & Hak Akses.
      </p>
    </section>
  )
}

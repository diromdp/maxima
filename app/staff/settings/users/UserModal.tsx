"use client"

import {
  Checkbox,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  TextInput,
} from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { saveUser } from "@/src/entities/user/actions"
import {
  ACCESS_GRANT,
  type BranchRow,
  type RoleRow,
  type UserForm,
  userFormSchema,
  type UserRow,
} from "@/src/entities/user/schema"
import { useActionForm } from "@/src/lib/use-action-form"

const ALL_BRANCHES = "all"
const validateUser = schemaResolver(userFormSchema, { sync: true })

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const ROLE_LOCKED =
  "Mengganti peran butuh kewenangan Memberi hak akses. Minta super admin atau General Admin."

const formOf = (user: UserRow | undefined): UserForm => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  password: "",
  roleId: user?.role?.id ?? "",
  isActive: user ? user.status === "Aktif" : true,
  branchIds: user?.branches.map((branch) => branch.id) ?? [],
})

export function UserModal({
  initial,
  roles,
  branches,
  canGrant,
  isSuperAdmin,
  onClose,
}: {
  initial?: UserRow
  roles: readonly RoleRow[]
  branches: readonly BranchRow[]
  canGrant: boolean
  isSuperAdmin: boolean
  onClose: () => void
}) {
  const initialValues = formOf(initial)
  const form = useForm<UserForm>({
    initialValues,
    validate: (values) => ({
      ...validateUser(values),
      ...(initial || values.password ? {} : { password: "Isi kata sandi awal pengguna." }),
    }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveUser(initial?.id ?? null, values, initial ? initialValues : null),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Pengguna baru disimpan.",
    invalidates: [["users"], ["roles"]],
    onSuccess: onClose,
  })

  const roleOptions = roles
    .filter(
      (role) =>
        (role.status === "Aktif" || role.id === initial?.role?.id) &&
        (isSuperAdmin || !role.capabilities.includes(ACCESS_GRANT)),
    )
    .map((role) => ({ value: role.id, label: role.name }))

  return (
    <Modal
      opened
      onClose={onClose}
      title={initial ? `Ubah Pengguna ${initial.name}` : "Tambah Pengguna"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit}>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <div className="grid-2">
          <TextInput
            label="Nama"
            placeholder="Nama depan atau panggilan"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            type="email"
            label="Email"
            placeholder="nama@maxima.co.id"
            withAsterisk
            {...form.getInputProps("email")}
          />
        </div>

        <PasswordInput
          label={initial ? "Kata Sandi Baru" : "Kata Sandi"}
          placeholder={initial ? "Kosongkan bila tidak diganti" : "Minimal 8 karakter"}
          description={
            initial
              ? "Pengguna menerima surel pemberitahuan bila kata sandinya diganti."
              : "Sampaikan kata sandi ini ke pengguna; ia dapat menggantinya sendiri nanti."
          }
          autoComplete="new-password"
          withAsterisk={!initial}
          {...form.getInputProps("password")}
        />

        <Select
          label="Peran"
          placeholder="Pilih peran"
          data={roleOptions}
          disabled={!canGrant}
          description={canGrant ? undefined : ROLE_LOCKED}
          withAsterisk
          {...form.getInputProps("roleId")}
        />

        <MultiSelect
          label="Cakupan cabang"
          description="Pilih Semua cabang bila pengguna boleh melihat seluruh cabang, termasuk cabang yang ditambah nanti."
          data={[
            { value: ALL_BRANCHES, label: "Semua cabang" },
            ...branches.map((branch) => ({ value: branch.id, label: branch.name })),
          ]}
          value={form.values.branchIds.length === 0 ? [ALL_BRANCHES] : form.values.branchIds}
          onChange={(next) =>
            form.setFieldValue(
              "branchIds",
              next.at(-1) === ALL_BRANCHES ? [] : next.filter((value) => value !== ALL_BRANCHES),
            )
          }
          error={form.errors.branchIds}
        />

        <Checkbox
          label="Aktif"
          description="Pengguna nonaktif tidak bisa masuk, datanya tetap tersimpan."
          {...form.getInputProps("isActive", { type: "checkbox" })}
        />

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Pengguna"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}

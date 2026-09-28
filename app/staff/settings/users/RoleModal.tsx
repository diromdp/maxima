"use client"

import { Checkbox, Group, Modal, Select, Textarea, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { saveRole } from "@/src/entities/user/actions"
import {
  ACCESS_GRANT,
  CAPABILITIES,
  HOME_AREAS,
  type PageRow,
  type RoleForm,
  roleFormSchema,
  type RoleRow,
  SCOPES,
} from "@/src/entities/user/schema"
import type { Access } from "@/src/lib/auth/permissions"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const GRANT_ONLY_SUPER_ADMIN = "Hanya super admin yang dapat memberikan kewenangan ini"

const formOf = (role: RoleRow | undefined): RoleForm => ({
  name: role?.name ?? "",
  description: role?.description ?? "",
  homeArea: role?.homeArea ?? null,
  scope: role?.scope ?? "branch",
  isActive: role ? role.status === "Aktif" : true,
  permissions: role?.permissions ?? {},
  capabilities: role?.capabilities ?? [],
})

function nextAccess(current: Access | undefined, box: Access, isChecked: boolean) {
  if (box === "edit") return isChecked ? "edit" : current ? "view" : undefined
  return isChecked ? (current ?? "view") : undefined
}

export function RoleModal({
  initial,
  pages,
  isSuperAdmin,
  onClose,
}: {
  initial?: RoleRow
  pages: readonly PageRow[]
  isSuperAdmin: boolean
  onClose: () => void
}) {
  const form = useForm<RoleForm>({
    initialValues: formOf(initial),
    validate: schemaResolver(roleFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveRole(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan peran ${initial.name} disimpan.` : "Peran baru disimpan.",
    invalidates: [["roles"], ["users"]],
    onSuccess: onClose,
  })

  const permissions = form.values.permissions
  const groups = [...new Set(pages.map((page) => page.menuGroup))]

  const setAccess = (code: string, box: Access, isChecked: boolean) => {
    const next = { ...permissions }
    const value = nextAccess(permissions[code], box, isChecked)
    if (value) next[code] = value
    else delete next[code]
    form.setFieldValue("permissions", next)
  }

  const toggleCapability = (capability: string, isChecked: boolean) =>
    form.setFieldValue(
      "capabilities",
      isChecked
        ? [...form.values.capabilities, capability]
        : form.values.capabilities.filter((entry) => entry !== capability),
    )

  return (
    <Modal
      opened
      onClose={onClose}
      title={initial ? `Ubah Peran ${initial.name}` : "Tambah Peran"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit}>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <TextInput
          label="Nama Peran"
          placeholder="Contoh: Staf Admisi Cabang"
          withAsterisk
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Deskripsi"
          placeholder="Siapa yang memakai peran ini dan apa batasnya"
          autosize
          minRows={2}
          {...form.getInputProps("description")}
        />

        <div className="grid-2">
          <Select
            label="Wilayah Utama"
            placeholder="Tanpa wilayah utama"
            data={[...HOME_AREAS]}
            clearable
            {...form.getInputProps("homeArea")}
          />
          <Select
            label="Cakupan Baris"
            data={[...SCOPES]}
            withAsterisk
            allowDeselect={false}
            {...form.getInputProps("scope")}
          />
        </div>

        <div className="stack stack-sm">
          <div className="row row-between">
            <span className="label">Hak Akses</span>
            <span className="caption text-muted tabular">
              {Object.keys(permissions).length} dari {pages.length} halaman
            </span>
          </div>

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Halaman</th>
                  <th scope="col" className="numeric">
                    Lihat
                  </th>
                  <th scope="col" className="numeric">
                    Ubah
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <RowGroup key={group ?? "root"} title={group}>
                    {pages
                      .filter((page) => page.menuGroup === group)
                      .map((page) => {
                        const level = permissions[page.code]
                        return (
                          <tr key={page.code}>
                            <td>{page.label}</td>
                            <td className="numeric">
                              <Checkbox
                                aria-label={`Lihat ${page.label}`}
                                checked={level !== undefined}
                                onChange={(e) =>
                                  setAccess(page.code, "view", e.currentTarget.checked)
                                }
                                style={{ display: "inline-flex" }}
                              />
                            </td>
                            <td className="numeric">
                              <Checkbox
                                aria-label={`Ubah ${page.label}`}
                                checked={level === "edit"}
                                onChange={(e) =>
                                  setAccess(page.code, "edit", e.currentTarget.checked)
                                }
                                style={{ display: "inline-flex" }}
                              />
                            </td>
                          </tr>
                        )
                      })}
                  </RowGroup>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stack stack-sm">
          <span className="label">Kemampuan</span>
          <div className="grid-2">
            {CAPABILITIES.map(({ value, label }) => {
              const isGrant = value === ACCESS_GRANT
              return (
                <Checkbox
                  key={value}
                  label={label}
                  description={isGrant && !isSuperAdmin ? GRANT_ONLY_SUPER_ADMIN : undefined}
                  disabled={isGrant && !isSuperAdmin}
                  checked={form.values.capabilities.includes(value)}
                  onChange={(e) => toggleCapability(value, e.currentTarget.checked)}
                />
              )
            })}
          </div>
        </div>

        <Checkbox
          label="Aktif"
          description="Peran nonaktif tidak dapat dipilih untuk pengguna baru."
          {...form.getInputProps("isActive", { type: "checkbox" })}
        />

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Peran"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}

function RowGroup({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <>
      {title && (
        <tr>
          <td colSpan={3} className="label text-muted">
            {title}
          </td>
        </tr>
      )}
      {children}
    </>
  )
}

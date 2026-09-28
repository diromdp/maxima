"use client"

import { FileInput, Select, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import {
  confirmContractDocument,
  createContract,
  presignContractDocument,
} from "@/src/entities/registration/actions"
import { registrationOptionsQuery } from "@/src/entities/registration/queries"
import { newContractFormSchema, type NewContractForm } from "@/src/entities/registration/schema"
import { studentsQuery } from "@/src/entities/student/queries"
import { failureOf, type ActionResult } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { SEARCH_DELAY_MS } from "@/src/lib/list-query"
import { notify } from "@/src/lib/notify"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const CONTRACT_FILE_FIELD = "contractFile"

async function uploadContract(
  nis: string,
  file: File,
): Promise<ActionResult<{ contractNumber: string }>> {
  if (!isUploadable(file)) return failureOf(UPLOAD_RULE, CONTRACT_FILE_FIELD)
  const target = await presignContractDocument(nis, file.type, file.size)
  if (!target.ok) return target
  if (!(await putToStorage(target.data, file))) return failureOf(UPLOAD_FAILED, CONTRACT_FILE_FIELD)
  return confirmContractDocument(nis, file.name)
}

export function NewContractButton() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        Kontrak Baru
      </button>
      {isOpen && <NewContractModal onClose={() => setIsOpen(false)} />}
    </>
  )
}

const PICKER_SIZE = 10

function StudentPicker({
  value,
  error,
  isDisabled,
  onChange,
}: {
  value: string
  error: React.ReactNode
  isDisabled: boolean
  onChange: (nis: string) => void
}) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{ value: string; label: string } | null>(null)
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DELAY_MS)
  const students = useRead(
    studentsQuery({
      page: 1,
      perPage: PICKER_SIZE,
      search: debouncedSearch.trim() || undefined,
      hasNis: "true",
    }),
  )

  const found = (students.data?.data ?? []).flatMap((student) =>
    student.nis ? [{ value: student.nis, label: `${student.name} · ${student.nis}` }] : [],
  )
  const data =
    selected && !found.some((option) => option.value === selected.value)
      ? [selected, ...found]
      : found

  return (
    <Select
      label="Siswa"
      description="Cari nama atau NIS. NIS diambil dari data siswa, tidak diketik."
      placeholder="Cari siswa"
      withAsterisk
      searchable
      clearable
      data-autofocus
      disabled={isDisabled}
      data={data}
      filter={({ options }) => options}
      searchValue={search}
      onSearchChange={setSearch}
      nothingFoundMessage={
        students.isError
          ? students.error.message
          : students.isPending
            ? "Memuat..."
            : "Tidak ada siswa yang cocok."
      }
      value={value || null}
      onChange={(nis, option) => {
        setSelected(nis ? option : null)
        onChange(nis ?? "")
      }}
      error={error}
    />
  )
}

function NewContractModal({ onClose }: { onClose: () => void }) {
  const options = useRead(registrationOptionsQuery())
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [createdFor, setCreatedFor] = useState<string | null>(null)
  const form = useForm<NewContractForm>({
    initialValues: { nis: "", packageId: "", promoCode: "" },
    validate: schemaResolver(newContractFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values): Promise<ActionResult<string | null>> => {
      const nis = values.nis.trim()
      if (createdFor !== nis) {
        const created = await createContract(nis, values.packageId, values.promoCode.trim() || null)
        if (!created.ok) return created
        setCreatedFor(nis)
      }
      if (!contractFile) return { ok: true, data: null }
      const uploaded = await uploadContract(nis, contractFile)
      if (!uploaded.ok) {
        return failureOf(
          `Kontrak baru sudah dibuat, tetapi Surat Kontrak belum tersimpan: ${uploaded.message} Pilih berkasnya lagi lalu Simpan.`,
          CONTRACT_FILE_FIELD,
        )
      }
      return { ok: true, data: uploaded.data.contractNumber }
    },
    successMessage: "Kontrak baru disimpan.",
    invalidates: [["students"]],
    onSuccess: (contractNumber) => {
      if (contractNumber) notify.success(`No Kontrak ${contractNumber} terbit.`)
      onClose()
    },
  })

  return (
    <FormModal
      title="Kontrak Baru"
      submitLabel="Simpan Kontrak"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <p className="body-sm text-muted">
        Untuk siswa ber-NIS yang kontrak sebelumnya sudah selesai. No Kontrak terbit saat Surat
        Kontrak diunggah.
      </p>
      <StudentPicker
        value={form.values.nis}
        error={form.errors.nis}
        isDisabled={createdFor !== null}
        onChange={(nis) => form.setFieldValue("nis", nis)}
      />
      <Select
        label="Paket"
        placeholder="Pilih paket"
        searchable
        withAsterisk
        disabled={createdFor !== null}
        data={(options.data?.packages ?? []).map((pkg) => ({ value: pkg.id, label: pkg.name }))}
        {...form.getInputProps("packageId")}
      />
      <TextInput
        label="Kode Promo"
        placeholder="Kosongkan jika tidak ada"
        disabled={createdFor !== null}
        {...form.getInputProps("promoCode")}
      />
      <FileInput
        label="Surat Kontrak"
        description="Boleh menyusul. PDF, JPG, atau PNG paling besar 5 MB."
        placeholder="Pilih berkas"
        accept={UPLOAD_ACCEPT}
        clearable
        value={contractFile}
        onChange={setContractFile}
        error={form.errors[CONTRACT_FILE_FIELD]}
      />
    </FormModal>
  )
}

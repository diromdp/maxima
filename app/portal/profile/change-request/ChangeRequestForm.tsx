"use client"

import { FileInput, Select, Skeleton, Stack, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { IdentityFieldInput } from "@/src/components/ui/IdentityFieldInput"
import { Notice } from "@/src/components/ui/Notice"
import { presignProfileEvidence, requestProfileChange } from "@/src/entities/portal/actions"
import { portalProfileQuery } from "@/src/entities/portal/queries"
import {
  changeRequestFormSchema,
  identitySpecOf,
  PROFILE_FIELDS,
  type PortalProfile,
  type ProfileField,
} from "@/src/entities/portal/schema"
import { type ActionResult, failureOf } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateLong, formatFileSize } from "@/src/lib/format"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

import { NOT_CHANGEABLE_HERE, ON_LEAVE_BLOCK } from "../profile"

const EVIDENCE_FIELD = "evidence"

const STEPS = [
  "Pilih data yang ingin diubah, lalu tulis nilai barunya dan alasannya.",
  "Cabang memeriksa pengajuan Anda. Lampirkan berkas pendukung bila perubahannya menyangkut dokumen resmi, misalnya KTP, akta, atau ijazah.",
  "Kalau disetujui, Profil ikut berubah dan tercatat di log aktivitas. Kalau ditolak, alasannya tampil di Profil.",
] as const

type ChangeRequestValues = {
  field: ProfileField | null
  proposedValue: string | null
  reason: string
}

function currentValueOf(profile: PortalProfile, field: ProfileField): string {
  const value = profile.identity[field]
  if (!value) return "Belum diisi"
  return identitySpecOf(field).input === "date" ? formatDateLong(value) : value
}

async function uploadEvidence(file: File): Promise<ActionResult<string>> {
  if (!isUploadable(file)) return failureOf(UPLOAD_RULE, EVIDENCE_FIELD)
  const presigned = await presignProfileEvidence({ mimeType: file.type, sizeBytes: file.size })
  if (!presigned.ok) return presigned
  if (!(await putToStorage(presigned.data, file))) return failureOf(UPLOAD_FAILED, EVIDENCE_FIELD)
  return { ok: true, data: presigned.data.evidenceId }
}

function RequestForm({ profile, isOnLeave }: { profile: PortalProfile; isOnLeave: boolean }) {
  const router = useRouter()
  const [evidence, setEvidence] = useState<File | null>(null)
  const canAttach = profile.nis !== null
  const pendingFields = new Set(
    profile.changeRequests
      .filter((request) => request.status === "Menunggu")
      .map((request) => request.field),
  )

  const form = useForm<ChangeRequestValues>({
    initialValues: { field: null, proposedValue: null, reason: "" },
    validate: schemaResolver(changeRequestFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values): Promise<ActionResult<PortalProfile>> => {
      const request = changeRequestFormSchema.parse(values)
      if (!evidence) return requestProfileChange(request, null)
      const uploaded = await uploadEvidence(evidence)
      if (!uploaded.ok) return uploaded
      return requestProfileChange(request, uploaded.data)
    },
    successMessage: "Pengajuan perubahan terkirim. Cabang memeriksanya, hasilnya tampil di Profil.",
    invalidates: [["portal-profile"]],
    onSuccess: () => router.push("/portal/profile"),
  })

  const { field } = form.values
  const fieldOptions = PROFILE_FIELDS.map((key) => ({
    value: key,
    label: pendingFields.has(key)
      ? `${identitySpecOf(key).label} (menunggu keputusan)`
      : identitySpecOf(key).label,
    disabled: pendingFields.has(key),
  }))

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      {isOnLeave && <Notice tone="warning">{ON_LEAVE_BLOCK}</Notice>}
      {formError && <Notice tone="danger">{formError}</Notice>}

      <section className="card stack" aria-labelledby="change-heading">
        <div className="section-head">
          <h2 className="h5" id="change-heading">
            Data yang Diubah
          </h2>
          <span className="caption text-muted">satu data per pengajuan</span>
        </div>

        <Stack gap="md">
          <Select
            label="Kolom"
            placeholder="Pilih data"
            data={fieldOptions}
            searchable
            withAsterisk
            {...form.getInputProps("field")}
            onChange={(value) =>
              form.setValues({ field: value as ProfileField | null, proposedValue: null })
            }
          />

          {field && (
            <>
              <div className="row-soft">
                <span className="spec-name">Tercatat sekarang</span>
                <span className="body-sm" style={{ fontWeight: 600 }}>
                  {currentValueOf(profile, field)}
                </span>
              </div>
              <IdentityFieldInput
                key={field}
                field={identitySpecOf(field)}
                label="Nilai Baru"
                isRequired
                inputProps={form.getInputProps("proposedValue")}
              />
            </>
          )}

          <Textarea
            label="Alasan"
            description="Singkat saja. Contoh: salah ketik saat mendaftar, pindah alamat."
            placeholder="Tulis alasannya"
            autosize
            minRows={3}
            withAsterisk
            {...form.getInputProps("reason")}
          />

          {canAttach ? (
            <FileInput
              label="Berkas Pendukung"
              description={
                evidence
                  ? `${evidence.name} · ${formatFileSize(evidence.size)}`
                  : `Boleh kosong. Lampirkan bila perubahannya menyangkut dokumen resmi. ${UPLOAD_RULE}`
              }
              placeholder="Pilih berkas"
              leftSection={<HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />}
              clearable
              accept={UPLOAD_ACCEPT}
              value={evidence}
              onChange={setEvidence}
              error={form.errors[EVIDENCE_FIELD]}
            />
          ) : (
            <span className="caption text-muted">
              Berkas pendukung dapat dilampirkan setelah NIS terbit.
            </span>
          )}
        </Stack>
      </section>

      <div className="row justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending || isOnLeave}
          title={isOnLeave ? ON_LEAVE_BLOCK : undefined}
        >
          {isPending ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </div>
    </form>
  )
}

function Guide({ consultant }: { consultant: string | null }) {
  return (
    <div className="stack stack-lg" style={{ alignSelf: "start" }}>
      <section className="card stack">
        <div className="section-head">
          <h2 className="h5">Cara kerjanya</h2>
        </div>
        <ol className="stack" style={{ margin: 0, paddingInlineStart: 20 }}>
          {STEPS.map((step) => (
            <li key={step} className="body-sm">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="card stack">
        <div className="section-head">
          <h2 className="h5">Tidak bisa diajukan dari sini</h2>
        </div>
        <ul className="stack stack-sm" style={{ margin: 0, paddingInlineStart: 20 }}>
          {NOT_CHANGEABLE_HERE.map((item) => (
            <li key={item} className="body-sm">
              {item}
            </li>
          ))}
        </ul>
        <p className="body-sm text-muted">
          Ketiganya milik Finance dan Marketing. Bicarakan dengan PIC Anda
          {consultant ? `, ${consultant}` : ""}.
        </p>
      </section>
    </div>
  )
}

export function ChangeRequestForm({ isOnLeave }: { isOnLeave: boolean }) {
  const profile = useRead(portalProfileQuery())

  if (profile.isError) {
    return <QueryError message={profile.error.message} onRetry={() => void profile.refetch()} />
  }

  return (
    <div className="grid-main-aside">
      {profile.isPending ? (
        <Skeleton height={420} radius="md" aria-hidden />
      ) : (
        <RequestForm profile={profile.data} isOnLeave={isOnLeave} />
      )}
      <Guide consultant={profile.data?.companions.pic ?? null} />
    </div>
  )
}

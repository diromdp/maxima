"use client"

import { Modal, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { rejectCertificate, verifyCertificate } from "@/src/entities/certificate/actions"
import {
  type CertificateModulesForm,
  type CertificateRow,
  modulesFormOf,
  modulesInputOf,
  rejectFormSchema,
  verifyFormSchema,
} from "@/src/entities/certificate/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { useActionForm } from "@/src/lib/use-action-form"

import { ModuleFields } from "./ModuleFields"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

type VerifyForm = { modules: CertificateModulesForm }

export function VerifyModal({
  certificate,
  onClose,
}: {
  certificate: CertificateRow
  onClose: () => void
}) {
  const [isRejecting, setIsRejecting] = useState(false)
  const proposed = modulesFormOf(certificate.modules)
  const verifyForm = useForm<VerifyForm>({
    initialValues: { modules: proposed },
    validate: schemaResolver(verifyFormSchema, { sync: true }),
  })
  const rejectForm = useForm<{ reason: string }>({
    initialValues: { reason: "" },
    validate: schemaResolver(rejectFormSchema, { sync: true }),
  })
  const isCorrected = JSON.stringify(verifyForm.values.modules) !== JSON.stringify(proposed)

  const verify = useActionForm({
    form: verifyForm,
    action: (values) =>
      verifyCertificate(certificate.id, isCorrected ? modulesInputOf(values.modules) : undefined),
    successMessage: `Sertifikat ${certificate.student.name} terverifikasi.`,
    invalidates: [["certificates"]],
    onSuccess: onClose,
  })
  const reject = useActionForm({
    form: rejectForm,
    action: (values) => rejectCertificate(certificate.id, values.reason),
    successMessage: `Usulan sertifikat ${certificate.student.name} ditolak.`,
    invalidates: [["certificates"]],
    onSuccess: onClose,
  })
  const isPending = verify.isPending || reject.isPending
  const formError = verify.formError ?? reject.formError

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Periksa usulan ${certificate.student.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <div className="stack stack-lg">
        <Notice tone="info">
          Cocokkan angka usulan siswa dengan berkas aslinya. Perbaiki hanya angka yang tidak cocok,
          lalu tekan Verifikasi.
        </Notice>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
          {[
            ["NIS", certificate.student.nis ?? "-"],
            ["Jenis", certificate.kind.name],
            ["Level", certificate.level.name],
          ].map(([label, value]) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">{label}</dt>
              <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
          <div className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">Berkas</dt>
            <dd style={{ margin: 0 }}>
              {certificate.hasFile ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void previewPresigned(`/certificates/${certificate.id}/file`)}
                >
                  Buka berkas
                </button>
              ) : (
                <span className="body-sm text-muted">Tidak ada berkas</span>
              )}
            </dd>
          </div>
        </dl>

        {isRejecting ? (
          <form className="stack stack-lg" onSubmit={reject.submit} noValidate>
            <Textarea
              label="Alasan penolakan"
              description="Dibaca siswa di portalnya. Berkas usulannya ikut dihapus, dan siswa boleh mengusulkan ulang."
              autosize
              minRows={3}
              withAsterisk
              data-autofocus
              {...rejectForm.getInputProps("reason")}
            />
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isPending}
                onClick={() => setIsRejecting(false)}
              >
                Kembali
              </button>
              <button type="submit" className="btn btn-danger" disabled={isPending}>
                {reject.isPending ? "Menyimpan..." : "Tolak Usulan"}
              </button>
            </div>
          </form>
        ) : (
          <form className="stack stack-lg" onSubmit={verify.submit} noValidate>
            <ModuleFields
              modules={verifyForm.values.modules}
              errors={verifyForm.errors}
              onChange={(modules) => verifyForm.setFieldValue("modules", modules)}
            />
            {isCorrected && (
              <span className="caption text-warning">
                Angka usulan diperbaiki; yang tersimpan angka di atas.
              </span>
            )}
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="btn btn-danger-soft"
                disabled={isPending}
                onClick={() => setIsRejecting(true)}
              >
                Tolak
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {verify.isPending ? "Menyimpan..." : "Verifikasi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

"use client"

import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileInput } from "@mantine/core"
import Image from "next/image"
import { useEffect, useMemo } from "react"

import { formatFileSize } from "@/src/lib/format"

const MAX_BYTES = 2 * 1024 * 1024
const RULE = `PNG atau JPG, maksimal ${formatFileSize(MAX_BYTES)}.`

export function SignaturePad({
  signature,
  onChange,
}: {
  signature: File | null
  onChange: (file: File | null) => void
}) {
  const previewUrl = useMemo(() => (signature ? URL.createObjectURL(signature) : null), [signature])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  return (
    <div className="stack stack-sm">
      <FileInput
        label="Tanda Tangan Digital"
        withAsterisk
        description={
          signature
            ? `${signature.name} · ${formatFileSize(signature.size)}`
            : `Foto atau pindaian tanda tangan siswa di atas kertas putih. ${RULE}`
        }
        placeholder="Pilih berkas tanda tangan"
        leftSection={<HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />}
        accept="image/png,image/jpeg"
        clearable
        value={signature}
        onChange={onChange}
        error={signature && signature.size > MAX_BYTES ? `Berkas terlalu besar. ${RULE}` : null}
      />
      {previewUrl && (
        <div
          className="card-soft"
          style={{ padding: 12, display: "flex", justifyContent: "center" }}
        >
          <Image
            src={previewUrl}
            alt="Pratinjau tanda tangan"
            width={400}
            height={140}
            unoptimized
            style={{ height: 140, width: "auto", maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  )
}

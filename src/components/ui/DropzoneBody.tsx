import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Progress } from "@mantine/core"

export function DropzoneBody({
  prompt,
  rule,
  progress = null,
}: {
  prompt?: string
  rule: string
  progress?: number | null
}) {
  return (
    <div className="stack items-center py-4 text-center" style={{ gap: 4 }}>
      <span className="text-muted">
        <HugeiconsIcon icon={Upload04Icon} size={24} strokeWidth={1.5} />
      </span>
      <span className="body-sm">{prompt ?? "Pilih berkas atau seret ke sini"}</span>
      <span className="caption text-muted">{rule}</span>
      {progress !== null && (
        <div className="stack stack-sm w-full" style={{ maxWidth: 320, marginTop: 8 }}>
          <Progress value={progress} size="sm" radius="xl" aria-label="Kemajuan unggah" />
          <span className="caption text-muted tabular" role="status">
            Mengunggah {progress}%
          </span>
        </div>
      )}
    </div>
  )
}

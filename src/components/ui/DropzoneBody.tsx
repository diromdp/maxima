import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function DropzoneBody({ prompt, rule }: { prompt?: string; rule: string }) {
  return (
    <div className="stack items-center py-4 text-center" style={{ gap: 4 }}>
      <span className="text-muted">
        <HugeiconsIcon icon={Upload04Icon} size={24} strokeWidth={1.5} />
      </span>
      <span className="body-sm">{prompt ?? "Pilih berkas atau seret ke sini"}</span>
      <span className="caption text-muted">{rule}</span>
    </div>
  )
}

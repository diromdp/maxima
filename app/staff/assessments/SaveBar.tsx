"use client"

export function SaveBar({
  dirtyCount,
  unit,
  label,
  readOnly,
  isPending,
  onSave,
}: {
  dirtyCount: number
  unit: string
  label: string
  readOnly: boolean
  isPending: boolean
  onSave: () => void
}) {
  if (readOnly) return null

  return (
    <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
      <span className={`caption ${dirtyCount > 0 ? "text-warning" : "text-muted"}`}>
        {dirtyCount > 0 ? `${dirtyCount} ${unit} berubah, belum disimpan` : "Tidak ada perubahan"}
      </span>
      <button
        type="button"
        className="btn btn-primary"
        disabled={dirtyCount === 0 || isPending}
        title={dirtyCount === 0 ? "Belum ada yang berubah" : undefined}
        onClick={onSave}
      >
        {isPending ? "Menyimpan..." : label}
      </button>
    </div>
  )
}

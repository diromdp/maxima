"use client"

import { Checkbox } from "@mantine/core"

import { Notice } from "@/src/components/ui/Notice"

export const TITLE_STYLE = {
  title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 },
}

export const MEMBER_INVALIDATIONS = [["classes"], ["class-members"], ["class-candidates"]] as const

export function Facts({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
      {items.map(({ label, value }) => (
        <div key={label} className="stack" style={{ gap: 2 }}>
          <dt className="caption text-muted">{label}</dt>
          <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function CapacityWarning({
  className,
  seats,
  chosen,
  checked,
  onChange,
  consent,
}: {
  className: string
  seats: number
  chosen: number
  checked: boolean
  onChange: (checked: boolean) => void
  consent: string
}) {
  return (
    <Notice tone="warning" title="Melebihi kapasitas kelas">
      <div className="stack" style={{ gap: 8 }}>
        <span>
          {className} tinggal {seats} kursi, sedang yang dipilih {chosen} siswa. Kelebihan{" "}
          {chosen - seats} siswa butuh persetujuan Anda.
        </span>
        <Checkbox
          label={consent}
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
      </div>
    </Notice>
  )
}

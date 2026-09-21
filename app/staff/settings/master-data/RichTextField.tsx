"use client"

import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRef } from "react"

// ponytail: editor WYSIWYG di atas contentEditable + execCommand, tanpa dependensi.
// Cukup untuk fase slicing (tebal, miring, garis bawah, dua jenis daftar). Ganti ke
// @mantine/tiptap saat backend butuh HTML yang bersih dan bisa divalidasi.
const TOOLS = [
  { cmd: "bold", label: "Tebal", icon: TextBoldIcon },
  { cmd: "italic", label: "Miring", icon: TextItalicIcon },
  { cmd: "underline", label: "Garis bawah", icon: TextUnderlineIcon },
  { cmd: "insertUnorderedList", label: "Daftar", icon: LeftToRightListBulletIcon },
  { cmd: "insertOrderedList", label: "Daftar bernomor", icon: LeftToRightListNumberIcon },
] as const

export function RichTextField({
  name,
  label,
  defaultValue = "",
  placeholder,
}: {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
}) {
  const hidden = useRef<HTMLInputElement>(null)
  const sync = (el: HTMLDivElement) => {
    if (hidden.current) hidden.current.value = el.innerHTML
  }

  return (
    <div className="stack" style={{ gap: 4 }}>
      <span className="field-label">{label}</span>
      <div className="stack" style={{ gap: 0 }}>
        <div
          className="row"
          role="toolbar"
          aria-label={`Format ${label}`}
          style={{ gap: 2, padding: "4px 8px", background: "var(--color-canvas-soft)" }}
        >
          {TOOLS.map((t) => (
            <button
              key={t.cmd}
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              aria-label={t.label}
              title={t.label}
              // mousedown supaya fokus dan seleksi di editor tidak hilang
              onMouseDown={(e) => {
                e.preventDefault()
                document.execCommand(t.cmd)
              }}
            >
              <HugeiconsIcon icon={t.icon} size={16} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        <div
          className="field"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label={label}
          data-placeholder={placeholder}
          style={{ minHeight: 140, borderRadius: "0 0 8px 8px" }}
          dangerouslySetInnerHTML={{ __html: defaultValue }}
          onInput={(e) => sync(e.currentTarget)}
          onBlur={(e) => sync(e.currentTarget)}
        />
      </div>
      <input ref={hidden} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  )
}

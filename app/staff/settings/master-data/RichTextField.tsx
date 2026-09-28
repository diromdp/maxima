"use client"

import {
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const TOOLS = [
  { command: "bold", label: "Tebal", icon: TextBoldIcon },
  { command: "italic", label: "Miring", icon: TextItalicIcon },
  { command: "underline", label: "Garis bawah", icon: TextUnderlineIcon },
  { command: "insertUnorderedList", label: "Daftar", icon: LeftToRightListBulletIcon },
  { command: "insertOrderedList", label: "Daftar bernomor", icon: LeftToRightListNumberIcon },
] as const

export function RichTextField({
  label,
  defaultValue = "",
  placeholder,
  error,
  onChange,
}: {
  label: string
  defaultValue?: string
  placeholder?: string
  error?: React.ReactNode
  onChange: (html: string) => void
}) {
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
          {TOOLS.map((tool) => (
            <button
              key={tool.command}
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              aria-label={tool.label}
              title={tool.label}
              onMouseDown={(event) => {
                event.preventDefault()
                document.execCommand(tool.command)
              }}
            >
              <HugeiconsIcon icon={tool.icon} size={16} strokeWidth={1.5} />
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
          aria-invalid={error ? true : undefined}
          data-placeholder={placeholder}
          style={{ minHeight: 140, borderRadius: "0 0 8px 8px" }}
          dangerouslySetInnerHTML={{ __html: defaultValue }}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      </div>
      {error && <span className="caption text-danger">{error}</span>}
    </div>
  )
}

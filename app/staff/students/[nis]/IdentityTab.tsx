"use client"

import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import {
  IDENTITY_PANELS,
  type IdentityFieldSpec,
  type StudentDetail,
} from "@/src/entities/student/schema"
import { formatDateLong } from "@/src/lib/format"

import { ChangeRequestsPanel } from "./ChangeRequestsPanel"
import { IdentityModal } from "./IdentityModal"
import { FieldValue, Panel } from "./Panel"

const DASH = "-"

type IdentityPanel = (typeof IDENTITY_PANELS)[number]

function displayOf(field: IdentityFieldSpec, value: string | number | null): string {
  if (value === null || value === "") return DASH
  if (field.input === "date") return formatDateLong(String(value))
  return String(value)
}

export function IdentityTab({ student, canEdit }: { student: StudentDetail; canEdit: boolean }) {
  const [editing, setEditing] = useState<IdentityPanel | null>(null)

  return (
    <div className="stack">
      {student.missingFields.length > 0 && (
        <Notice tone="danger" title="Perlu dilengkapi">
          Data lama migrasi belum lengkap ({student.missingFields.join(", ")}).
        </Notice>
      )}

      <div className="grid-2">
        {IDENTITY_PANELS.map((panel) => (
          <Panel
            key={panel.id}
            title={panel.title}
            aside={
              canEdit && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(panel)}
                >
                  Edit
                </button>
              )
            }
          >
            <div className="grid-2">
              {panel.fields.map((field) => (
                <FieldValue
                  key={field.key}
                  label={field.label}
                  value={displayOf(field, student.identity[field.key])}
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <ChangeRequestsPanel nis={student.nis} canEdit={canEdit} />

      {editing && (
        <IdentityModal
          key={editing.id}
          student={student}
          title={editing.title}
          fields={editing.fields}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

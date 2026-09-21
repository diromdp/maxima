"use client"

import { Group, Modal, TextInput } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { DASH } from "@/src/lib/format"

import { type IdentitySection, identitySections } from "../registration"
import { findStudent } from "../sample"
import { FieldValue, Panel } from "./Panel"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

// Kolom yang isinya berkas - ditampilkan sebagai tautan, tidak diedit lewat teks.
const FILE_LABELS = new Set(["Tanda Tangan"])

/**
 * Enam panel mengikuti langkah formulir /register - kolom yang sama dengan tabel
 * Siswa, supaya satu data punya satu nama di seluruh sistem. Edit per panel
 * membuka modal berisi kolom panel itu saja; simpan mengubah nilai di layar
 * (fase slicing, belum ke backend).
 */
export function IdentityTab({ nis }: { nis: string }) {
  const student = findStudent(nis)
  const [sections, setSections] = useState<readonly IdentitySection[]>(() => identitySections(nis))
  const [editing, setEditing] = useState<IdentitySection | null>(null)

  function save(form: HTMLFormElement) {
    if (!editing) return
    const data = new FormData(form)
    const fields = editing.fields.map((f) => ({
      ...f,
      value: FILE_LABELS.has(f.label) ? f.value : String(data.get(f.label) ?? f.value),
    }))
    setSections((all) => all.map((s) => (s.id === editing.id ? { ...s, fields } : s)))
    notify.success(`${editing.title} ${student?.name ?? ""} disimpan.`)
    setEditing(null)
  }

  return (
    <div className="stack">
      {student && student.missingFields > 0 && (
        <Notice tone="danger" title="Perlu dilengkapi">
          Data lama migrasi belum lengkap, kurang {student.missingFields} isian.
        </Notice>
      )}

      <div className="grid-2">
        {sections.map((section) => (
          <Panel
            key={section.id}
            title={section.title}
            aside={
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditing(section)}
              >
                Edit
              </button>
            }
          >
            <div className="grid-2">
              {section.fields.map((field) => (
                <FieldValue
                  key={field.label}
                  label={field.label}
                  value={
                    FILE_LABELS.has(field.label) ? (
                      <a
                        className="link"
                        href={`/files/${field.value}`}
                        target="_blank"
                        rel="noopener"
                      >
                        {field.value}
                      </a>
                    ) : (
                      field.value || DASH
                    )
                  }
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Modal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.title}` : ""}
        size="lg"
        styles={TITLE_STYLE}
      >
        {editing && (
          <form
            key={editing.id}
            className="stack stack-lg"
            onSubmit={(e) => {
              e.preventDefault()
              save(e.currentTarget)
            }}
            onReset={() => setEditing(null)}
          >
            <div className="grid-2">
              {editing.fields
                .filter((f) => !FILE_LABELS.has(f.label))
                .map((f) => (
                  <TextInput
                    key={f.label}
                    name={f.label}
                    label={f.label}
                    defaultValue={f.value === "-" ? "" : f.value}
                    placeholder={f.label}
                    type={f.label === "Tanggal Lahir" ? "date" : undefined}
                  />
                ))}
            </div>
            <Group justify="flex-end">
              <button type="reset" className="btn btn-secondary">
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan
              </button>
            </Group>
          </form>
        )}
      </Modal>
    </div>
  )
}

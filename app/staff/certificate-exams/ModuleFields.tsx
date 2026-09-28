"use client"

import { NumberInput } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import dayjs from "dayjs"
import type { ReactNode } from "react"

import {
  MODULE_KEYS,
  MODULE_LABEL,
  type CertificateModulesForm,
  type ModuleForm,
  type ModuleKey,
} from "@/src/entities/certificate/schema"

export function ModuleFields({
  modules,
  errors,
  onChange,
}: {
  modules: CertificateModulesForm
  errors: Readonly<Record<string, ReactNode>>
  onChange: (modules: CertificateModulesForm) => void
}) {
  const update = (key: ModuleKey, change: Partial<ModuleForm>) =>
    onChange({ ...modules, [key]: { ...modules[key], ...change } })

  return (
    <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
      <span className="field-label">Nilai dan masa berlaku per modul</span>
      {MODULE_KEYS.map((key) => (
        <div key={key} className="grid-2">
          <NumberInput
            label={MODULE_LABEL[key]}
            placeholder="0-100"
            min={0}
            max={100}
            clampBehavior="strict"
            allowDecimal={false}
            hideControls
            value={modules[key].score}
            error={errors[`modules.${key}.score`]}
            onChange={(value) => update(key, { score: value === "" ? "" : Number(value) })}
          />
          <MonthPickerInput
            label={`Berlaku sampai (${MODULE_LABEL[key]})`}
            placeholder="Pilih bulan"
            valueFormat="MM/YYYY"
            clearable
            value={modules[key].validUntil || null}
            error={errors[`modules.${key}.validUntil`]}
            onChange={(value) =>
              update(key, {
                validUntil: value ? dayjs(value).endOf("month").format("YYYY-MM-DD") : "",
              })
            }
          />
        </div>
      ))}
    </fieldset>
  )
}

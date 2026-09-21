"use client"

import { Select, Switch, Tabs } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { MasterPanel } from "./MasterPanel"
import { RichTextField } from "./RichTextField"
import {
  BRANCHES,
  CONTENTS,
  DEPARTURE_NEEDS,
  LEAD_SOURCES,
  type MasterRow,
  PROGRAMS,
  SERVICES,
} from "./sample"

// Aktif adalah keadaan normal, cukup teks redup; Nonaktif yang perlu menonjol.
const status = (r: MasterRow) =>
  r.status === "Aktif" ? (
    <span className="caption text-faint">Aktif</span>
  ) : (
    <span className="badge badge-tindakan">Nonaktif</span>
  )

const byName = (r: MasterRow) => r.name

function ServicesPanel() {
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SERVICES.map((s) => [s.name, s.active])),
  )
  return (
    <MasterPanel
      title="Daftar Layanan"
      unit="layanan"
      rows={SERVICES}
      rowKey={(s) => s.name}
      rowName={(s) => s.name}
      nameHeader="Layanan"
      metaHeader="Status"
      meta={(s) =>
        active[s.name] ? (
          <span className="caption text-faint">Aktif</span>
        ) : (
          <span className="badge badge-tindakan">Nonaktif</span>
        )
      }
      trailingHeader="Aktif"
      trailing={(s) => (
        <Switch
          size="sm"
          aria-label={`${s.name} aktif`}
          checked={active[s.name] ?? false}
          onChange={(e) => {
            const on = e.currentTarget.checked
            setActive((a) => ({ ...a, [s.name]: on }))
            notify.success(`${s.name} ${on ? "diaktifkan" : "dinonaktifkan"}.`)
          }}
        />
      )}
    />
  )
}

const TABS = [
  { value: "cabang", label: "Cabang", count: BRANCHES.length },
  { value: "program", label: "Program & Sertifikasi", count: PROGRAMS.length },
  { value: "sumber-lead", label: "Sumber Lead", count: LEAD_SOURCES.length },
  { value: "kebutuhan", label: "Kebutuhan Keberangkatan", count: DEPARTURE_NEEDS.length },
  { value: "layanan", label: "Layanan", count: SERVICES.length },
  { value: "konten", label: "Konten", count: CONTENTS.length },
] as const

// HTML editor diringkas jadi teks polos satu baris untuk cuplikan di daftar.
const excerpt = (html: string, max = 90) => {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

// Satu master per tab - enam panel berdampingan terlalu ramai (permintaan pemilik repo).
export function MasterDataPanels() {
  const [tab, setTab] = useState<string>(TABS[0].value)
  return (
    <Tabs value={tab} onChange={(v) => v && setTab(v)} keepMounted={false}>
      <Tabs.List mb="lg">
        {TABS.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            rightSection={<span className="caption text-faint tabular">{t.count}</span>}
          >
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="cabang">
        <MasterPanel
          title="Cabang Operasional"
          unit="cabang"
          rows={BRANCHES}
          rowKey={byName}
          rowName={byName}
          nameHeader="Nama Cabang"
          metaHeader="Status"
          meta={status}
        />
      </Tabs.Panel>
      <Tabs.Panel value="program">
        <MasterPanel
          title="Program & Sertifikasi"
          unit="program"
          rows={PROGRAMS}
          rowKey={byName}
          rowName={byName}
          nameHeader="Nama Program"
          metaHeader="Status"
          meta={status}
        />
      </Tabs.Panel>
      <Tabs.Panel value="sumber-lead">
        <MasterPanel
          title="Sumber Lead"
          unit="sumber lead"
          rows={LEAD_SOURCES}
          rowKey={byName}
          rowName={byName}
          nameHeader="Sumber Lead"
          metaHeader="Status"
          meta={status}
        />
      </Tabs.Panel>
      <Tabs.Panel value="kebutuhan">
        <MasterPanel
          title="List Kebutuhan Keberangkatan Siswa"
          unit="kebutuhan"
          rows={DEPARTURE_NEEDS}
          rowKey={(g) => g}
          rowName={(g) => g}
          nameHeader="Kebutuhan"
        />
      </Tabs.Panel>
      <Tabs.Panel value="layanan">
        <ServicesPanel />
      </Tabs.Panel>
      <Tabs.Panel value="konten">
        <MasterPanel
          title="Konten"
          unit="konten"
          rows={CONTENTS}
          rowKey={(c) => c.name}
          rowName={(c) => c.name}
          rowSub={(c) => <span className="caption text-muted">{excerpt(c.description)}</span>}
          nameHeader="Nama"
          metaHeader="Status"
          meta={status}
          modalSize="lg"
          formFields={(initial) => (
            <>
              <RichTextField
                name="description"
                label="Deskripsi"
                defaultValue={initial?.description}
                placeholder="Tulis isi konten"
              />
              <Select
                name="status"
                label="Status"
                data={["Aktif", "Nonaktif"]}
                defaultValue={initial?.status ?? "Aktif"}
                allowDeselect={false}
              />
            </>
          )}
        />
      </Tabs.Panel>
    </Tabs>
  )
}

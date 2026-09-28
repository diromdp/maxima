"use client"

import { Switch, Tabs } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import type { DataColumn } from "@/src/components/data/DataTable"
import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { setMasterItemStatus } from "@/src/entities/master-data/actions"
import {
  contentsQuery,
  documentTypesQuery,
  holidaysQuery,
  masterItemsQuery,
} from "@/src/entities/master-data/queries"
import type {
  ContentRow,
  DocumentTypeRow,
  HolidayRow,
  MasterItemRow,
  MasterType,
} from "@/src/entities/master-data/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateLong } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { ContentModal } from "./ContentModal"
import { DocumentTypeModal } from "./DocumentTypeModal"
import { HolidayModal } from "./HolidayModal"
import { MasterItemModal } from "./MasterItemModal"
import { MasterPanel, StatusText } from "./MasterPanel"

type MasterTab = {
  value: string
  label: string
  type: MasterType
  title: string
  unit: string
  nameHeader: string
  note?: string
}

const MASTER_TABS: readonly MasterTab[] = [
  {
    value: "cabang",
    label: "Cabang",
    type: "branch",
    title: "Cabang Operasional",
    unit: "cabang",
    nameHeader: "Nama Cabang",
    note: "Kode cabang tercetak di NIS dan No Kontrak, jadi isi sebelum siswa pertama didaftarkan. Kode hanya dapat diganti selama cabang belum dipakai data apa pun.",
  },
  {
    value: "program",
    label: "Program",
    type: "program",
    title: "Program & Sertifikasi",
    unit: "program",
    nameHeader: "Nama",
  },
  {
    value: "sumber-lead",
    label: "Sumber Lead",
    type: "lead_source",
    title: "Sumber Lead",
    unit: "sumber lead",
    nameHeader: "Nama",
  },
  {
    value: "gerbang",
    label: "Gerbang Pembayaran",
    type: "gate",
    title: "Gerbang Pembayaran",
    unit: "gerbang",
    nameHeader: "Nama Gerbang",
    note: "Nominal tiap gerbang diatur per paket di halaman Master Paket & Promo.",
  },
  {
    value: "layanan",
    label: "Layanan",
    type: "service",
    title: "Daftar Layanan",
    unit: "layanan",
    nameHeader: "Layanan",
  },
  {
    value: "jurusan",
    label: "Jurusan",
    type: "major",
    title: "Jurusan Program",
    unit: "jurusan",
    nameHeader: "Nama",
  },
  {
    value: "level",
    label: "Level",
    type: "level",
    title: "Level",
    unit: "level",
    nameHeader: "Nama",
  },
  {
    value: "jenis-sertifikat",
    label: "Jenis Sertifikat",
    type: "certificate_type",
    title: "Jenis Sertifikat",
    unit: "jenis sertifikat",
    nameHeader: "Nama",
  },
  {
    value: "industri-partner",
    label: "Industri Partner",
    type: "partner_category",
    title: "Industri Partner",
    unit: "industri partner",
    nameHeader: "Nama",
  },
  {
    value: "kebutuhan",
    label: "Kebutuhan Keberangkatan",
    type: "departure_item",
    title: "List Kebutuhan Keberangkatan Siswa",
    unit: "kebutuhan",
    nameHeader: "Kebutuhan",
  },
]

const DOCUMENT_TYPES_TAB = "jenis-dokumen"
const HOLIDAYS_TAB = "libur"
const CONTENTS_TAB = "konten"

const TABS: readonly { value: string; label: string }[] = [
  ...MASTER_TABS,
  { value: DOCUMENT_TYPES_TAB, label: "Jenis Dokumen" },
  { value: HOLIDAYS_TAB, label: "Libur Akademik" },
  { value: CONTENTS_TAB, label: "Konten" },
]

const DEFAULT_TAB = "cabang"
const EXCERPT_LENGTH = 90

const excerptOf = (html: string) => {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text
}

const nameCell = (name: string) => <span className="text-ink">{name}</span>

const statusColumn = <T extends { status: MasterItemRow["status"] }>(): DataColumn<T> => ({
  key: "status",
  header: "Status",
  cell: (row) => <StatusText status={row.status} />,
})

function ServiceSwitch({ item }: { item: MasterItemRow }) {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  return (
    <Switch
      size="sm"
      aria-label={`${item.name} aktif`}
      checked={item.status === "Aktif"}
      disabled={isSaving}
      onChange={async (event) => {
        const status = event.currentTarget.checked ? "Aktif" : "Nonaktif"
        setIsSaving(true)
        const result = await setMasterItemStatus(item.id, status)
        if (result.ok) {
          await queryClient.invalidateQueries({ queryKey: ["master-items"] })
          notify.success(`${item.name} ${status === "Aktif" ? "diaktifkan" : "dinonaktifkan"}.`)
        } else {
          notify.error(result.message)
        }
        setIsSaving(false)
      }}
    />
  )
}

function masterColumns(tab: MasterTab, canEdit: boolean): DataColumn<MasterItemRow>[] {
  const name: DataColumn<MasterItemRow> = {
    key: "name",
    header: tab.nameHeader,
    wrap: true,
    cell: (row) => nameCell(row.name),
  }
  if (tab.type === "branch") {
    return [
      {
        key: "code",
        header: "Kode Cabang",
        cell: (row) => <span className="tabular">{row.code}</span>,
      },
      name,
      { key: "email", header: "Surel", cell: (row) => row.contactEmail ?? "-" },
      { key: "phone", header: "Telepon", cell: (row) => row.contactPhone ?? "-" },
      statusColumn(),
    ]
  }
  if (tab.type === "service") {
    return [
      name,
      {
        key: "active",
        header: "Aktif",
        cell: (row) =>
          canEdit ? <ServiceSwitch item={row} /> : <StatusText status={row.status} />,
      },
    ]
  }
  return [name, statusColumn()]
}

const DOCUMENT_TYPE_COLUMNS: readonly DataColumn<DocumentTypeRow>[] = [
  { key: "name", header: "Nama", wrap: true, cell: (row) => nameCell(row.name) },
  { key: "group", header: "Rumpun", cell: (row) => row.group },
  { key: "required", header: "Wajib", cell: (row) => (row.required ? "Wajib" : "Opsional") },
  statusColumn(),
]

const HOLIDAY_COLUMNS: readonly DataColumn<HolidayRow>[] = [
  { key: "date", header: "Tanggal", cell: (row) => formatDateLong(row.date) },
  { key: "name", header: "Nama Libur", wrap: true, cell: (row) => nameCell(row.name) },
]

const CONTENT_COLUMNS: readonly DataColumn<ContentRow>[] = [
  {
    key: "name",
    header: "Nama",
    wrap: true,
    cell: (row) => (
      <div className="stack" style={{ gap: 0 }}>
        {nameCell(row.name)}
        <span className="caption text-muted">{excerptOf(row.descriptionHtml)}</span>
      </div>
    ),
  },
  statusColumn(),
]

export function MasterDataPanels({ canEdit }: { canEdit: boolean }) {
  const searchParams = useSearchParams()
  const items = useRead(masterItemsQuery())
  const documentTypes = useRead(documentTypesQuery())
  const holidays = useRead(holidaysQuery())
  const contents = useRead(contentsQuery())

  const requested = searchParams.get("tab")
  const tab = TABS.some((entry) => entry.value === requested) ? requested : DEFAULT_TAB
  const itemsOf = (type: MasterType) => items.data?.data.filter((item) => item.type === type)

  const countOf = (value: string) => {
    if (value === DOCUMENT_TYPES_TAB) return documentTypes.data?.data.length
    if (value === HOLIDAYS_TAB) return holidays.data?.data.length
    if (value === CONTENTS_TAB) return contents.data?.data.length
    const master = MASTER_TABS.find((entry) => entry.value === value)
    return master && itemsOf(master.type)?.length
  }

  const selectTab = (value: string | null) => {
    if (value) window.history.replaceState(null, "", `?tab=${value}`)
  }

  return (
    <Tabs value={tab} onChange={selectTab} keepMounted={false}>
      <ScrollableTabsList>
        {TABS.map((entry) => (
          <Tabs.Tab
            key={entry.value}
            value={entry.value}
            style={{ flexShrink: 0 }}
            rightSection={
              <span className="caption text-faint tabular">{countOf(entry.value) ?? ""}</span>
            }
          >
            {entry.label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      {MASTER_TABS.map((master) => (
        <Tabs.Panel key={master.value} value={master.value}>
          <MasterPanel
            title={master.title}
            unit={master.unit}
            note={master.note}
            rows={itemsOf(master.type)}
            error={items.error}
            onRetry={() => void items.refetch()}
            columns={masterColumns(master, canEdit)}
            rowName={(row) => row.name}
            canEdit={canEdit}
            resource="master-items"
            invalidates={["master-items"]}
            hasRowActions={master.type !== "service"}
            renderModal={(initial, onClose) => (
              <MasterItemModal
                type={master.type}
                title={master.title}
                initial={initial}
                onClose={onClose}
              />
            )}
          />
        </Tabs.Panel>
      ))}

      <Tabs.Panel value={DOCUMENT_TYPES_TAB}>
        <MasterPanel
          title="Jenis Dokumen"
          unit="jenis dokumen"
          note="Jenis dokumen yang aktif membentuk daftar berkas siswa di halaman Dokumen dan portal."
          rows={documentTypes.data?.data}
          error={documentTypes.error}
          onRetry={() => void documentTypes.refetch()}
          columns={DOCUMENT_TYPE_COLUMNS}
          rowName={(row) => row.name}
          canEdit={canEdit}
          resource="document-types"
          invalidates={["document-types"]}
          renderModal={(initial, onClose) => (
            <DocumentTypeModal initial={initial} onClose={onClose} />
          )}
        />
      </Tabs.Panel>

      <Tabs.Panel value={HOLIDAYS_TAB}>
        <MasterPanel
          title="Tanggal Libur Akademik"
          unit="tanggal libur"
          note="Sesi kelas tidak terbit di tanggal libur, dan pertemuan yang hilang tidak diganti."
          rows={holidays.data?.data}
          error={holidays.error}
          onRetry={() => void holidays.refetch()}
          columns={HOLIDAY_COLUMNS}
          rowName={(row) => row.name}
          canEdit={canEdit}
          resource="academic-holidays"
          invalidates={["academic-holidays"]}
          renderModal={(initial, onClose) => <HolidayModal initial={initial} onClose={onClose} />}
        />
      </Tabs.Panel>

      <Tabs.Panel value={CONTENTS_TAB}>
        <MasterPanel
          title="Konten"
          unit="konten"
          rows={contents.data?.data}
          error={contents.error}
          onRetry={() => void contents.refetch()}
          columns={CONTENT_COLUMNS}
          rowName={(row) => row.name}
          canEdit={canEdit}
          resource="contents"
          invalidates={["contents"]}
          renderModal={(initial, onClose) => <ContentModal initial={initial} onClose={onClose} />}
        />
      </Tabs.Panel>
    </Tabs>
  )
}

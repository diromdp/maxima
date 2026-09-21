"use client"

import { Tabs } from "@mantine/core"

import { AcademicTab } from "./AcademicTab"
import { AdmissionTab } from "./AdmissionTab"
import { DocumentsTab } from "./DocumentsTab"
import { FinanceTab } from "./FinanceTab"
import { HistoryTab } from "./HistoryTab"
import { IdentityTab } from "./IdentityTab"

const FINANCE_ROLES = [
  "Staf Finance",
  "Manajer Finance",
  "Admission",
  "Marketing",
  "Kepala Marketing",
]
const ACADEMIC_ROLES = ["Pengajar", "Kepala Pengajar", "Admission"]
const DOCUMENT_ROLES = ["Admission", "Marketing", "Kepala Marketing"]
const ADMISSION_ROLES = ["Admission"]

const TABS = [
  { value: "identity", label: "Identitas", roles: null, panel: null },
  { value: "finance", label: "Keuangan", roles: FINANCE_ROLES, panel: <FinanceTab /> },
  { value: "academic", label: "Akademik", roles: ACADEMIC_ROLES, panel: <AcademicTab /> },
  { value: "documents", label: "Dokumen", roles: DOCUMENT_ROLES, panel: <DocumentsTab /> },
  { value: "admission", label: "Admission", roles: ADMISSION_ROLES, panel: <AdmissionTab /> },
  { value: "history", label: "Riwayat", roles: ADMISSION_ROLES, panel: <HistoryTab /> },
] as const

export function StudentTabs({
  nis,
  role,
  initialTab,
}: {
  nis: string
  role: string
  initialTab?: string
}) {
  const visible = TABS.filter((t) => t.roles === null || t.roles.includes(role))
  const initial = visible.find((t) => t.value === initialTab) ?? visible[0]

  return (
    <Tabs defaultValue={initial?.value} keepMounted={false}>
      <Tabs.List mb="lg">
        {visible.map((t) => (
          <Tabs.Tab key={t.value} value={t.value}>
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {visible.map((t) => (
        <Tabs.Panel key={t.value} value={t.value}>
          {t.value === "identity" ? <IdentityTab nis={nis} /> : t.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

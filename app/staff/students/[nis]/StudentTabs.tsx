"use client"

import { Tabs } from "@mantine/core"
import { useSearchParams } from "next/navigation"

import type { StudentDetail, StudentTab } from "@/src/entities/student/schema"
import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"

import { AcademicTab } from "./AcademicTab"
import { AdmissionTab } from "./AdmissionTab"
import { DocumentsTab } from "./DocumentsTab"
import { FinanceTab } from "./FinanceTab"
import { HistoryTab } from "./HistoryTab"
import { IdentityTab } from "./IdentityTab"

const TAB_LABELS: Readonly<Record<StudentTab, string>> = {
  identity: "Identitas",
  finance: "Keuangan",
  academic: "Akademik",
  documents: "Dokumen",
  admission: "Admission",
  history: "Riwayat",
}

export function StudentTabs({ student, canEdit }: { student: StudentDetail; canEdit: boolean }) {
  const searchParams = useSearchParams()
  const requested = searchParams.get("tab")
  const tab = student.tabs.find((entry) => entry === requested) ?? "identity"
  const { nis } = student

  const panelOf: Readonly<Record<StudentTab, React.ReactNode>> = {
    identity: <IdentityTab student={student} canEdit={canEdit} />,
    finance: <FinanceTab nis={nis} />,
    academic: <AcademicTab nis={nis} />,
    documents: <DocumentsTab nis={nis} />,
    admission: <AdmissionTab nis={nis} />,
    history: <HistoryTab nis={nis} />,
  }

  return (
    <Tabs
      value={tab}
      onChange={(value) => value && window.history.replaceState(null, "", `?tab=${value}`)}
      keepMounted={false}
    >
      <ScrollableTabsList>
        {student.tabs.map((entry) => (
          <Tabs.Tab key={entry} value={entry}>
            {TAB_LABELS[entry]}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      {student.tabs.map((entry) => (
        <Tabs.Panel key={entry} value={entry}>
          {panelOf[entry]}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

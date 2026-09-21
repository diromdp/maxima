"use client"

import { Tabs } from "@mantine/core"

import { PackagesTab } from "./PackagesTab"
import { PromosTab } from "./PromosTab"

export function PackagePromoTabs({
  initialTab,
  readOnly,
}: {
  initialTab?: string
  readOnly: boolean
}) {
  const TABS = [
    { value: "packages", label: "Paket Program", panel: <PackagesTab readOnly={readOnly} /> },
    { value: "promos", label: "Promo / Diskon", panel: <PromosTab readOnly={readOnly} /> },
  ] as const
  const initial = TABS.find((tab) => tab.value === initialTab) ?? TABS[0]

  return (
    <Tabs defaultValue={initial.value} keepMounted={false}>
      <Tabs.List mb="lg">
        {TABS.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {TABS.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

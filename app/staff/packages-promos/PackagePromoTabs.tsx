"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useListParams } from "@/src/lib/use-list-params"

import { PackagesTab } from "./PackagesTab"
import { PromosTab } from "./PromosTab"

const TABS = [
  { value: "packages", label: "Paket Program" },
  { value: "promos", label: "Promo / Diskon" },
] as const

export function PackagePromoTabs({ readOnly }: { readOnly: boolean }) {
  const { params, setParams } = useListParams(["tab"])
  const active = TABS.find((tab) => tab.value === params.tab)?.value ?? TABS[0].value

  return (
    <Tabs
      value={active}
      onChange={(value) => setParams({ tab: value === TABS[0].value ? null : value })}
      keepMounted={false}
    >
      <ScrollableTabsList>
        {TABS.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      <Tabs.Panel value="packages">
        <PackagesTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="promos">
        <PromosTab readOnly={readOnly} />
      </Tabs.Panel>
    </Tabs>
  )
}

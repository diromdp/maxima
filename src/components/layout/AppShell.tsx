"use client"

import { useState } from "react"
import { Box, Drawer } from "@mantine/core"

import { Sidebar } from "@/src/components/layout/Sidebar"
import { TopBar } from "@/src/components/layout/TopBar"
import type { MenuSection } from "@/src/lib/auth/permissions"
import type { Session } from "@/src/lib/auth/session"

export function AppShell({
  session,
  sections,
  sidebarWidth = 264,
  children,
}: {
  session: Session
  sections: readonly MenuSection[]
  sidebarWidth?: number
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box style={{ height: "100dvh", display: "flex", overflow: "hidden" }}>
      <Sidebar
        className="hide-mobile"
        session={session}
        sections={sections}
        width={sidebarWidth}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar session={session} onMenuOpen={() => setDrawerOpen(true)} />

        <Box
          flex={1}
          bg="var(--page-bg)"
          px={{ base: "md", sm: "xl" }}
          py={{ base: "lg", sm: "xl" }}
          style={{ minWidth: 0, overflowY: "auto" }}
        >
          {children}
        </Box>
      </Box>

      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={sidebarWidth}
        padding={0}
        title={null}
        withCloseButton={false}
        styles={{
          body: { padding: 0, height: "100%" },
          content: { display: "flex", flexDirection: "column" },
        }}
      >
        <Sidebar
          session={session}
          sections={sections}
          width={sidebarWidth}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Drawer>
    </Box>
  )
}

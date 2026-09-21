"use client"

import { ActionIcon, Box, Stack, Text, Tooltip } from "@mantine/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeftIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "@/src/components/brand/Logo"
import { AuthMenu } from "@/src/components/layout/AuthMenu"
import type { MenuSection } from "@/src/lib/auth/permissions"
import type { Session } from "@/src/lib/auth/session"

const COLLAPSED_WIDTH = 64
const HEADER_HEIGHT = 80

export function Sidebar({
  session,
  sections,
  width = 264,
  collapsed = false,
  className,
  onNavigate,
  onToggleCollapse,
}: {
  session: Session
  sections: readonly MenuSection[]
  width?: number
  collapsed?: boolean
  className?: string
  onNavigate?: () => void
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()

  return (
    <Box
      component="nav"
      className={className}
      w={collapsed ? COLLAPSED_WIDTH : width}
      h="100%"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--canvas)",
        borderRight: "1px solid var(--hairline-soft)",
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Box
        h={HEADER_HEIGHT}
        px={collapsed ? 12 : 20}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        {!collapsed && <Logo height={48} />}

        {onToggleCollapse && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size={40}
            radius="xl"
            aria-label={collapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
            onClick={onToggleCollapse}
          >
            <HugeiconsIcon icon={SidebarLeftIcon} size={20} strokeWidth={1.5} />
          </ActionIcon>
        )}
      </Box>

      <Box
        px={collapsed ? 4 : 12}
        py={8}
        style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin" }}
      >
        <Stack gap="lg">
          {sections.map((section, i) => (
            <Stack key={section.group ?? `standalone-${i}`} gap={4} align={collapsed ? "center" : "stretch"}>
              {section.group && !collapsed && (
                <Text h={32} px={16} size="12px" fw={500} c="dimmed" style={{ lineHeight: "32px" }}>
                  {section.group}
                </Text>
              )}

              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

                const row = (
                  <Box
                    component={Link}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="nav-row"
                    data-active={active || undefined}
                    h={40}
                    w={collapsed ? 40 : undefined}
                    px={collapsed ? 0 : 16}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 12,
                      borderRadius: 9999,
                      color: "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
                    {!collapsed && (
                      <Text size="14px" lh="24px" fw={active ? 600 : 400} truncate="end">
                        {item.label}
                      </Text>
                    )}
                  </Box>
                )

                return collapsed ? (
                  <Tooltip
                    key={item.href}
                    label={item.label}
                    position="right"
                    withArrow
                    openDelay={200}
                  >
                    {row}
                  </Tooltip>
                ) : (
                  <Box key={item.href}>{row}</Box>
                )
              })}
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box
        px={12}
        py={12}
        style={{
          borderTop: "1px solid var(--hairline-soft)",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <AuthMenu session={session} compact={collapsed} menuPosition="top-start" />
      </Box>
    </Box>
  )
}

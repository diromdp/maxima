import { Anchor, Breadcrumbs, Group, Stack, Text, Title } from "@mantine/core"
import Link from "next/link"

export type Breadcrumb = {
  readonly label: string
  readonly href?: string
}

export function PageHeader({
  title,
  badge,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string
  /** Badge di samping judul — status entitas yang halaman ini ceritakan. */
  badge?: React.ReactNode
  subtitle?: string
  breadcrumbs?: readonly Breadcrumb[]
  actions?: React.ReactNode
}) {
  return (
    <Stack gap="xs" mb="xl">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator="/">
          {breadcrumbs.map((crumb, i) =>
            crumb.href ? (
              <Anchor key={i} component={Link} href={crumb.href} size="sm" c="dimmed">
                {crumb.label}
              </Anchor>
            ) : (
              <Text key={i} size="sm" c="dimmed">
                {crumb.label}
              </Text>
            ),
          )}
        </Breadcrumbs>
      )}

      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Group gap="sm" wrap="nowrap" align="center">
            <Title order={1} size="h3">
              {title}
            </Title>
            {badge}
          </Group>
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>

        {actions && (
          <Group gap="xs" wrap="nowrap">
            {actions}
          </Group>
        )}
      </Group>
    </Stack>
  )
}

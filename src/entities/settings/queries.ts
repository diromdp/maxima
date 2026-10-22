import { readQuery } from "@/src/lib/api/read"

import type { SystemSettings } from "./schema"

export const systemSettingsQuery = () => readQuery<SystemSettings>("settings", "/settings")

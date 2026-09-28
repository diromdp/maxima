import { readQuery } from "@/src/lib/api/read"

import type { HomeView, MarketingPerformance } from "./schema"

export const homeQuery = () => readQuery<HomeView>("home", "/home")

export const marketingPerformanceQuery = () =>
  readQuery<MarketingPerformance>("marketing-performance", "/marketing-performance")

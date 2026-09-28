import { portalLearningQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { LearningView } from "./LearningView"

export default async function LearningPage() {
  await requireSession("student")

  return (
    <Prefetched reads={[portalLearningQuery()]}>
      <LearningView />
    </Prefetched>
  )
}

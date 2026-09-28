import { portalProfileQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { ProfileView } from "./ProfileView"

export default async function ProfilePage() {
  const session = await requireSession("student")

  return (
    <Prefetched reads={[portalProfileQuery()]}>
      <ProfileView status={session.status} packageName={session.packageName} />
    </Prefetched>
  )
}

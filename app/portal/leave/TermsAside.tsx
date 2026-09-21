import { CardHeader } from "./CardHeader"
import { TERMS_SUMMARY } from "./leave"

export function TermsAside() {
  return (
    <section className="card stack">
      <CardHeader title="Ketentuan" />
      <p className="body-sm text-muted">{TERMS_SUMMARY}</p>
    </section>
  )
}

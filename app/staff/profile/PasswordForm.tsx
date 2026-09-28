import { PasswordChangeForm } from "@/src/components/auth/PasswordChangeForm"
import { Notice } from "@/src/components/ui/Notice"

export function PasswordForm({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <section className="card stack" aria-labelledby="password-heading">
      <h2 className="h5" id="password-heading">
        Kata sandi
      </h2>

      {isSuperAdmin ? (
        <Notice tone="neutral">
          Kata sandi super admin diganti lewat pengaturan server, bukan dari halaman ini.
        </Notice>
      ) : (
        <PasswordChangeForm kind="staff" />
      )}
    </section>
  )
}

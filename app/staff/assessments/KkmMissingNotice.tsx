import { Notice } from "@/src/components/ui/Notice"

export function KkmMissingNotice() {
  return (
    <Notice tone="warning" title="KKM level ini belum diisi">
      Nilai tetap dapat disimpan, tetapi latar merah muda dan status kelulusan baru muncul setelah
      KKM level ini diisi di halaman Kelas &amp; Jadwal, tab Standar KKM.
    </Notice>
  )
}

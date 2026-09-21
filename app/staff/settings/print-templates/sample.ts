// Lima template dari wireframe 20c dan PRD Admin 20.3. Berkasnya tautan ke
// `/files/<nama>` - di fase slicing belum ada PDF-nya.

export type PrintTemplate = {
  readonly id: string
  readonly name: string
  readonly file: string
}

export const TEMPLATES: readonly PrintTemplate[] = [
  { id: "kontrak", name: "Kontrak Perjanjian Siswa", file: "kontrak_perjanjian_v2.pdf" },
  { id: "kwitansi", name: "Kwitansi Pembayaran Otomatis", file: "receipt_template_pay.pdf" },
  { id: "raport-level", name: "Raport Pembelajaran Level", file: "report_evaluasi_level.pdf" },
  { id: "surat-belajar", name: "Surat Keterangan Belajar", file: "surat_keterangan_aktif.pdf" },
  { id: "raport", name: "Raport", file: "raport.pdf" },
]

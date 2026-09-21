// Enam panel Master Data (PRD Admin 20.2 dan lampiran 20b). Isi dari wireframe
// 20b dan bagian PRD yang menyebutnya: program (temuan 7), sumber lead (5.2),
// sembilan kebutuhan keberangkatan = sembilan gerbang (halaman 12), layanan berbayar
// (wireframe). Panel Metode Pembayaran dicabut atas permintaan pemilik repo 19 Sep 2026. Gerbang tanpa nominal - nominal per paket ada di halaman 12.

export type MasterStatus = "Aktif" | "Nonaktif"

export type MasterRow = {
  readonly name: string
  readonly status: MasterStatus
}

export const BRANCHES: readonly MasterRow[] = [
  { name: "Cabang Bandung (Pusat)", status: "Aktif" },
  { name: "Cabang Jakarta", status: "Aktif" },
  { name: "Cabang Surabaya", status: "Aktif" },
]

export const PROGRAMS: readonly MasterRow[] = [
  { name: "Ausbildung", status: "Aktif" },
  { name: "FSJ (Voluntary Work)", status: "Aktif" },
  { name: "Studium (Kuliah Reguler)", status: "Aktif" },
]

export const LEAD_SOURCES: readonly MasterRow[] = [
  { name: "Media Sosial", status: "Aktif" },
  { name: "Rekomendasi Teman", status: "Aktif" },
  { name: "Alumni", status: "Aktif" },
  { name: "Referral", status: "Aktif" },
  { name: "Kontak Langsung", status: "Aktif" },
  { name: "Lainnya", status: "Aktif" },
]

// Kebutuhan keberangkatan siswa, urut sesuai gerbang pembayaran; nomor dihitung dari indeks.
export const DEPARTURE_NEEDS: readonly string[] = [
  "Down Payment (DP)",
  "Sertifikasi A2",
  "Sertifikasi B1",
  "Sertifikasi B2",
  "Pembuatan Paspor",
  "Ujian Bahasa",
  "Pembekalan / Workshop",
  "Pencarian Perusahaan",
  "Pengajuan Visa Jerman",
]

export type Service = {
  readonly name: string
  readonly active: boolean
}

export const SERVICES: readonly Service[] = [
  { name: "Terjemah Dokumen", active: true },
  { name: "Apostille Dokumen", active: true },
  { name: "Ujian Goethe", active: true },
  { name: "Tiket Pesawat (Talang)", active: true },
  { name: "Krankenversicherung", active: true },
  { name: "Rahmenplan", active: true },
]

// Konten: teks panjang yang ditampilkan ke siswa (syarat, panduan, kebijakan).
// Deskripsi disimpan sebagai HTML dari editor WYSIWYG. Contoh isi, permintaan
// pemilik repo 19 Sep 2026 - tidak ada di PRD.
export type Content = {
  readonly name: string
  readonly description: string
  readonly status: MasterStatus
}

export const CONTENTS: readonly Content[] = [
  {
    name: "Syarat & Ketentuan Pendaftaran",
    description:
      "<p>Calon siswa menyetujui ketentuan berikut saat mendaftar:</p><ul><li>Data diri yang diisi <b>benar dan sesuai dokumen resmi</b>.</li><li>DP yang sudah dibayar tidak dapat dikembalikan.</li><li>Jadwal kelas mengikuti cabang yang dipilih.</li></ul>",
    status: "Aktif",
  },
  {
    name: "Panduan Keberangkatan",
    description:
      "<p>Urutan yang harus diselesaikan sebelum berangkat:</p><ol><li>Sertifikat bahasa minimal <b>B1</b>.</li><li>Paspor berlaku minimal 18 bulan.</li><li>Vertrag dari partner sudah ditandatangani.</li><li>Visa disetujui kedutaan.</li></ol>",
    status: "Aktif",
  },
  {
    name: "Kebijakan Cuti",
    description:
      "<p>Cuti diajukan lewat portal dan menunggu tiga persetujuan: Finance, Manajer Finance, Admission. Selama cuti, <i>tagihan dan pengingat berhenti</i>.</p>",
    status: "Nonaktif",
  },
]

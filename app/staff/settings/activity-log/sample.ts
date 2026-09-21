// Baris dari wireframe 20d. Modul memakai enam badge PRD (Partner · Admission ·
// Finance · Akademik · Dokumen · Pengaturan): "Keuangan" wireframe = Finance,
// "Siswa" = Admission. Peran memakai nama ROLE_ACCESS ("Super Admin" wireframe =
// Admission, "Finance" = Staf Finance, "Akademik" = Pengajar).

export const MODULES = [
  "Partner",
  "Admission",
  "Finance",
  "Akademik",
  "Dokumen",
  "Pengaturan",
] as const

export type Module = (typeof MODULES)[number]

export type LogEntry = {
  readonly id: string
  readonly at: string
  readonly user: string
  readonly role: string
  readonly action: string
  readonly module: Module
  readonly ip: string
}

export const LOG: readonly LogEntry[] = [
  {
    id: "l-01",
    at: "2025-02-22T14:32:10+07:00",
    user: "Sarah K",
    role: "Admission",
    action: "Mengubah status rekrutmen Andi Nugroho ke 'Dapat Vertrag'",
    module: "Partner",
    ip: "192.168.1.12",
  },
  {
    id: "l-02",
    at: "2025-02-22T13:15:45+07:00",
    user: "Dewi S",
    role: "Admission",
    action: "Menambahkan jadwal latihan wawancara Farhan Majid",
    module: "Partner",
    ip: "192.168.1.15",
  },
  {
    id: "l-03",
    at: "2025-02-22T11:04:12+07:00",
    user: "Hendra W",
    role: "Staf Finance",
    action: "Mengesahkan kwitansi otomatis pembayaran DP Andi Nugroho",
    module: "Finance",
    ip: "192.168.1.30",
  },
  {
    id: "l-04",
    at: "2025-02-22T09:12:00+07:00",
    user: "Sarah K",
    role: "Admission",
    action: "Mengunggah PDF dokumen paspor Rina Agustina",
    module: "Dokumen",
    ip: "192.168.1.12",
  },
  {
    id: "l-05",
    at: "2025-02-22T08:30:22+07:00",
    user: "Ari Wibowo",
    role: "Pengajar",
    action: "Mengubah status kehadiran kelas Berlin",
    module: "Akademik",
    ip: "192.168.2.10",
  },
  {
    id: "l-06",
    at: "2025-02-21T17:45:11+07:00",
    user: "Admin Pusat",
    role: "Admission",
    action: "Mengubah konfigurasi threshold gerbang pembayaran B1",
    module: "Pengaturan",
    ip: "192.168.1.1",
  },
  {
    id: "l-07",
    at: "2025-02-21T16:20:05+07:00",
    user: "Hendra W",
    role: "Staf Finance",
    action: "Menambah data pembayaran VA Mandiri Bayu Saputra",
    module: "Finance",
    ip: "192.168.1.30",
  },
  {
    id: "l-08",
    at: "2025-02-21T14:10:50+07:00",
    user: "Sarah K",
    role: "Admission",
    action: "Mengubah status rekrutmen Bayu Saputra ke 'Masih Dicarikan'",
    module: "Partner",
    ip: "192.168.1.12",
  },
  {
    id: "l-09",
    at: "2025-02-21T11:30:15+07:00",
    user: "Ari Wibowo",
    role: "Pengajar",
    action: "Menginput nilai evaluasi belajar ujian Goethe A2",
    module: "Akademik",
    ip: "192.168.2.10",
  },
  {
    id: "l-10",
    at: "2025-02-21T09:05:00+07:00",
    user: "Dewi S",
    role: "Admission",
    action: "Mengubah data diri siswa Rina Agustina",
    module: "Admission",
    ip: "192.168.1.15",
  },
  {
    id: "l-11",
    at: "2025-02-20T15:22:11+07:00",
    user: "Admin Pusat",
    role: "Admission",
    action: "Mengubah template cetak Surat Keterangan Belajar",
    module: "Pengaturan",
    ip: "192.168.1.1",
  },
  {
    id: "l-12",
    at: "2025-02-20T13:40:33+07:00",
    user: "Hendra W",
    role: "Staf Finance",
    action: "Menambahkan promo diskon program Ausbildung 36",
    module: "Finance",
    ip: "192.168.1.30",
  },
  {
    id: "l-13",
    at: "2025-02-20T10:15:00+07:00",
    user: "Sarah K",
    role: "Admission",
    action: "Mengubah status rekrutmen Siti Rohmah ke 'Sedang Diproses'",
    module: "Partner",
    ip: "192.168.1.12",
  },
]

export const USERS: readonly string[] = [...new Set(LOG.map((l) => l.user))]

// PRD 20 aturan: perubahan Admission di wilayah Finance dan Akademik adalah jalur
// pengecualian dan ditandai khusus di log.
export const isCrossArea = (l: LogEntry): boolean =>
  l.role === "Admission" && (l.module === "Finance" || l.module === "Akademik")

export const GROUPS = [
  {
    id: "pribadi",
    name: "Pribadi",
    title: "Rumpun Pribadi",
    source: "student",
    files: [
      "Akta Lahir",
      "Kartu Keluarga",
      "KTP",
      "Ijazah Terakhir",
      "Transkrip Terakhir",
      "Pas Foto",
    ],
  },
  {
    id: "hasil-layanan",
    name: "Hasil Layanan",
    title: "Hasil Layanan",
    source: "service",
    files: [
      "Paspor",
      "Terjemahan Akta Lahir",
      "Terjemahan Ijazah & Transkrip",
      "Apostille Akta Lahir",
      "Apostille Ijazah",
    ],
  },
  {
    id: "bewerbung",
    name: "Bewerbung",
    title: "Bewerbung (Persiapan Lamaran)",
    source: "student",
    files: ["Sertifikat Bahasa B1", "Lebenslauf", "Motivationsschreiben", "Video Perkenalan"],
  },
  {
    id: "dari-betrieb",
    name: "Dari Betrieb",
    title: "Dari Betrieb (Dokumen Perusahaan)",
    source: "student",
    files: ["Vertrag", "Krankenversicherung", "IHK", "Rahmenplan"],
  },
] as const

export type GroupId = (typeof GROUPS)[number]["id"]
export type GroupName = (typeof GROUPS)[number]["name"]
export type GroupSource = (typeof GROUPS)[number]["source"]

export const GROUP_BADGE: Readonly<Record<GroupId, string>> = {
  pribadi: "badge-neutral",
  "hasil-layanan": "badge-beres",
  bewerbung: "badge-info",
  "dari-betrieb": "badge-tindakan",
}

export const FILE_STATUSES = [
  "Lengkap",
  "Perlu Verifikasi",
  "Belum Diunggah",
  "Ditolak",
  "Diproses",
] as const
export type FileStatus = (typeof FILE_STATUSES)[number]

export const FILE_STATUS_BADGE: Readonly<Record<FileStatus, string>> = {
  Lengkap: "badge-beres",
  "Perlu Verifikasi": "badge-berjalan",
  "Belum Diunggah": "badge-tindakan",
  Ditolak: "badge-tindakan",
  Diproses: "badge-berjalan",
}

export type StudentFile = {
  readonly name: string
  readonly status: FileStatus
  readonly fileName?: string
  readonly uploadedAt?: string
  readonly reason?: string
}

export type DocumentStudent = {
  readonly nis: string
  readonly name: string
  readonly branch: string
  readonly program: string
  readonly packageName: string
  readonly hasVertrag: boolean
  readonly files: Readonly<Record<GroupId, readonly StudentFile[]>>
}

export const BRANCHES = ["Bandung", "Jakarta", "Surabaya", "Medan"] as const
export const PROGRAMS = ["Ausbildung", "FSJ", "Studium"] as const

const done = (name: string, uploadedAt: string): StudentFile => ({
  name,
  status: "Lengkap",
  fileName: `${name.replaceAll(" ", "_")}.pdf`,
  uploadedAt,
})
const waiting = (name: string, fileName: string, uploadedAt: string): StudentFile => ({
  name,
  status: "Perlu Verifikasi",
  fileName,
  uploadedAt,
})
const missing = (name: string): StudentFile => ({ name, status: "Belum Diunggah" })
const processing = (name: string): StudentFile => ({ name, status: "Diproses" })
const rejected = (
  name: string,
  fileName: string,
  uploadedAt: string,
  reason: string,
): StudentFile => ({
  name,
  status: "Ditolak",
  fileName,
  uploadedAt,
  reason,
})

export const STUDENTS: readonly DocumentStudent[] = [
  {
    nis: "20250233",
    name: "Andi Nugroho",
    branch: "Bandung",
    program: "Ausbildung",
    packageName: "Ausbildung 45",
    hasVertrag: false,
    files: {
      pribadi: [
        waiting("Akta Lahir", "Akta_Kelahiran.pdf", "2025-02-15T09:12:00+07:00"),
        done("Kartu Keluarga", "2025-02-12"),
        done("KTP", "2025-02-12"),
        done("Ijazah Terakhir", "2025-02-12"),
        done("Transkrip Terakhir", "2025-02-12"),
        done("Pas Foto", "2025-02-12"),
      ],
      "hasil-layanan": [
        done("Paspor", "2025-01-20"),
        done("Terjemahan Akta Lahir", "2025-02-03"),
        done("Terjemahan Ijazah & Transkrip", "2025-02-03"),
        processing("Apostille Akta Lahir"),
        processing("Apostille Ijazah"),
      ],
      bewerbung: [
        done("Sertifikat Bahasa B1", "2025-02-05"),
        done("Lebenslauf", "2025-02-05"),
        waiting(
          "Motivationsschreiben",
          "Motivationsschreiben_Andi.pdf",
          "2025-02-14T10:05:00+07:00",
        ),
        missing("Video Perkenalan"),
      ],
      "dari-betrieb": GROUPS[3].files.map(missing),
    },
  },
  {
    nis: "20250241",
    name: "Rina Agustina",
    branch: "Bandung",
    program: "Ausbildung",
    packageName: "Ausbildung 45",
    hasVertrag: false,
    files: {
      pribadi: GROUPS[0].files.map((name) => done(name, "2025-02-10")),
      "hasil-layanan": [
        waiting("Paspor", "Paspor_Rina_Selesai.pdf", "2025-02-14T14:00:00+07:00"),
        processing("Terjemahan Akta Lahir"),
        processing("Terjemahan Ijazah & Transkrip"),
        processing("Apostille Akta Lahir"),
        processing("Apostille Ijazah"),
      ],
      bewerbung: [
        missing("Sertifikat Bahasa B1"),
        rejected(
          "Lebenslauf",
          "CV_Rina.pdf",
          "2025-02-01T08:30:00+07:00",
          "Format bukan Lebenslauf tabel Jerman; pakai templat dari Admission.",
        ),
        missing("Motivationsschreiben"),
        missing("Video Perkenalan"),
      ],
      "dari-betrieb": GROUPS[3].files.map(missing),
    },
  },
  {
    nis: "20250258",
    name: "Bayu Saputra",
    branch: "Jakarta",
    program: "Ausbildung",
    packageName: "Ausbildung 44",
    hasVertrag: false,
    files: {
      pribadi: GROUPS[0].files.map((name) => done(name, "2025-01-20")),
      "hasil-layanan": [
        done("Paspor", "2025-01-22"),
        done("Terjemahan Akta Lahir", "2025-01-30"),
        done("Terjemahan Ijazah & Transkrip", "2025-01-30"),
        done("Apostille Akta Lahir", "2025-02-06"),
        done("Apostille Ijazah", "2025-02-06"),
      ],
      bewerbung: [
        done("Sertifikat Bahasa B1", "2025-02-01"),
        waiting("Lebenslauf", "Lebenslauf_v2.pdf", "2025-02-13T11:30:00+07:00"),
        done("Motivationsschreiben", "2025-02-08"),
        done("Video Perkenalan", "2025-02-08"),
      ],
      "dari-betrieb": GROUPS[3].files.map(missing),
    },
  },
  {
    nis: "20250190",
    name: "Siti Rohmah",
    branch: "Surabaya",
    program: "Ausbildung",
    packageName: "Ausbildung 43",
    hasVertrag: true,
    files: {
      pribadi: GROUPS[0].files.map((name) => done(name, "2024-11-05")),
      "hasil-layanan": GROUPS[1].files.map((name) => done(name, "2025-01-15")),
      bewerbung: GROUPS[2].files.map((name) => done(name, "2025-01-28")),
      "dari-betrieb": [
        waiting("Vertrag", "Vertrag_Signed_IHK.pdf", "2025-02-12T16:45:00+07:00"),
        missing("Krankenversicherung"),
        missing("IHK"),
        missing("Rahmenplan"),
      ],
    },
  },
]

export const groupById = (id: GroupId) => GROUPS.find((group) => group.id === id) ?? GROUPS[0]

export const isGroupLocked = (student: DocumentStudent, id: GroupId) =>
  id === "dari-betrieb" && !student.hasVertrag

export const completeness = (student: DocumentStudent, id: GroupId) => {
  const files = student.files[id]
  return {
    done: files.filter((file) => file.status === "Lengkap").length,
    total: files.length,
  }
}

export const waitingCount = (student: DocumentStudent) =>
  GROUPS.reduce(
    (count, group) =>
      count + student.files[group.id].filter((file) => file.status === "Perlu Verifikasi").length,
    0,
  )

export type FileAction = {
  readonly nis: string
  readonly groupId: GroupId
  readonly fileName: string
}

export const updateFile = (
  student: DocumentStudent,
  action: FileAction,
  patch: { readonly status: FileStatus; readonly reason?: string },
): DocumentStudent =>
  student.nis !== action.nis
    ? student
    : {
        ...student,
        files: {
          ...student.files,
          [action.groupId]: student.files[action.groupId].map((file) =>
            file.name === action.fileName ? { ...file, ...patch } : file,
          ),
        },
      }

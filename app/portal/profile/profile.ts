import type { PortalProfile } from "@/src/entities/portal/schema"
import { formatDateLong } from "@/src/lib/format"

export type ProfileRow = { readonly label: string; readonly value: string }

export type ProfileSection = {
  readonly id: string
  readonly title: string
  readonly rows: readonly ProfileRow[]
}

const EMPTY = "Belum diisi"

const joined = (values: readonly (string | null)[]): string | null =>
  values.filter((value): value is string => Boolean(value)).join(", ") || null

const row = (label: string, value: string | null): ProfileRow => ({ label, value: value ?? EMPTY })

export function profileSectionsOf({ identity, companions }: PortalProfile) {
  const birth = joined([
    identity.birthPlace,
    identity.birthDate ? formatDateLong(identity.birthDate) : null,
  ])
  const address = joined([
    identity.address,
    identity.village,
    identity.district,
    identity.city,
    identity.province,
    identity.postalCode,
  ])

  return {
    personal: {
      id: "data-diri",
      title: "Data Diri",
      rows: [
        row("Nama lengkap", identity.fullName),
        row("Panggilan", identity.anrede),
        row("NIK", identity.nik),
        row("Tempat, tanggal lahir", birth),
        row("Jenis kelamin", identity.gender),
      ],
    },
    contact: {
      id: "kontak",
      title: "Kontak dan Alamat",
      rows: [
        row("HP pribadi", identity.phonePersonal),
        row("HP WhatsApp", identity.whatsapp),
        row("Email", identity.email),
        row("Alamat", address),
      ],
    },
    education: {
      id: "pendidikan",
      title: "Pendidikan Terakhir",
      rows: [
        row("Jenjang", identity.lastEducationLevel),
        row("Asal sekolah", identity.schoolName),
        row("Jurusan", identity.schoolMajor),
        row("Tahun lulus", identity.graduationYear),
        row("Jurusan diminati", identity.interestMajor),
      ],
    },
    companions: {
      id: "pendamping",
      title: "Pendamping Anda",
      rows: [
        row("PIC Konsultan", companions.pic),
        row("Cabang", companions.branch),
        row("Pengajar kelas", companions.teacher),
      ],
    },
  } satisfies Record<string, ProfileSection>
}

export const ON_LEAVE_BLOCK =
  "Selama cuti, portal terbuka tanpa aksi. Ajukan perubahan data setelah Anda kembali ke kelas."

export const NOT_CHANGEABLE_HERE = ["Paket dan harga", "No Kontrak", "Sumber lead"] as const

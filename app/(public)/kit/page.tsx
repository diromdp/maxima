"use client"

import { BarChart, KpiCard, LineChart, ResponsiveChart, Sparkline } from "@derpdaderp/chartkit"
import type { ReactNode } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { formatMoney, idr } from "@/src/lib/money"
import { CHART_COLORS, CHART_THEME } from "@/src/styles/chart-theme"
import { Notice } from "@/src/components/ui/Notice"

const CONTOH_SISWA = [
  { nis: "20250233", nama: "Andi Nugroho", status: "Aktif", sisa: 16_500_000 },
  { nis: "20250198", nama: "Sari Wulandari", status: "Cuti", sisa: 4_000_000 },
  { nis: "20240071", nama: "Bagus Pratama", status: "Alumni", sisa: 0 },
  { nis: "20250310", nama: "Dewi Lestari", status: "Aktif", sisa: 22_000_000 },
] as const

const BADGE_SISWA = {
  Aktif: "badge-beres",
  Cuti: "badge-berjalan",
  Alumni: "badge-terkunci",
} as const

const TREN = [
  { bulan: "Mar", tertagih: 182, tunggakan: 54 },
  { bulan: "Apr", tertagih: 201, tunggakan: 49 },
  { bulan: "Mei", tertagih: 214, tunggakan: 61 },
  { bulan: "Jun", tertagih: 243, tunggakan: 38 },
  { bulan: "Jul", tertagih: 258, tunggakan: 44 },
  { bulan: "Agu", tertagih: 277, tunggakan: 31 },
]

const CABANG = [
  { cabang: "Jakarta", siswa: 148 },
  { cabang: "Bandung", siswa: 96 },
  { cabang: "Surabaya", siswa: 74 },
  { cabang: "Medan", siswa: 42 },
]

const TONES = ["success", "warning", "danger", "info", "neutral"] as const

const STATUS = [
  ["beres", "Lunas"],
  ["berjalan", "Menunggu"],
  ["tindakan", "Terlambat"],
  ["terbuka", "Belum Dimulai"],
  ["terkunci", "Terkunci"],
] as const

const rupiah = (value: number) => formatMoney(idr(value))

function Spec({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <div className="spec-row">
      <div className="stack stack-sm">
        <code className="spec-name">{name}</code>
        {note && <span className="caption text-muted">{note}</span>}
      </div>
      <div className="stack stack-sm">{children}</div>
    </div>
  )
}

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="stack">
      <div className="section-head">
        <h3>{title}</h3>
        <p className="body-sm text-muted">{lead}</p>
      </div>
      <div className="card">{children}</div>
    </section>
  )
}

export default function KitPage() {
  return (
    <div className="page">
      <main className="container section stack-lg">
        <header className="stack stack-sm">
          <p className="label text-muted">Pustaka kelas</p>
          <h1>Maxima design kit.</h1>
          <p className="body-lg text-muted" style={{ maxWidth: "62ch" }}>
            Semua kelas diturunkan dari design.md. Panggil kelasnya, jangan menulis ulang nilainya —
            kalau sebuah hex muncul di dalam komponen, ia salah tempat.
          </p>
        </header>

        <Section
          title="Tipografi"
          lead="Montserrat 650 untuk judul, Poppins 400 untuk teks, 300 untuk subtitel."
        >
          <Spec name=".display" note="80 → 56 → 40px">
            <p className="display">Rp 4,2 M</p>
          </Spec>
          <Spec name="h1 / .h1" note="56 → 36px">
            <p className="h1">Piutang cabang.</p>
          </Spec>
          <Spec name="h2 / .h2" note="44 → 30px">
            <p className="h2">Antrian verifikasi.</p>
          </Spec>
          <Spec name="h3 / .h3" note="32 → 24px">
            <p className="h3">Sesi kelas hari ini.</p>
          </Spec>
          <Spec name="h4 / .h4" note="24px">
            <p className="h4">Dokumen siswa</p>
          </Spec>
          <Spec name=".title" note="20px · 600">
            <p className="title">Rincian pembayaran</p>
          </Spec>
          <Spec name=".body-lg" note="20px · 300">
            <p className="body-lg">Pasangan ringan untuk judul yang berat.</p>
          </Spec>
          <Spec name=".body / .body-sm">
            <p className="body">Body 16 — copy default untuk paragraf dan isi kartu.</p>
            <p className="body-sm text-muted">Body small 14 — copy pendukung dan sel tabel.</p>
          </Spec>
          <Spec name=".label / .caption">
            <p className="label">Label 12 · 600</p>
            <p className="caption text-faint">Caption 12 — metadata dan cetakan kecil.</p>
          </Spec>
          <Spec name=".tabular" note="wajib di kolom angka">
            <p className="body tabular">Rp 45.000.000 · € 800 · 91% · 12 Feb 2025</p>
          </Spec>
        </Section>

        <Section
          title="Tombol"
          lead="Semuanya pil. Tinta untuk aksi utama, nada untuk aksi yang punya akibat."
        >
          <Spec name=".btn-primary .btn-secondary" note="aksi utama dan kembarannya">
            <div className="row row-wrap">
              <button className="btn btn-primary">Simpan</button>
              <button className="btn btn-secondary">Batal</button>
              <button className="btn btn-soft">Lihat semua</button>
              <button className="btn btn-ghost btn-sm">Detail</button>
            </div>
          </Spec>
          <Spec name=".btn-success .btn-warning .btn-error" note="isian penuh, teks putih">
            <div className="row row-wrap">
              <button className="btn btn-success">Verifikasi</button>
              <button className="btn btn-warning">Tunda</button>
              <button className="btn btn-error">Hapus</button>
              <button className="btn btn-info">Buka Sesi</button>
            </div>
          </Spec>
          <Spec name=".btn-*-soft" note="aksi bernada yang bukan aksi utama">
            <div className="row row-wrap">
              <button className="btn btn-success-soft btn-sm">Setujui</button>
              <button className="btn btn-warning-soft btn-sm">Remedial</button>
              <button className="btn btn-danger-soft btn-sm">Tolak</button>
              <button className="btn btn-neutral-soft btn-sm">Arsipkan</button>
            </div>
          </Spec>
          <Spec name=".btn-sm .btn-lg">
            <div className="row row-wrap">
              <button className="btn btn-secondary btn-sm">Kecil 36</button>
              <button className="btn btn-secondary">Normal 44</button>
              <button className="btn btn-secondary btn-lg">Besar 52</button>
            </div>
          </Spec>
          <Spec name=":disabled" note="alasannya wajib terbaca sebelum ditekan">
            <div className="row row-wrap">
              <button className="btn btn-primary" disabled>
                Terbitkan Rapor
              </button>
              <span className="badge badge-warning">Absensi belum lengkap</span>
            </div>
          </Spec>
        </Section>

        <Section
          title="Status"
          lead="Hijau baik, merah buruk, kuning berjalan, biru terbuka, abu terkunci — dan setiap warna berpasangan dengan katanya."
        >
          <Spec name=".badge-{nada}" note="isian lembut + garis senada">
            <div className="row row-wrap">
              {TONES.map((tone) => (
                <span key={tone} className={`badge badge-${tone}`}>
                  {tone}
                </span>
              ))}
            </div>
          </Spec>
          <Spec name=".badge-{status}" note="nama domain menunjuk nada yang sama">
            <div className="row row-wrap">
              {STATUS.map(([status, label]) => (
                <span key={status} className={`badge badge-${status}`}>
                  {label}
                </span>
              ))}
            </div>
          </Spec>
          <Spec name=".badge-{status}-solid" note="kalau harus terbaca dari jauh">
            <div className="row row-wrap">
              {STATUS.map(([status, label]) => (
                <span key={status} className={`badge badge-${status}-solid`}>
                  {label}
                </span>
              ))}
            </div>
          </Spec>
          <Spec name=".badge-accent .badge-overlay">
            <div className="row row-wrap">
              <span className="badge badge-accent">Populer</span>
              <span className="badge badge-overlay">Di atas foto</span>
            </div>
          </Spec>
          <Spec name=".text-{nada}" note="nominal kurang ditulis merah sebagai teks, bukan badge">
            <p className="body tabular text-danger">Kurang Rp 5.500.000 lagi</p>
            <p className="body tabular text-success">Lunas — Rp 45.000.000</p>
          </Spec>
        </Section>

        <Section
          title="Permukaan"
          lead="Kedalaman dari beda isian dan garis rambut. Tidak ada bayangan di sistem ini."
        >
          <Spec name=".card .card-soft .card-inverse">
            <div className="grid-3">
              <div className="card">
                <p className="title">card</p>
                <p className="body-sm text-muted">Putih, garis rambut, radius 24.</p>
              </div>
              <div className="card-soft">
                <p className="title">card-soft</p>
                <p className="body-sm text-muted">Penekanan lewat tint.</p>
              </div>
              <div className="card-inverse">
                <p className="title text-on-primary">card-inverse</p>
                <p className="body-sm text-faint">Pembalikan polaritas.</p>
              </div>
            </div>
          </Spec>
          <Spec name=".row-soft" note="baris FAQ / akordeon">
            <div className="row-soft">
              <span className="body-sm">Kenapa piutang siswa Cuti tetap tampil?</span>
              <span className="caption text-muted">buka</span>
            </div>
          </Spec>
          <Spec name="Notice tone={nada}" note="ikon dan warna teks ikut nadanya">
            <Notice tone="info">Siswa berstatus Cuti tetap tampil di piutang.</Notice>
            <Notice tone="warning">Rapor tidak dapat terbit bila absensi belum lengkap.</Notice>
            <Notice tone="danger" title="Berkas ditolak">
              Unggah ulang dengan hasil pindai berwarna.
            </Notice>
            <Notice tone="success">Pembayaran terverifikasi.</Notice>
            <Notice tone="neutral">Level B2 belum dibuka.</Notice>
          </Spec>
          <Spec name=".progress-{nada}" note="angka persennya wajib di sebelahnya">
            <div className="row">
              <div className="progress progress-success" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: "100%" }} />
              </div>
              <span className="caption tabular text-success">100%</span>
            </div>
            <div className="row">
              <div className="progress" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: "78%" }} />
              </div>
              <span className="caption tabular text-muted">78%</span>
            </div>
            <div className="row">
              <div className="progress progress-danger" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: "23%" }} />
              </div>
              <span className="caption tabular text-danger">23%</span>
            </div>
          </Spec>
          <Spec name=".squircle .media" note="ikon 30%, media 24px">
            <div className="row">
              <div
                className="squircle"
                style={{ width: 56, height: 56, backgroundColor: "var(--canvas-soft)" }}
              />
              <div
                className="media"
                style={{ width: 96, height: 56, backgroundColor: "var(--hairline-soft)" }}
              />
            </div>
          </Spec>
        </Section>

        <Section
          title="Form dan navigasi"
          lead="Input beristirahat tanpa garis; garis muncul sebagai cincin tinta saat fokus."
        >
          <Spec name=".field .field-label .field-hint">
            <label className="field-label" htmlFor="kit-email">
              Surel
            </label>
            <input className="field" id="kit-email" placeholder="nama@maxima.id" />
            <p className="field-hint">Cincin tinta muncul saat fokus.</p>
          </Spec>
          <Spec name=".field-error">
            <input className="field" defaultValue="nama@" aria-invalid />
            <p className="field-error">Surel belum lengkap.</p>
          </Spec>
          <Spec name=".segmented">
            <div className="segmented">
              <button className="segmented-item is-active">Bulanan</button>
              <button className="segmented-item">Tahunan</button>
            </div>
          </Spec>
          <Spec name=".nav-row .pill">
            <a className="nav-row is-active" href="#kit">
              Dashboard
            </a>
            <a className="nav-row" href="#kit">
              Pembayaran
            </a>
            <span className="pill">Cabang: Semua</span>
          </Spec>
          <Spec name=".link">
            <a className="link" href="#kit">
              Tautan sebaris
            </a>
          </Spec>
        </Section>

        <Section
          title="Tabel"
          lead="Padat dan rata: kolom angka rata kanan, kolom aksi paling kanan, bergulir mendatar di layar sempit."
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Status</th>
                  <th className="numeric">Tagihan</th>
                  <th className="numeric">Kurang</th>
                  <th>Tren</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rizky Amelia</td>
                  <td>
                    <span className="badge badge-beres">Lunas</span>
                  </td>
                  <td className="numeric tabular">Rp 45.000.000</td>
                  <td className="numeric tabular">Rp 0</td>
                  <td>
                    <Sparkline
                      className="chart-spark"
                      data={[12, 18, 14, 22, 27, 31]}
                      theme={CHART_THEME}
                      color={CHART_COLORS.success}
                      width={96}
                      height={24}
                    />
                  </td>
                  <td className="numeric">
                    <button className="btn btn-ghost btn-sm">Detail</button>
                  </td>
                </tr>
                <tr>
                  <td>Bagus Prasetyo</td>
                  <td>
                    <span className="badge badge-tindakan">Terlambat 12 hari</span>
                  </td>
                  <td className="numeric tabular">Rp 45.000.000</td>
                  <td className="numeric tabular text-danger">Rp 5.500.000</td>
                  <td>
                    <Sparkline
                      className="chart-spark"
                      data={[22, 19, 20, 15, 14, 11]}
                      theme={CHART_THEME}
                      color={CHART_COLORS.danger}
                      width={96}
                      height={24}
                    />
                  </td>
                  <td className="numeric">
                    <button className="btn btn-ghost btn-sm">Detail</button>
                  </td>
                </tr>
                <tr>
                  <td>Sinta Wulandari</td>
                  <td>
                    <span className="badge badge-berjalan">Menunggu verifikasi</span>
                  </td>
                  <td className="numeric tabular">Rp 45.000.000</td>
                  <td className="numeric tabular">Rp 15.000.000</td>
                  <td>
                    <Sparkline
                      className="chart-spark"
                      data={[8, 12, 12, 17, 19, 21]}
                      theme={CHART_THEME}
                      color={CHART_COLORS.warning}
                      width={96}
                      height={24}
                    />
                  </td>
                  <td className="numeric">
                    <button className="btn btn-ghost btn-sm">Detail</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="DataTable"
          lead="Tabel di atas plus saring (pil bersegmen), urut per kolom, dan kaki halaman. Dipakai setiap layar yang menampilkan daftar."
        >
          <DataTable
            rows={CONTOH_SISWA}
            rowKey={(s) => s.nis}
            filter={{ value: (s) => s.status, options: ["Aktif", "Cuti", "Alumni"] }}
            defaultSort={{ key: "nama", dir: "asc" }}
            columns={[
              { key: "nama", header: "Nama", sort: (s) => s.nama, cell: (s) => s.nama },
              { key: "nis", header: "NIS", sort: (s) => s.nis, cell: (s) => s.nis },
              {
                key: "status",
                header: "Status",
                sort: (s) => s.status,
                cell: (s) => <span className={`badge ${BADGE_SISWA[s.status]}`}>{s.status}</span>,
              },
              {
                key: "sisa",
                header: "Sisa",
                align: "right",
                sort: (s) => s.sisa,
                cell: (s) => formatMoney(idr(s.sisa)),
              },
            ]}
          />
        </Section>

        <section className="stack">
          <div className="section-head">
            <h3>Grafik</h3>
            <p className="body-sm text-muted">
              Seri yang diharapkan naik berwarna hijau, yang diharapkan turun merah — grafik terbaca
              sebelum legendanya dibaca.
            </p>
          </div>

          <div className="chart-kpis">
            <KpiCard
              label="Tertagih bulan ini"
              value={277_000_000}
              delta={7.4}
              data={TREN}
              dataKey="tertagih"
              theme={CHART_THEME}
              format={rupiah}
            />
            <KpiCard
              label="Tunggakan"
              value={31_000_000}
              delta={-29.5}
              data={TREN}
              dataKey="tunggakan"
              theme={CHART_THEME}
              format={rupiah}
            />
            <KpiCard label="Siswa aktif" value={360} delta={2.1} theme={CHART_THEME} />
            <KpiCard label="Verifikasi menunggu" value={18} delta={-12} theme={CHART_THEME} />
          </div>

          <div className="grid-main-aside">
            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-title">Tertagih vs tunggakan</p>
                <p className="chart-note">enam bulan terakhir · juta rupiah</p>
              </div>
              <ResponsiveChart
                height={280}
                minWidth={240}
                placeholder={<div className="chart-skeleton" />}
              >
                {({ width, height }) => (
                  <LineChart
                    data={TREN}
                    timeKey="bulan"
                    series={[
                      {
                        key: "tertagih",
                        label: "Tertagih",
                        color: CHART_COLORS.success,
                        area: true,
                      },
                      { key: "tunggakan", label: "Tunggakan", color: CHART_COLORS.danger },
                    ]}
                    theme={CHART_THEME}
                    width={width}
                    height={height}
                    showLegend
                  />
                )}
              </ResponsiveChart>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-title">Siswa per cabang</p>
              </div>
              <ResponsiveChart
                height={220}
                minWidth={200}
                placeholder={<div className="chart-skeleton" />}
              >
                {({ width, height }) => (
                  <BarChart
                    data={CABANG}
                    categoryKey="cabang"
                    dataKey="siswa"
                    theme={CHART_THEME}
                    width={width}
                    height={height}
                    orientation="horizontal"
                    barRadius={6}
                    showLabels
                  />
                )}
              </ResponsiveChart>
            </div>
          </div>
        </section>

        <Section
          title="Responsif"
          lead="mobile 0 · tablet 768 · laptop 1024 · desktop 1280 · wide 1536. Grid runtuh kolom demi kolom."
        >
          <Spec name=".grid-4" note="4 → 2 → 1 kolom">
            <div className="grid-4">
              {["satu", "dua", "tiga", "empat"].map((n) => (
                <div key={n} className="card-soft card-tight">
                  <p className="body-sm">{n}</p>
                </div>
              ))}
            </div>
          </Spec>
          <Spec name=".only-mobile .hide-mobile .only-desktop" note="coba kecilkan jendelanya">
            <p className="body-sm only-mobile">Terlihat di mobile saja.</p>
            <p className="body-sm hide-mobile">Tersembunyi di mobile.</p>
            <p className="body-sm only-desktop">Desktop saja — ≥ 1280px.</p>
          </Spec>
        </Section>
      </main>
    </div>
  )
}

// Pemeriksaan mobile-first: buka tiap rute di lebar 390px lewat Chrome headless
// (CDP, tanpa dependensi) dan laporkan elemen yang melewati tepi viewport di
// luar `.table-scroll`. Dev server harus sudah jalan.
//
//   pnpm check:mobile                         # rute bawaan di bawah
//   pnpm check:mobile /portal/payments 360    # satu rute, lebar lain
import { spawn } from "node:child_process"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const DEFAULT_ROUTES = [
  "/",
  "/register",
  "/staff/login",
  "/staff/dashboard",
  "/staff/settings/users",
  "/staff/settings/master-data",
  "/staff/settings/print-templates",
  "/staff/settings/activity-log",
  "/staff/leave",
  "/staff/classes",
  "/staff/classes?tab=members",
  "/staff/classes?tab=calendar",
  "/staff/classes?tab=kkm",
  "/staff/class-sessions",
  "/staff/assessments",
  "/staff/assessments?tab=exams",
  "/staff/assessments?tab=attitude",
  "/staff/assessments?tab=notes",
  "/staff/packages-promos",
  "/staff/packages-promos?tab=promos",
  "/staff/payments",
  "/staff/reports",
  "/staff/reports?tab=yearly",
  "/staff/reports?tab=packages",
  "/staff/reports?tab=pics",
  "/staff/invoices",
  "/staff/invoices?tab=due",
  "/staff/invoices?tab=reminders",
  "/staff/monitoring",
  "/staff/monitoring?tab=classes",
  "/staff/monitoring?tab=at-risk",
  "/staff/report-cards",
  "/staff/report-cards/2026001?level=A2",
  "/staff/certificate-exams",
  "/staff/certificate-exams?tab=recommendations",
  "/staff/certificate-exams?tab=schedules",
  "/staff/documents",
  "/staff/services",
  "/staff/services/20250233",
  "/staff/documents/20250233",
  "/staff/partners",
  "/staff/partners?tab=applications",
  "/staff/partners?tab=practice",
  "/staff/partners?tab=tracking",
  "/staff/visa-placement",
  "/staff/visa-placement/20240101",
  "/staff/leave/CUTI-2026-0719-0233",
  "/staff/leave/CUTI-2026-0808-0247",
  "/staff/leave/CUTI-2026-0705-0258",
  "/staff/leave/CUTI-2026-0501-0190",
  "/portal/dashboard",
  "/portal/payments",
  "/portal/admin-progress",
  "/portal/learning",
  "/portal/language-certificates",
  "/portal/documents",
  "/portal/alumni-files",
  "/portal/profile",
  "/portal/profile/change-request",
  "/portal/leave",
  "/portal/leave/new",
  "/portal/leave/CUTI-2026-1201-0233",
  "/portal/leave/CUTI-2025-1001-0233",
]
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : "google-chrome")

const [routeArg, widthArg] = process.argv.slice(2)
const routes = routeArg ? [routeArg] : DEFAULT_ROUTES
const width = Number(widthArg ?? 390)
const port = 9333

// Dievaluasi di halaman. Gulir mendatar hanya boleh di penggulir komponen
// (`.table-scroll`, bilah langkah) — bukan di penggulir tingkat halaman: html
// dan tiap elemen selebar viewport yang tidak punya leluhur penggulir (kolom
// konten `AppShell`). Untuk penggulir halaman yang bergulir, sebutkan elemen
// yang mendorongnya supaya penyebabnya langsung terbaca.
const PROBE = `(() => {
  const vw = document.documentElement.clientWidth
  const isScroller = (el) => {
    const ox = getComputedStyle(el).overflowX
    return ox === "auto" || ox === "scroll"
  }
  const hasScrollingAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      if (isScroller(p)) return true
    }
    return false
  }
  const pageScrollers = [document.documentElement]
  for (const el of document.querySelectorAll("body *")) {
    if (isScroller(el) && el.clientWidth >= vw - 1 && !hasScrollingAncestor(el)) pageScrollers.push(el)
  }
  const out = []
  for (const scroller of pageScrollers) {
    if (scroller.scrollWidth <= scroller.clientWidth + 1) continue
    for (const el of scroller.querySelectorAll("*")) {
      const r = el.getBoundingClientRect()
      if (r.right <= vw + 1) continue
      // Lewati yang bergulir sah di dalam penggulir komponen.
      let p = el.parentElement, inComponentScroller = false
      for (; p && p !== scroller; p = p.parentElement) if (isScroller(p)) { inComponentScroller = true; break }
      if (inComponentScroller) continue
      const cls = typeof el.className === "string" ? el.className.split(" ").slice(0, 3).join(".") : ""
      out.push(el.tagName.toLowerCase() + (cls ? "." + cls : "") + " " + Math.round(r.width) + "px: " + (el.textContent || "").trim().slice(0, 40))
    }
  }
  return out
})()`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    `--window-size=${width},900`,
    `--user-data-dir=${process.env.TEMP ?? "/tmp"}/maxima-mobile-check`,
    "about:blank",
  ],
  { stdio: "ignore" },
)

let target
for (let i = 0; i < 40 && !target; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    target = list.find((t) => t.type === "page")
  } catch {}
  if (!target) await sleep(250)
}
if (!target) {
  console.error("Chrome tidak bisa dibuka. Set CHROME_PATH kalau lokasinya berbeda.")
  process.exit(2)
}

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d)
    pending.delete(d.id)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })

await send("Emulation.setDeviceMetricsOverride", {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: true,
})
await send("Page.enable")

let failed = 0
for (const route of routes) {
  await send("Page.navigate", { url: BASE + route })
  await sleep(4000) // ponytail: tunggu tetap, ganti Page.loadEventFired kalau ada rute yang lambat
  const res = await send("Runtime.evaluate", { expression: PROBE, returnByValue: true })
  const overflow = res.result.result.value ?? []
  if (overflow.length === 0) {
    console.log(`ok   ${route}`)
  } else {
    failed++
    console.log(`GAGAL ${route} — ${overflow.length} elemen melewati ${width}px:`)
    for (const line of overflow.slice(0, 8)) console.log(`      ${line}`)
  }
}

ws.close()
chrome.kill()
process.exit(failed ? 1 : 0)

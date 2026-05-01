export type Report = {
  id: string
  date: string
  roadName: string     // 🔥 BARU
  landmark: string     // 🔥 BARU
  damage: string
  status: "Terkirim" | "Diproses" | "Selesai"
  lat: number
  lng: number
  images: string[]
  description: string

  // 🔥 TAMBAHAN
  userName: string
  userEmail: string
  userPhone: string
}

const STORAGE_KEY = "reports"

export const getReports = (): Report[] => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}
export const saveReports = (data: Report[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 🔥 tambah laporan
export const addReport = (report: Report) => {
  const reports = getReports()
  const updated = [...reports, report]

  saveReports(updated) // 🔥 WAJIB pakai ini

  // 🔥 trigger realtime
  window.dispatchEvent(new Event("reportUpdated"))
}

export const updateReportStatus = (
  id: string,
  newStatus: Report["status"]
) => {
  const reports = getReports()

  const updated = reports.map((r) =>
    r.id === id ? { ...r, status: newStatus } : r
  )

  saveReports(updated)

  window.dispatchEvent(new Event("reportUpdated"))
}

export const deleteReport = (id: string) => {
  const reports = getReports();
  const filtered = reports.filter((r) => r.id !== id);

  localStorage.setItem("reports", JSON.stringify(filtered));

  // 🔥 TRIGGER REALTIME
  window.dispatchEvent(new Event("reportUpdated"));
};
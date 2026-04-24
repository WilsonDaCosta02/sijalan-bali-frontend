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

const getStorageKey = () => {
  const mode = localStorage.getItem("userMode")
  return mode === "guest" ? "guestReports" : "userReports"
}

// 🔥 ambil data
export const getReports = () => {
  const key = getStorageKey()
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// 🔥 simpan semua
export const saveReports = (data: Report[]) => {
  const key = getStorageKey()
  localStorage.setItem(key, JSON.stringify(data))
}

// 🔥 tambah laporan
export const addReport = (report: Report) => {
  const key = getStorageKey()
  const reports = getReports()
  const updated = [...reports, report]
  localStorage.setItem(key, JSON.stringify(updated))
}
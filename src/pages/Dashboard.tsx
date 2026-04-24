import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import folderIcon from "../assets/folder.png"
import toolsIcon from "../assets/tools.png"
import checkIcon from "../assets/check.png"
import MapView from "../components/MapView"
import { getReports } from "../utils/reportStorage"
import type { Report } from "../utils/reportStorage"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"


const Dashboard = () => {
const [openSidebar, setOpenSidebar] = useState(false)
const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
const reports: Report[] = getReports()
const total = reports.length
const diproses = reports.filter(r => r.status === "Diproses").length
const selesai = reports.filter(r => r.status === "Selesai").length
const [showLoginWarning, setShowLoginWarning] = useState(false)
const navigate = useNavigate()

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)

    if (!mobile) {
      setOpenSidebar(true) // 🔥 paksa sidebar muncul di desktop
    }
  }

  window.addEventListener("resize", handleResize)
  return () => window.removeEventListener("resize", handleResize)
}, [])

  return (
    <>
      <Navbar setOpenSidebar={setOpenSidebar} />

      <div style={styles.container}>
    <Sidebar 
  open={isMobile ? openSidebar : true} 
  setOpen={setOpenSidebar} 
/>

        <div style={styles.content}>
          <div style={styles.header(isMobile)}>
            <div>
              <h1 style={styles.title}>Dashboard</h1>
              <p style={styles.subtitle} className="subtitle-green">
  Ringkasan aktivitas pelaporan kerusakan jalan Anda.
</p>
            </div>

            <button
  className="btn-primary"
 onClick={() => {
  const isLogin = localStorage.getItem("isLogin") === "true"

  if (!isLogin) {
    setShowLoginWarning(true)
  } else {
    navigate("/create-report")
  }
}}
>
  + Lapor Kerusakan Jalan
</button>
          </div>

          <div style={styles.headerDivider} className="divider-dynamic"></div>

          {/* STAT */}
          <div style={styles.stats(isMobile)}>
  {/* TOTAL */}
  <div style={styles.card}>
    <div>
      <p style={styles.cardTitle}>Total Laporan Saya</p>
      <h2>{total}</h2>
    </div>

    <div style={styles.iconWrapper}>
      <img src={folderIcon} style={styles.icon} />
    </div>
  </div>

  {/* DIPROSES */}
  <div style={styles.card}>
    <div>
      <p style={styles.cardTitle}>Laporan Diproses</p>
      <h2>{diproses}</h2>
    </div>

   <div style={styles.iconWrapper}>
      <img src={toolsIcon} style={styles.icon} />
    </div>
  </div>

  {/* SELESAI */}
  <div style={styles.card}>
    <div>
      <p style={styles.cardTitle}>Laporan Selesai</p>
      <h2>{selesai}</h2>
    </div>

    <div style={styles.iconWrapper}>
      <img src={checkIcon} style={styles.icon} />
    </div>
  </div>
</div>

          {/* MAP */}
          <div style={styles.map}>
            <p className="map-title">Peta Lokasi Laporan Anda</p>
           <div style={styles.mapBox}>
              <MapView markers={reports} />
            </div>
          </div>

<div style={styles.table} className="table-dark-text">
  <p>Riwayat Laporan Terakhir</p>

  {/* HEADER */}
  <div style={styles.rowHeader(isMobile)}>
    <span>Tanggal</span>
    <span>Lokasi</span>
    <span style={{ textAlign: "right" }}>Tingkat Kerusakan</span>
    <span style={{ textAlign: "right", paddingRight: "15px" }}>Status</span>
  </div>

  {reports.length === 0 ? (
    <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                Belum ada laporan 😢
              </div>
  ) : (
   reports.slice(-3).map((item, i) => (
  <div
    key={i}
    style={styles.row(isMobile)}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor =
        "rgba(148,163,184,0.05)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    <span>
      {isMobile && <b>Tanggal: </b>}
      {item.date}
    </span>

    <span style={{ wordBreak: "break-word" }}>
      {isMobile && <b>Lokasi: </b>}
      {item.roadName}
      {item.landmark && ` (${item.landmark})`}
    </span>

    <span style={{ textAlign: isMobile ? "left" : "right" }}>
      {isMobile && <b>Kerusakan: </b>}
      {item.damage}
    </span>

    <span style={{ textAlign: isMobile ? "left" : "right" }}>
      {isMobile && <b>Status: </b>}
      <span
        style={{
          ...styles.badge,
          backgroundColor:
            item.status === "Selesai"
              ? "rgba(34,197,94,0.2)"
              : item.status === "Diproses"
              ? "rgba(234,179,8,0.2)"
              : "rgba(59,130,246,0.2)",
          color:
            item.status === "Selesai"
              ? "#22c55e"
              : item.status === "Diproses"
              ? "#facc15"
              : "#3b82f6",
        }}
      >
        {item.status}
      </span>
    </span>
  </div>
))
  )}
</div>
        </div>
      </div>
      {showLoginWarning && (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <h3 style={{ marginBottom: "8px" }}>Akses Dibatasi</h3>

      <p style={{ fontSize: "14px", color: "#94a3b8" }}>
        Untuk membuat laporan, silakan masuk terlebih dahulu ke akun Anda.
      </p>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "center" }}>
        <button
          className="btn-primary"
          onClick={() => navigate("/login")}
        >
          Masuk Sekarang
        </button>

        <button
          style={styles.modalBtn}
          onClick={() => setShowLoginWarning(false)}
        >
          Nanti Saja
        </button>
      </div>
    </div>
  </div>
)}
    </>
  )
}

const styles = {
  container: {
    display: "flex",
    width: "100%",
     height: "calc(100vh - 60px)",
  },
  content: {
    flex: 1,
    padding: "28px 24px", // 🔥 tambah napas
    backgroundColor: "var(--bg-main)",
color: "var(--text-main)",
    overflowY: "auto" as const,
    paddingBottom: "80px",
  },
  header: (isMobile: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  justifyContent: "space-between",
  alignItems: isMobile ? "flex-start" : "center",
  gap: isMobile ? "12px" : "0px",
  marginBottom: "60px",
}),
  title: {
  fontSize: "28px",
  fontWeight: "600",
  color: "var(--text-main)",
  margin: 0,
},

subtitle: {
  fontSize: "14px",
  color: "var(--text-main)", // default (dark putih)
  marginTop: "6px",
},
  button: {
    backgroundColor: "rgba(15,118,110,1)",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
 stats: (isMobile: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  gap: "15px",
  marginBottom: "20px",
}),
  headerDivider: {
  height: "1px",
  marginBottom: "30px",
  marginTop: "-50px",   // 🔥 naik ke atas
},
  card: {
  flex: 1,
  backgroundColor: "#1E293B",
  padding: "16px",
  borderRadius: "12px",
  display: "flex",                 // 🔥 WAJIB
  justifyContent: "space-between", // 🔥 kiri - kanan
  alignItems: "center",            // 🔥 tengah vertikal
},
  map: {
    backgroundColor: "#1E293B",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  mapBox: {
    height: "300px",
    backgroundColor: "#334155",
    borderRadius: "8px",
    marginTop: "10px",
    width: "100%",
  },
  table: {
    backgroundColor: "#1E293B",
    padding: "20px",
    borderRadius: "10px",
  },
  rowHeader: (isMobile: boolean): React.CSSProperties => ({
  display: isMobile ? "none" : "grid",
  gridTemplateColumns: "1fr 2fr 1fr 1fr",
  padding: "10px 0",
  color: "#94a3b8",
  fontSize: "13px",
  borderBottom: "1px solid #334155",
}),

cardTitle: {
  fontSize: "13px",
  color: "#94a3b8",
  marginBottom: "6px",
},

iconWrapper: {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.05)", //
},

icon: {
  width: "45px",
  height: "45px",
},
row: (isMobile: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isMobile
    ? "1fr"
    : "1fr 2fr 1fr 1fr",
  padding: "14px 0",
  borderBottom: "1px solid #334155",
  alignItems: "start",
  gap: "8px",
  lineHeight: "1.5",
}),
badge: {
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "500",
},
modalOverlay: {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
},

modal: {
  backgroundColor: "#1E293B",
  padding: "24px",
  borderRadius: "12px",
  textAlign: "center" as const,
  width: "320px",
},

modalBtn: {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(148,163,184,0.2)",
  backgroundColor: "#020617",
  color: "white",
  cursor: "pointer",
},
}

export default Dashboard
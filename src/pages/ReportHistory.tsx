import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import { getReports } from "../utils/reportStorage"
import type { Report } from "../utils/reportStorage"
import { useState, useEffect } from "react"

const ReportHistory = () => {
  const reports: Report[] = getReports() || []

  const [openSidebar, setOpenSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
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
          {/* HEADER */}
          <div style={styles.header}>
            <h1 style={styles.title}>Riwayat Laporan Anda</h1>
            <p style={styles.subtitle} className="subtitle-green">
              Daftar seluruh pelaporan kerusakan jalan yang telah Anda ajukan.
            </p>
          </div>

          <div style={styles.headerDivider} className="divider-dynamic"></div>

          {/* CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              ⏱️ Riwayat Laporan Terakhir
            </div>

            {/* TABLE HEADER */}
            <div style={styles.tableHeader(isMobile)}>
              <span>Tanggal</span>
              <span>Lokasi / Jalan</span>
              <span style={{ textAlign: "right" }}>Tingkat Kerusakan</span>
              <span style={{ textAlign: "right" }}>Status</span>
            </div>

            {/* DATA */}
            {reports.length === 0 ? (
              <div style={styles.empty}>
                Belum ada laporan 😢
              </div>
            ) : (
              reports.map((item, i) => (
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

                  <span style={styles.location}>
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
    </>
  )
}

const styles = {
  container: {
    display: "flex",
   height: "calc(100vh - 60px)",
    overflow: "visible",
  },

  content: {
    flex: 1,
    padding: "28px 24px",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-main)",
    overflowY: "auto" as const,
    paddingBottom: "80px",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
    margin: 0,
  },

  subtitle: {
    fontSize: "14px",
    marginTop: "6px",
  },

  headerDivider: {
    height: "1px",
    marginBottom: "25px",
    marginTop: "-15px",
  },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.1)",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(148,163,184,0.2)",
    fontWeight: "600",
    color: "white",
  },

  tableHeader: (isMobile: boolean) => ({
    display: isMobile ? "none" : "grid",
    gridTemplateColumns: "1fr 2fr 1fr 1fr",
    padding: "16px 20px",
    color: "#94a3b8",
    fontSize: "13px",
  }),

  row: (isMobile: boolean) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr 1fr",
    padding: "18px 20px",
    borderTop: "1px solid rgba(148,163,184,0.08)",
    alignItems: "start",
    gap: "8px",
    lineHeight: "1.5",
    color: "#e2e8f0",
    cursor: "pointer",
  }),

  location: {
    fontWeight: 500,
    lineHeight: "1.4",
    wordBreak: "break-word" as const,
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
  },

  empty: {
    padding: "20px",
    textAlign: "center" as const,
    color: "#94a3b8",
  },
}

export default ReportHistory
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getReports } from "../../utils/reportStorage";
import { useState, useEffect } from "react";

const ReportHistory = () => {
  const user = JSON.parse(localStorage.getItem("registeredUser") || "{}");
  const mode = localStorage.getItem("userMode");

  const initialReports =
    mode === "guest" || !user?.email
      ? []
      : getReports().filter((r) => r.userEmail === user.email);

  const [reports, setReports] = useState(initialReports);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleUpdate = () => {
      const mode = localStorage.getItem("userMode");
      const user = JSON.parse(localStorage.getItem("registeredUser") || "{}");

      const allReports = getReports();

      // 🔥 TAMU = KOSONG
      if (mode === "guest") {
        setReports([]);
        return;
      }

      // 🔥 USER INVALID = KOSONG
      if (!user?.email) {
        setReports([]);
        return;
      }

      // 🔥 FILTER USER
      const myReports = allReports.filter((r) => r.userEmail === user.email);

      setReports(myReports);
    };

    // 🔥 LISTENER REALTIME
    window.addEventListener("reportUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // 🔥 RUN AWAL
    handleUpdate();

    return () => {
      window.removeEventListener("reportUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            <div style={styles.cardHeader}>⏱️ Seluruh Riwayat Laporan Anda</div>

            {/* TABLE HEADER */}
            <div style={styles.tableHeader(isMobile)}>
              <span>Tanggal</span>
              <span>Lokasi / Jalan</span>
              <span style={{ textAlign: "center", paddingRight: "13px" }}>
                Foto
              </span>{" "}
              {/* 🔥 TAMBAH INI */}
              <span style={{ textAlign: "right" }}>Tingkat Kerusakan</span>
              <span style={{ textAlign: "right", paddingRight: "15px" }}>
                Status
              </span>
            </div>

            {/* DATA */}
            {reports.length === 0 ? (
              <div style={styles.empty}>Belum ada laporan 😢</div>
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

                  {/* 🔥 FOTO */}
                  <span style={styles.photoCell(isMobile)}>
                    {isMobile && <b>Foto: </b>}

                    {item.images && item.images.length > 0 ? (
                      <div style={styles.imageWrapper}>
                        <img
                          src={item.images[0]}
                          style={styles.thumbnail}
                          onClick={() => {
                            setPreviewImages(item.images);
                            setCurrentIndex(0);
                          }}
                        />

                        {item.images.length > 1 && (
                          <small style={styles.morePhoto}>
                            +{item.images.length - 1}
                          </small>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>-</span>
                    )}
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
      {previewImages.length > 0 && (
        <div style={styles.modalOverlay} onClick={() => setPreviewImages([])}>
          <div
            style={styles.previewWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImages[currentIndex]} style={styles.fullPreview} />

            {/* tombol kiri */}
            {currentIndex > 0 && (
              <button
                style={styles.navLeft}
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                ◀
              </button>
            )}

            {/* tombol kanan */}
            {currentIndex < previewImages.length - 1 && (
              <button
                style={styles.navRight}
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                ▶
              </button>
            )}

            {/* close */}
            <button
              style={styles.closePreviewBtn}
              onClick={() => setPreviewImages([])}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

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
    color: "var(--text-main)",
  },

  subtitle: {
    fontSize: "14px",
    marginTop: "6px",
    color: "var(--text-main)",
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
    gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr 1fr 1fr",
    padding: "16px 20px",
    color: "#94a3b8",
    fontSize: "13px",
  }),

  row: (isMobile: boolean) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr 1fr 1fr", // 🔥 HARUS SAMA DENGAN HEADER
    padding: "18px 20px",
    borderTop: "1px solid rgba(148,163,184,0.08)",
    alignItems: "center", // 🔥 biar tengah
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
  imageWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    marginBottom: "6px",
  },

  thumbnail: {
    width: "70px",
    height: "70px",
    objectFit: "cover" as const,
    borderRadius: "8px",
    cursor: "pointer",
  },

  morePhoto: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  previewWrapper: {
    position: "relative" as const,
  },

  fullPreview: {
    maxWidth: "90vw",
    maxHeight: "85vh",
    borderRadius: "12px",
  },

  closePreviewBtn: {
    position: "absolute" as const,
    top: "-10px",
    right: "-10px",
    backgroundColor: "red",
    border: "none",
    color: "white",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  photoCell: (isMobile: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: isMobile ? "flex-start" : "center",
    gap: "8px",
  }),
  navLeft: {
    position: "absolute" as const,
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0,0,0,0.6)",
    border: "none",
    color: "white",
    fontSize: "18px",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  navRight: {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0,0,0,0.6)",
    border: "none",
    color: "white",
    fontSize: "18px",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default ReportHistory;

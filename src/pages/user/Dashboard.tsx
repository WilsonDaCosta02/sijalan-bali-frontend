import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import folderIcon from "../../assets/folder.png";
import toolsIcon from "../../assets/tools.png";
import checkIcon from "../../assets/check.png";
import petaIcon from "../../assets/peta.png";
import MapView from "../../components/MapView";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { History } from "lucide-react";
import { API_URL } from "../../config/api";
import { authFetch } from "../../utils/authFetch";

type Report = {
  id: number;
  road_name: string;
  landmark: string;
  damage_level: string;
  status: string;
  latitude: string;
  longitude: string;
  image_url: string[];
  created_at: string;
};

const Dashboard = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [reports, setReports] = useState<Report[]>(() => {
    const userId = localStorage.getItem("userId");

    const saved = localStorage.getItem(`myReports_${userId}`);

    return saved ? JSON.parse(saved) : [];
  });
  const total = reports.length;
  const diproses = reports.filter((r) => r.status === "Diproses").length;
  const selesai = reports.filter((r) => r.status === "Selesai").length;
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setOpenSidebar(true); // 🔥 paksa sidebar muncul di desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await authFetch("/api/reports/my");

        const data = await response.json();

        if (!response.ok) {
          console.log(data.message);
          return;
        }

        setReports(data);

        const userId = localStorage.getItem("userId");

        localStorage.setItem(`myReports_${userId}`, JSON.stringify(data));
      } catch (err) {
        console.log(err);
      }
    };

    fetchReports();

    const interval = setInterval(() => {
      fetchReports();
    }, 1000);

    return () => clearInterval(interval);
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
                const token = localStorage.getItem("token");

                if (!token) {
                  setShowLoginWarning(true);
                } else {
                  navigate("/create-report");
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
            <div style={styles.mapHeader}>
              <img src={petaIcon} style={styles.petaIcon} />
              <p className="map-title">Peta Lokasi Laporan Anda</p>
            </div>

            <div style={styles.mapBox}>
              <MapView
                markers={reports.map((r) => ({
                  ...r,
                  lat: Number(r.latitude),
                  lng: Number(r.longitude),
                }))}
              />
            </div>
          </div>

          <div style={styles.table} className="table-dark-text">
            <div style={styles.tableHeader}>
              <History size={18} />
              <p style={{ margin: 0 }}>Riwayat Laporan Terakhir</p>
            </div>

            {/* HEADER */}
            <div style={styles.rowHeader(isMobile)}>
              <span>Tanggal</span>
              <span>Lokasi</span>
              <span style={{ textAlign: "center" }}>Foto</span>
              <span style={{ textAlign: "right" }}>Tingkat Kerusakan</span>
              <span style={{ textAlign: "right", paddingRight: "15px" }}>
                Status
              </span>
            </div>

            {reports.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Belum ada laporan 😢
              </div>
            ) : (
              [...reports]
                .sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                )
                .slice(-3)
                .map((item, i) => (
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
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </span>

                    <span style={{ wordBreak: "break-word" }}>
                      {isMobile && <b>Lokasi: </b>}
                      {item.road_name}
                      {item.landmark && ` (${item.landmark})`}
                    </span>

                    <span style={styles.photoCell(isMobile)}>
                      {isMobile && <b>Foto: </b>}

                      {item.image_url && item.image_url.length > 0 ? (
                        <div style={styles.imageWrapper}>
                          <img
                            src={`${API_URL}/${item.image_url[0]}`}
                            style={styles.thumbnail}
                            onClick={() => {
                              setPreviewImages(
                                item.image_url.map(
                                  (img) => `${API_URL}/${img}`,
                                ),
                              );

                              setCurrentIndex(0);
                            }}
                          />

                          {item.image_url.length > 1 && (
                            <small style={styles.morePhoto}>
                              +{item.image_url.length - 1}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#64748b" }}>-</span>
                      )}
                    </span>

                    <span style={{ textAlign: isMobile ? "left" : "right" }}>
                      {isMobile && <b>Kerusakan: </b>}
                      {item.damage_level}
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

            {currentIndex > 0 && (
              <button
                style={styles.navLeft}
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                ◀
              </button>
            )}

            {currentIndex < previewImages.length - 1 && (
              <button
                style={styles.navRight}
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                ▶
              </button>
            )}

            <button
              style={styles.closePreviewBtn}
              onClick={() => setPreviewImages([])}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {showLoginWarning && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: "8px" }}>Akses Dibatasi</h3>

            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Untuk membuat laporan, silakan masuk terlebih dahulu ke akun Anda.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                justifyContent: "center",
              }}
            >
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
  );
};

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
    marginTop: "-50px", // 🔥 naik ke atas
  },
  card: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: "16px",
    borderRadius: "12px",
    display: "flex", // 🔥 WAJIB
    justifyContent: "space-between", // 🔥 kiri - kanan
    alignItems: "center", // 🔥 tengah vertikal
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
    gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
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
    gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr 1fr 1fr",
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
  mapHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  mapTitle: {
    margin: 0,
  },
  petaIcon: {
    width: "27px",
    height: "27px",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
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

  photoCell: (isMobile: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: isMobile ? "flex-start" : "center",
    gap: "8px",
  }),

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

export default Dashboard;

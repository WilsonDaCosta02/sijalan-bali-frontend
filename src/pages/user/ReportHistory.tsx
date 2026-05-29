import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { API_URL } from "../../config/api";
import { authFetch } from "../../utils/authFetch";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";

type Report = {
  id: number;
  road_name: string;
  landmark: string;
  damage_level: string;
  description: string;
  status: string;
  latitude: string;
  longitude: string;
  image_url: string[];
  created_at: string;
};

const ReportHistory = () => {
  const navigate = useNavigate();

  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [reports, setReports] = useState<Report[]>(() => {
    const userId = localStorage.getItem("userId");

    const saved = localStorage.getItem(`myReports_${userId}`);

    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const filteredReports = reports
    .filter((r) => {
      const matchStatus =
        filterStatus === "Semua" ? true : r.status === filterStatus;

      const matchSearch = (r.road_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchStatus && matchSearch;
    })
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  useEffect(() => {
    const userMode = localStorage.getItem("userMode");

    // 🔥 kalau guest jangan fetch laporan
    if (userMode === "guest") {
      return;
    }

    const fetchMyReports = async () => {
      try {
        const response = await authFetch("/api/reports/my");

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");

            localStorage.removeItem("isLogin");

            localStorage.removeItem("user");

            localStorage.removeItem("username");

            localStorage.removeItem("userId");

            setShowSessionExpired(true);

            setTimeout(() => {
              navigate("/login", {
                replace: true,
              });
            }, 2000);

            return;
          }

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

    // 🔥 fetch pertama
    fetchMyReports();

    // 🔥 realtime polling
    const interval = setInterval(() => {
      fetchMyReports();
    }, 1000);

    // 🔥 cleanup
    return () => clearInterval(interval);
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

            {/* 🔥 tampilkan search/filter hanya kalau ada data */}
            {reports.length > 0 && (
              <div style={styles.controlWrapper}>
                {/* SEARCH */}
                <div style={styles.searchWrapper}>
                  <Search size={16} style={styles.searchIcon} />

                  <input
                    type="text"
                    placeholder="Cari nama jalan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                {/* FILTER */}
                <div style={styles.filterWrapper}>
                  <span style={styles.filterLabel}>Filter Status</span>

                  <select
                    style={styles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Semua">Semua Laporan</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            )}
            {/* TABLE HEADER */}
            <div style={styles.tableHeader(isMobile)}>
              <span>Tanggal</span>
              <span>Lokasi</span>
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
            {filteredReports.length === 0 ? (
              <div style={styles.empty}>
                {filterStatus === "Diproses"
                  ? "Belum ada laporan yang diproses 😢"
                  : filterStatus === "Selesai"
                    ? "Belum ada laporan yang selesai 😢"
                    : "Belum ada laporan 😢"}
              </div>
            ) : (
              filteredReports.map((item, i) => (
                <div
                  key={i}
                  style={styles.row(isMobile)}
                  onClick={() => setSelectedReport(item)}
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

                  <span style={styles.location}>
                    {isMobile && <b>Lokasi: </b>}
                    {item.road_name}
                    {item.landmark && ` (${item.landmark})`}
                  </span>

                  {/* 🔥 FOTO */}
                  <span style={styles.photoCell(isMobile)}>
                    {isMobile && <b>Foto: </b>}

                    {item.image_url && item.image_url.length > 0 ? (
                      <div style={styles.imageWrapper}>
                        <img
                          src={`${API_URL}/${item.image_url[0]}`}
                          style={styles.thumbnail}
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
        <div style={styles.previewOverlay} onClick={() => setPreviewImages([])}>
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
      {selectedReport && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedReport(null)}
        >
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <h2
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: isMobile ? "20px" : "24px",
                }}
              >
                Detail Laporan
              </h2>

              <button
                style={styles.closeDetailBtn}
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.detailContent}>
              <div style={styles.detailItem}>
                <b>Tanggal</b>
                <p>
                  {new Date(selectedReport.created_at).toLocaleString("id-ID")}
                </p>
              </div>

              <div style={styles.detailItem}>
                <b>Nama Jalan</b>
                <p>{selectedReport.road_name}</p>
              </div>

              <div style={styles.detailItem}>
                <b>Lokasi</b>
                <p>{selectedReport.landmark || "-"}</p>
              </div>

              <div style={styles.detailItem}>
                <b>Tingkat Kerusakan</b>
                <p>{selectedReport.damage_level}</p>
              </div>

              <div style={styles.detailItem}>
                <b>Status</b>

                <span
                  style={{
                    ...styles.badge,
                    width: "fit-content",
                    backgroundColor:
                      selectedReport.status === "Selesai"
                        ? "rgba(34,197,94,0.2)"
                        : selectedReport.status === "Diproses"
                          ? "rgba(234,179,8,0.2)"
                          : "rgba(59,130,246,0.2)",
                    color:
                      selectedReport.status === "Selesai"
                        ? "#22c55e"
                        : selectedReport.status === "Diproses"
                          ? "#facc15"
                          : "#3b82f6",
                  }}
                >
                  {selectedReport.status}
                </span>
              </div>

              <div style={styles.detailItem}>
                <b>Deskripsi Kerusakan</b>

                <p>{selectedReport.description || "-"}</p>
              </div>

              <div style={styles.detailItem}>
                <b>Koordinat</b>
                <p>
                  {selectedReport.latitude}, {selectedReport.longitude}
                </p>
              </div>
              <div style={styles.detailItem}>
                <b>Lokasi Maps</b>

                <div style={styles.detailMap}>
                  <MapView
                    markers={[
                      {
                        id: selectedReport.id,
                        road_name: selectedReport.road_name,
                        landmark: selectedReport.landmark,
                        damage_level: selectedReport.damage_level,
                        status: selectedReport.status,
                        latitude: selectedReport.latitude,
                        longitude: selectedReport.longitude,
                        image_url: selectedReport.image_url,
                        created_at: selectedReport.created_at,

                        // 🔥 penting
                        lat: Number(selectedReport.latitude),
                        lng: Number(selectedReport.longitude),
                      },
                    ]}
                  />
                </div>
              </div>
              <div style={styles.detailPhotos}>
                <b>Foto Laporan</b>

                <div style={styles.detailImageGrid}>
                  {selectedReport.image_url.map((img, index) => (
                    <div
                      key={index}
                      style={styles.detailImageWrapper}
                      onMouseEnter={(e) => {
                        const overlay = e.currentTarget.querySelector(
                          ".detail-overlay",
                        ) as HTMLDivElement;

                        if (overlay) overlay.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        const overlay = e.currentTarget.querySelector(
                          ".detail-overlay",
                        ) as HTMLDivElement;

                        if (overlay) overlay.style.opacity = "0";
                      }}
                      onClick={() => {
                        setPreviewImages(
                          selectedReport.image_url.map(
                            (img: string) => `${API_URL}/${img}`,
                          ),
                        );

                        setCurrentIndex(index);
                      }}
                    >
                      <img
                        src={`${API_URL}/${img}`}
                        style={styles.detailImage}
                      />

                      <div
                        className="detail-overlay"
                        style={styles.detailImageOverlay}
                      >
                        🔍
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSessionExpired && (
        <div style={styles.modalOverlay}>
          <div style={styles.sessionModal}>
            <div style={styles.sessionIcon}>⚠</div>

            <h3 style={styles.sessionTitle}>Sesi Login Berakhir</h3>

            <p style={styles.sessionText}>
              Silakan login kembali untuk melanjutkan akses akun Anda.
            </p>
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
    padding: "16px",
    boxSizing: "border-box" as const,
  },

  previewWrapper: {
    position: "relative" as const,
    zIndex: 10001,
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
  sessionModal: {
    width: "82%",
    maxWidth: "300px",

    background: "#1E293B",

    borderRadius: "22px",

    padding: "28px 24px",

    textAlign: "center" as const,

    border: "1px solid rgba(255,255,255,0.08)",

    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },

  sessionIcon: {
    width: "60px",
    height: "60px",

    borderRadius: "50%",

    background: "rgba(234,179,8,0.2)",

    color: "#facc15",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontSize: "30px",

    fontWeight: "bold",

    margin: "0 auto 16px",
  },

  sessionTitle: {
    color: "white",

    marginBottom: "8px",

    fontSize: "20px",
  },

  sessionText: {
    color: "#94a3b8",

    fontSize: "14px",

    lineHeight: "1.5",
  },
  detailModal: {
    width: window.innerWidth < 768 ? "calc(100vw - 32px)" : "88%",

    maxWidth: "540px",

    background: "#1E293B",

    borderRadius: "18px",

    padding: window.innerWidth < 768 ? "14px" : "22px",

    border: "1px solid rgba(255,255,255,0.08)",

    maxHeight: "82vh",

    overflowY: "auto" as const,

    boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: "16px",
  },

  closeDetailBtn: {
    background: "rgba(255,255,255,0.06)",

    border: "none",

    color: "white",

    width: "34px",

    height: "34px",

    borderRadius: "10px",

    fontSize: "16px",

    cursor: "pointer",
  },

  detailContent: {
    display: "flex",
    flexDirection: "column" as const,

    gap: "14px",

    color: "#e2e8f0",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column" as const,

    gap: "4px",

    paddingBottom: "12px",

    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },

  detailPhotos: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  detailImageGrid: {
    display: "grid",

    gridTemplateColumns:
      window.innerWidth < 768 ? "repeat(2,1fr)" : "repeat(3,1fr)",

    gap: "10px",
  },

  detailImage: {
    width: "100%",

    height: window.innerWidth < 768 ? "95px" : "120px",

    objectFit: "cover" as const,

    borderRadius: "12px",

    cursor: "pointer",

    transition: "0.2s",
  },
  previewOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.92)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  detailMap: {
    width: "100%",

    height: window.innerWidth < 768 ? "180px" : "250px",

    borderRadius: "14px",

    overflow: "hidden",

    marginTop: "6px",

    border: "1px solid rgba(255,255,255,0.08)",
  },
  detailImageWrapper: {
    position: "relative" as const,

    width: "100%",

    height: window.innerWidth < 768 ? "95px" : "120px",

    borderRadius: "12px",

    overflow: "hidden",

    cursor: "pointer",
  },

  detailImageOverlay: {
    position: "absolute" as const,

    top: 0,
    left: 0,

    width: "100%",
    height: "100%",

    backgroundColor: "rgba(0,0,0,0.45)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    opacity: 0,

    transition: "0.25s",

    fontSize: "24px",

    color: "white",
  },
  controlWrapper: {
    display: "flex",

    flexDirection:
      window.innerWidth < 768 ? ("column" as const) : ("row" as const),

    justifyContent: "space-between",

    alignItems:
      window.innerWidth < 768 ? ("stretch" as const) : ("center" as const),

    gap: "12px",

    padding: "18px 20px",

    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },

  searchWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    width: window.innerWidth < 768 ? "100%" : "auto",
    flex: 1,
  },

  searchIcon: {
    position: "absolute" as const,
    left: "12px",
    color: "#64748b",
    pointerEvents: "none" as const,
  },

  searchInput: {
    padding: "8px 14px 8px 38px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0F172A",
    color: "white",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    maxWidth: window.innerWidth < 768 ? "100%" : "400px",
    boxSizing: "border-box" as const,
  },

  filterWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems:
      window.innerWidth < 768 ? ("flex-start" as const) : ("flex-end" as const),
  },

  filterLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "4px",
  },

  filterSelect: {
    padding: "8px 12px",
    borderRadius: "10px",
    background: "#0F172A",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "13px",
  },
};

export default ReportHistory;

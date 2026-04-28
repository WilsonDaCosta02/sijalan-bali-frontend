import AdminNavbar from "../../components/AdminNavbar";
import Sidebar from "../../components/AdminSidebar";
import MapView from "../../components/MapView";
import { getReports, updateReportStatus } from "../../utils/reportStorage";
import type { Report } from "../../utils/reportStorage";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";

import petaIcon from "../../assets/peta.png";
import folderIcon from "../../assets/folder.png";
import toolsIcon from "../../assets/tools.png";
import checkIcon from "../../assets/check.png";
import unprocessedIcon from "../../assets/unprocessed.png";

const AdminDashboard = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [newStatus, setNewStatus] = useState<Report["status"]>("Terkirim");
  const [reports, setReports] = useState<Report[]>(getReports());

  const total = reports.length;
  const belum = reports.filter((r) => r.status === "Terkirim").length;
  const proses = reports.filter((r) => r.status === "Diproses").length;
  const selesai = reports.filter((r) => r.status === "Selesai").length;
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // 🔒 PROTECT ADMIN
  useEffect(() => {
    if (localStorage.getItem("userMode") !== "admin") {
      navigate("/admin-login");
    }
  }, []);

  // 🔥 REALTIME UPDATE (LISTEN PERUBAHAN DATA)
  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getReports();
      setReports([...fresh]); // 🔥 PAKSA RE-RENDER
    };

    window.addEventListener("reportUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate); // 🔥 TAMBAHAN PENTING

    return () => {
      window.removeEventListener("reportUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 📱 RESPONSIVE SIDEBAR
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setOpenSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div id="admin-root">
      <AdminNavbar setOpenSidebar={setOpenSidebar} />

      <div style={styles.container}>
        {/* SIDEBAR */}
        <Sidebar
          open={isMobile ? openSidebar : true}
          setOpen={setOpenSidebar}
        />

        {/* CONTENT */}
        <div style={styles.content}>
          <h1 style={styles.title}>Dashboard Administrator</h1>
          <p style={styles.subtitle}>
            Pusat monitoring dan manajemen data pelaporan kerusakan jalan.
          </p>

          <div style={styles.headerDivider} className="divider-dynamic"></div>
          {/* FILTER */}
          <div style={{ marginBottom: "20px" }}>
            <label>Filter Status: </label>
            <select style={styles.select}>
              <option>Semua Laporan</option>
              <option>Belum Diproses</option>
              <option>Diproses</option>
              <option>Selesai</option>
            </select>
          </div>

          {/* 🔥 STATS */}
          <div style={styles.stats}>
            {/* TOTAL */}
            <div style={styles.card}>
              <div>
                <p style={styles.cardTitle}>Total Laporan</p>
                <h2>{total}</h2>
              </div>
              <div style={styles.iconWrapper}>
                <img src={folderIcon} style={styles.icon} />
              </div>
            </div>

            {/* BELUM */}
            <div style={styles.card}>
              <div>
                <p style={{ ...styles.cardTitle, color: "#ef4444" }}>
                  Belum Diproses
                </p>
                <h2>{belum}</h2>
              </div>
              <div style={styles.iconWrapper}>
                <img src={unprocessedIcon} style={styles.icon} />
              </div>
            </div>

            {/* PROSES */}
            <div style={styles.card}>
              <div>
                <p style={{ ...styles.cardTitle, color: "#facc15" }}>
                  Sedang Diproses
                </p>
                <h2>{proses}</h2>
              </div>
              <div style={styles.iconWrapper}>
                <img src={toolsIcon} style={styles.icon} />
              </div>
            </div>

            {/* SELESAI */}
            <div style={styles.card}>
              <div>
                <p style={{ ...styles.cardTitle, color: "#22c55e" }}>
                  Selesai Ditangani
                </p>
                <h2>{selesai}</h2>
              </div>
              <div style={styles.iconWrapper}>
                <img src={checkIcon} style={styles.icon} />
              </div>
            </div>
          </div>

          {/* GRID */}
          <div style={styles.grid}>
            {/* MAP */}
            <div style={styles.mapBox}>
              <div style={styles.mapHeader}>
                <img src={petaIcon} style={styles.petaIcon} />
                <h3 style={{ margin: 0 }}>Pemetaan Geospasial Keseluruhan</h3>
              </div>
              <div style={styles.mapContent}>
                <MapView markers={reports} />
              </div>
            </div>
            {/* TABLE */}
            <div style={styles.tableBox}>
              <div style={styles.tableHeader}>
                <img src={petaIcon} style={styles.petaIcon} />
                <h3 style={{ margin: 0 }}>Tabel Data Laporan</h3>
              </div>

              <div style={styles.tableContent}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Info Lokasi</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((r, i) => {
                      const statusAdmin =
                        r.status === "Terkirim" ? "Belum Diproses" : r.status;

                      return (
                        <tr
                          key={i}
                          style={{
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={styles.td}>{i + 1}</td>
                          <td style={styles.td}>{r.roadName}</td>

                          <td style={styles.td}>
                            <span style={badgeStyle(statusAdmin)}>
                              {statusAdmin}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionGroup}>
                              <div
                                style={styles.viewBtn}
                                onClick={() => {
                                  setSelectedReport(r);
                                  setNewStatus(r.status); // 🔥 langsung sync di sini
                                  setOpenModal(true);
                                }}
                              >
                                <Eye size={16} />
                              </div>

                              <div style={styles.deleteBtnBox}>
                                <Trash2 size={16} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {openModal && selectedReport && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                {/* HEADER */}
                <div style={styles.modalHeader}>
                  <h3>Detail Laporan Kerusakan</h3>
                  <span
                    style={styles.closeBtn}
                    onClick={() => setOpenModal(false)}
                  >
                    ✕
                  </span>
                </div>

                {/* CONTENT */}
                <div style={styles.modalContent}>
                  {/* LEFT */}
                  <div style={{ flex: 1, maxWidth: "500px" }}>
                    {/* 🔥 LIST GAMBAR */}
                    <div style={styles.imagePreviewBox}>
                      {selectedReport.images?.length > 0 ? (
                        <div style={styles.imageWrapper}>
                          <div
                            style={styles.imageHoverBox}
                            onClick={() => {
                              setPreviewImages(selectedReport.images);
                              setCurrentIndex(0);
                            }}
                            onMouseEnter={(e) => {
                              const overlay = e.currentTarget.querySelector(
                                "[data-overlay]",
                              ) as HTMLElement;
                              if (overlay) overlay.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              const overlay = e.currentTarget.querySelector(
                                "[data-overlay]",
                              ) as HTMLElement;
                              if (overlay) overlay.style.opacity = "0";
                            }}
                          >
                            <img
                              src={selectedReport.images[0]}
                              style={styles.thumbnailLarge}
                            />

                            {/* OVERLAY */}
                            <div style={styles.overlay} data-overlay>
                              <span style={styles.zoomIcon}>🔍</span>
                            </div>
                          </div>

                          {selectedReport.images.length > 1 && (
                            <small style={styles.morePhoto}>
                              +{selectedReport.images.length - 1}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#64748b" }}>
                          Tidak ada gambar
                        </span>
                      )}
                    </div>

                    {previewImages.length > 0 && (
                      <div
                        style={styles.modalOverlay}
                        onClick={() => setPreviewImages([])}
                      >
                        <div
                          style={styles.previewWrapper}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={previewImages[currentIndex]}
                            style={styles.fullPreview}
                          />

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

                    {/* 🔥 INFO */}
                    <div style={styles.infoBox}>
                      <h4 style={styles.infoTitle}>Informasi Laporan</h4>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Nama:</span>
                        <span style={styles.value}>
                          {selectedReport.userName || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email:</span>
                        <span style={styles.value}>
                          {selectedReport.userEmail || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>No HP:</span>
                        <span style={styles.value}>
                          {selectedReport.userPhone || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Tanggal:</span>
                        <span style={styles.value}>
                          {selectedReport.date || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Tingkat Kerusakan:</span>
                        <span style={styles.value}>
                          {selectedReport.damage || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Status:</span>
                        <span
                          style={badgeStyle(
                            selectedReport.status === "Terkirim"
                              ? "Belum Diproses"
                              : selectedReport.status,
                          )}
                        >
                          {selectedReport.status === "Terkirim"
                            ? "Belum Diproses"
                            : selectedReport.status}
                        </span>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <span style={styles.label}>Keterangan:</span>
                        <div style={styles.descBox}>
                          {selectedReport.description || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  {/* RIGHT */}
                  <div style={styles.rightSection}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Titik Lokasi:</span>
                      <span style={styles.valueLocation}>
                        {selectedReport.roadName || "-"}
                      </span>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.label}>Patokan:</span>
                      <span style={styles.valueLocation}>
                        {selectedReport.landmark || "-"}
                      </span>
                    </div>

                    <div style={styles.modalMap}>
                      <MapView markers={[selectedReport]} />
                    </div>

                    <div style={styles.adminPanel}>
                      <h4>Panel Tindak Lanjut Admin</h4>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <select
                          style={{ ...styles.select, flex: 1 }}
                          value={newStatus}
                          onChange={(e) =>
                            setNewStatus(e.target.value as Report["status"])
                          }
                        >
                          <option value="Terkirim">Belum Diproses</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Selesai">Selesai</option>
                        </select>

                        <button
                          style={{ ...styles.saveBtn, flex: 1 }}
                          onClick={() => {
                            if (!selectedReport) return;

                            updateReportStatus(selectedReport.id, newStatus);

                            setSelectedReport({
                              ...selectedReport,
                              status: newStatus,
                            });
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(13, 148, 136, 1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(15, 118, 110, 1)")
                          }
                        >
                          Simpan Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const badgeStyle = (status: string) => ({
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  border: "1px solid currentColor",
  fontWeight: "500",
  background:
    status === "Selesai"
      ? "rgba(34,197,94,0.2)"
      : status === "Diproses"
        ? "rgba(234,179,8,0.2)"
        : "rgba(239,68,68,0.2)",
  color:
    status === "Selesai"
      ? "#22c55e"
      : status === "Diproses"
        ? "#facc15"
        : "#ef4444",
});

const styles = {
  container: {
    display: "flex",
    width: "100%",
    height: "100vh", // ✅ penting
    overflow: "hidden", // ✅ supaya scroll pindah ke content
    // 🔥 pindahin ke sini
  },

  content: {
    flex: 1,
    padding: "32px 28px 80px",
    backgroundColor: "var(--bg-admin)",
    color: "var(--text-admin)", // ✅ FIX
    overflowY: "auto" as const, // tetap boleh
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "20px",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#0F172A",
    color: "white",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  stats: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap" as const,
  },

  card: {
    flex: 1,
    minWidth: "180px",
    background: "var(--card-admin)",
    padding: "18px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    border: "1px solid rgba(255,255,255,0.05)", // 🔥 subtle border
    boxShadow: "0 6px 30px rgba(0,0,0,0.35)", // 🔥 depth
  },

  cardTitle: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },

  iconWrapper: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  icon: {
    width: "45px",
    height: "45px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },

  mapBox: {
    background: "var(--card-admin)",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden", // 🔥 double safety// 🔥 lebih kelihatan
  },

  tableBox: {
    background: "var(--card-admin)",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    height: "500px", // 🔥 samain dengan map
    display: "flex",
    flexDirection: "column" as const,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "16px",
    flex: 1,
  },
  petaIcon: {
    width: "25px",
    height: "25px",
  },
  mapHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  th: {
    position: "sticky" as const,
    top: 0,
    background: "var(--card-admin)",
    zIndex: 1,
    textAlign: "left" as const,
    padding: "12px 10px",
    color: "#94a3b8",
    fontSize: "13px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    whiteSpace: "nowrap", // 🔥 biar ga turun
    overflow: "hidden", // 🔥 sembunyiin sisanya
    textOverflow: "ellipsis", // 🔥 munculin "..."
    maxWidth: "180px", // 🔥 penting (biar kepotong)
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "12px",
    marginBottom: "-5px",
    borderBottom: "1px solid rgba(255,255,255,0.08)", // 🔥 INI KUNCI
  },
  actionGroup: {
    display: "flex",
    gap: "8px",
  },

  viewBtn: {
    background: "rgba(20,184,166,0.15)",
    padding: "6px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#14b8a6",
  },

  deleteBtnBox: {
    background: "rgba(239,68,68,0.15)",
    padding: "6px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#ef4444",
  },
  tableContent: {
    overflowY: "auto" as const,
    flex: 1 as const,
  },
  mapContent: {
    height: "420px",
    borderRadius: "12px",
    overflow: "hidden", // 🔥 INI KUNCI UTAMA
  },
  headerDivider: {
    height: "1px",
    marginBottom: "10px",
    marginTop: "10px",
    background: "#475569", // 🔥 naik ke atas
  },
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px", // 🔥 biar ada jarak dari pinggir layar
    zIndex: 9999,
  },
  modal: {
    width: "90%",
    maxWidth: "1000px",
    maxHeight: "90vh", // 🔥 BATAS TINGGI
    background: "#1E293B",
    borderRadius: "20px",
    display: "flex", // 🔥 penting
    flexDirection: "column" as const, // 🔥 penting
    overflow: "hidden", // 🔥 penting banget
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontWeight: "600",
    fontSize: "18px",
    flexShrink: 0, // 🔥 biar ga ikut ke-scroll
  },

  closeBtn: {
    cursor: "pointer",
    fontSize: "20px",
  },

  modalContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    padding: "24px",
    overflowY: "auto" as const, // 🔥 INI KUNCI
  },

  modalImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "14px",
    marginBottom: "16px",
  },

  infoBox: {
    background: "#0F172A",
    padding: "14px 18px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  descBox: {
    marginTop: "8px",
    padding: "14px 16px",
    background: "#0B1220", // 🔥 lebih soft dari sebelumnya
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)", // 🔥 lebih halus
    color: "#cbd5f5",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  modalMap: {
    height: "437px", // 🔥 BESARIN
    borderRadius: "14px",
    overflow: "hidden",
    marginTop: "8px",
  },

  adminPanel: {
    marginTop: "18px",
    background: "#24324A",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  saveBtn: {
    background: "rgba(15, 118, 110, 1)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease", // 🔥 ini penting
  },
  label: {
    fontSize: "16px",
    color: "#94a3b8",
    minWidth: "100px", // 🔥 tambah jarak
  },

  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "10px",
  },

  value: {
    textAlign: "right" as const,
    maxWidth: "60%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "14px",
  },
  rightSection: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
    gap: "16px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start", // 🔥 penting banget
    marginBottom: "14px",
  },

  valueInline: {
    color: "#e2e8f0",
    lineHeight: "1.5",
    flex: 1,
    wordBreak: "break-word",
    fontSize: "14px",
  },
  valueLocation: {
    flex: 1,
    textAlign: "left" as const,
    color: "#e2e8f0",
    lineHeight: "1.5",
    wordBreak: "break-word" as const,
  },
  imagePreviewBox: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center", // 🔥 center global
  },

  imageWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center", // 🔥 ini bikin ke tengah
    width: "100%",
  },
  thumbnailLarge: {
    width: "100%", // 🔥 full lebar container
    maxWidth: "420px", // 🔥 batas biar ga terlalu besar
    height: "260px", // 🔥 lebih tinggi
    objectFit: "cover" as const,
    borderRadius: "14px",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },

  morePhoto: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px",
  },

  previewWrapper: {
    position: "relative" as const,
  },

  fullPreview: {
    maxWidth: "90vw",
    maxHeight: "85vh",
    borderRadius: "12px",
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
  imageHoverBox: {
    position: "relative" as const,
    display: "flex",
    justifyContent: "center", // 🔥 center horizontal
    alignItems: "center",
    cursor: "pointer",
  },

  overlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    opacity: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12px",
    transition: "all 0.3s ease",
  },

  zoomIcon: {
    fontSize: "28px",
    color: "white",
  },
};

export default AdminDashboard;

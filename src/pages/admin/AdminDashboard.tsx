import AdminNavbar from "../../components/AdminNavbar";
import Sidebar from "../../components/AdminSidebar";
import MapView from "../../components/MapView";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { API_URL } from "../../config/api";
import petaIcon from "../../assets/peta.png";
import folderIcon from "../../assets/folder.png";
import toolsIcon from "../../assets/tools.png";
import checkIcon from "../../assets/check.png";
import unprocessedIcon from "../../assets/unprocessed.png";

type Report = {
  id: number;
  road_name: string;
  landmark: string;
  damage_level: string;
  description: string;

  latitude: string;
  longitude: string;

  image_url: string[];

  user_name: string;
  user_email: string;
  user_phone: string;

  status: "Terkirim" | "Diproses" | "Selesai";

  created_at: string;
};

const AdminDashboard = () => {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [newStatus, setNewStatus] = useState<Report["status"]>("Terkirim");
  const [reports, setReports] = useState<Report[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "delete";
  } | null>(null);

  const total = reports.length;
  const belum = reports.filter((r) => r.status === "Terkirim").length;
  const proses = reports.filter((r) => r.status === "Diproses").length;
  const selesai = reports.filter((r) => r.status === "Selesai").length;
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "delete") => {
    setToast({ message, type });

    // 🔥 clear timeout lama kalau ada
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  // 🔒 PROTECT ADMIN
  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // 🔥 REALTIME UPDATE (LISTEN PERUBAHAN DATA)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        if (!token) return;

        const response = await fetch(`${API_URL}/api/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.log(data.message);
          return;
        }

        setReports(data);
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

  const filteredReports = reports
    .filter((r) => {
      const statusAdmin = r.status === "Terkirim" ? "Belum Diproses" : r.status;

      if (filterStatus === "Semua") return true;

      return statusAdmin === filterStatus;
    })
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  const getEmptyMessage = () => {
    if (reports.length === 0) {
      return "Belum ada laporan 🚧";
    }

    if (filterStatus === "Belum Diproses") {
      return "Belum ada laporan yang belum diproses 🚧";
    }

    if (filterStatus === "Diproses") {
      return "Belum ada laporan yang diproses 🚧";
    }

    if (filterStatus === "Selesai") {
      return "Belum ada laporan yang terselesaikan 🚧";
    }

    return "Tidak ada data yang sesuai filter 🚧";
  };

  return (
    <div id="admin-root">
      <AdminNavbar setOpenSidebar={setOpenSidebar} />

      <div style={styles.container}>
        {/* SIDEBAR */}
        {!isMobile && <Sidebar open={true} setOpen={setOpenSidebar} />}

        {isMobile && openSidebar && (
          <Sidebar open={true} setOpen={setOpenSidebar} />
        )}

        {/* CONTENT */}
        <div
          style={{
            ...styles.content,
            padding: isMobile
              ? "16px 12px calc(125px + env(safe-area-inset-bottom))"
              : "32px 28px 80px",
          }}
        >
          <h1 style={styles.title}>Dashboard Administrator</h1>
          <p style={styles.subtitle}>
            Pusat monitoring dan manajemen data pelaporan kerusakan jalan.
          </p>

          <div style={styles.headerDivider} className="divider-dynamic"></div>

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
          <div
            style={{
              ...styles.grid,
              ...(isMobile && styles.gridMobile),
            }}
          >
            {/* MAP */}
            <div style={styles.cardWrapper}>
              <div style={styles.mapBox}>
                <div style={styles.mapHeader}>
                  <img src={petaIcon} style={styles.petaIcon} />
                  <h3 style={{ margin: 0, color: "#e2e8f0" }}>
                    Pemetaan Geospasial Keseluruhan
                  </h3>
                </div>
                <div style={styles.mapContent}>
                  <MapView
                    markers={reports
                      .filter(
                        (r) =>
                          !isNaN(Number(r.latitude)) &&
                          !isNaN(Number(r.longitude)),
                      )
                      .map((r) => ({
                        ...r,
                        lat: Number(r.latitude),
                        lng: Number(r.longitude),
                      }))}
                  />
                </div>
              </div>
            </div>
            {/* TABLE */}
            <div style={styles.cardWrapper}>
              <div style={styles.tableBox}>
                <div style={styles.tableHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img src={petaIcon} style={styles.petaIcon} />
                    <h3 style={{ margin: 0, color: "white" }}>
                      Tabel Data Laporan
                    </h3>
                  </div>

                  {/* 🔥 FILTER WRAPPER */}
                  {reports.length > 0 && (
                    <div style={styles.filterWrapper}>
                      <span style={styles.filterLabel}>Filter Status</span>

                      <select
                        style={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="Semua">Semua Laporan</option>
                        <option value="Belum Diproses">Belum Diproses</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  )}
                </div>

                <div style={styles.tableContent}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={{ ...styles.th, paddingLeft: "4px" }}>
                          Info Lokasi
                        </th>
                        <th style={{ ...styles.th, paddingLeft: "20px" }}>
                          Status
                        </th>
                        <th style={{ ...styles.th, paddingLeft: "20px" }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={styles.emptyTd}>
                            {getEmptyMessage()}
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((r, i) => {
                          const statusAdmin =
                            r.status === "Terkirim"
                              ? "Belum Diproses"
                              : r.status;

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
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <td style={styles.td}>{i + 1}</td>
                              <td style={{ ...styles.td, paddingLeft: "10px" }}>
                                {r.road_name}
                              </td>

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
                                      setNewStatus(r.status);
                                      setOpenModal(true);
                                    }}
                                  >
                                    <Eye size={16} />
                                  </div>

                                  <div
                                    style={styles.deleteBtnBox}
                                    onClick={() => setConfirmDeleteId(r.id)}
                                  >
                                    <Trash2 size={16} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                        {selectedReport.image_url?.length > 0 ? (
                          <div style={styles.imageWrapper}>
                            <div
                              style={styles.imageHoverBox}
                              onClick={() => {
                                setPreviewImages(
                                  selectedReport.image_url.map(
                                    (img) => `${API_URL}/${img}`,
                                  ),
                                );
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
                                src={`${API_URL}/${selectedReport.image_url[0]}`}
                                style={styles.thumbnailLarge}
                              />

                              {/* OVERLAY */}
                              <div style={styles.overlay} data-overlay>
                                <span style={styles.zoomIcon}>🔍</span>
                              </div>
                            </div>

                            {selectedReport.image_url.length > 1 && (
                              <small style={styles.morePhoto}>
                                +{selectedReport.image_url.length - 1}
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
                                onClick={() =>
                                  setCurrentIndex(currentIndex - 1)
                                }
                              >
                                ◀
                              </button>
                            )}

                            {currentIndex < previewImages.length - 1 && (
                              <button
                                style={styles.navRight}
                                onClick={() =>
                                  setCurrentIndex(currentIndex + 1)
                                }
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
                            {selectedReport.user_name || "-"}
                          </span>
                        </div>

                        <div style={styles.infoRow}>
                          <span style={styles.label}>Email:</span>
                          <span style={styles.value}>
                            {selectedReport.user_email || "-"}
                          </span>
                        </div>

                        <div style={styles.infoRow}>
                          <span style={styles.label}>No HP:</span>
                          <span style={styles.value}>
                            {selectedReport.user_phone || "-"}
                          </span>
                        </div>

                        <div style={styles.infoRow}>
                          <span style={styles.label}>Tanggal:</span>
                          <span style={styles.value}>
                            {new Date(
                              selectedReport.created_at,
                            ).toLocaleDateString("id-ID") || "-"}
                          </span>
                        </div>

                        <div style={styles.infoRow}>
                          <span style={styles.label}>Tingkat Kerusakan:</span>
                          <span style={styles.value}>
                            {selectedReport.damage_level || "-"}
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
                          {selectedReport.road_name || "-"}
                        </span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.label}>Lokasi:</span>
                        <span style={styles.valueLocation}>
                          {selectedReport.landmark || "-"}
                        </span>
                      </div>

                      <div style={styles.modalMap}>
                        <MapView
                          markers={[
                            {
                              ...selectedReport,
                              lat: Number(selectedReport.latitude),
                              lng: Number(selectedReport.longitude),
                            },
                          ]}
                        />
                      </div>

                      <div style={styles.adminPanel}>
                        <h4
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "15px",
                            color: "white",
                          }}
                        >
                          Panel Tindak Lanjut Admin
                        </h4>

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
                            onClick={async () => {
                              if (!selectedReport) return;

                              try {
                                const token =
                                  localStorage.getItem("admin_token");

                                const response = await fetch(
                                  `${API_URL}/api/reports/${selectedReport.id}/status`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      status: newStatus,
                                    }),
                                  },
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                  alert(data.message);
                                  return;
                                }

                                setReports((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedReport.id
                                      ? { ...item, status: newStatus }
                                      : item,
                                  ),
                                );

                                setSelectedReport({
                                  ...selectedReport,
                                  status: newStatus,
                                });

                                showToast(
                                  "Status berhasil diperbarui",
                                  "success",
                                );
                              } catch (err) {
                                console.log(err);
                                alert("Terjadi kesalahan server");
                              }
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
        {toast && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              left: "40%",
              padding: "14px 18px",
              borderRadius: "999px", // 🔥 pill style biar modern
              background:
                toast.type === "success"
                  ? "rgba(16,185,129,0.9)"
                  : "rgba(239,68,68,0.9)",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "slideIn 0.3s ease",
              zIndex: 99999,
            }}
          >
            <span style={{ fontSize: "16px" }}>
              {toast.type === "success" ? "✅" : "🗑️"}
            </span>
            {toast.message}
          </div>
        )}

        {confirmDeleteId !== null && (
          <div style={styles.modalOverlay}>
            <div style={styles.confirmBox}>
              <h3 style={{ marginBottom: "10px" }}>Hapus Laporan?</h3>

              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                Data yang sudah dihapus tidak bisa dikembalikan.
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {/* CANCEL */}
                <button
                  style={styles.cancelBtn}
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Batal
                </button>

                {/* DELETE */}
                <button
                  style={styles.deleteConfirmBtn}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("admin_token");

                      const response = await fetch(
                        `${API_URL}/api/reports/${confirmDeleteId}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        alert(data.message);
                        return;
                      }

                      setReports((prev) =>
                        prev.filter((item) => item.id !== confirmDeleteId),
                      );

                      showToast("Laporan berhasil dihapus", "delete");

                      if (selectedReport?.id === confirmDeleteId) {
                        setOpenModal(false);
                        setSelectedReport(null);
                      }

                      setConfirmDeleteId(null);
                    } catch (err) {
                      console.log(err);
                      alert("Terjadi kesalahan server");
                    }
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
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
    backgroundColor: "var(--bg-admin)",
    color: "var(--text-admin)", // ✅ FIX
    overflowY: "auto" as const, // tetap boleh
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "var(--text-admin)",
    margin: 0,
  },

  subtitle: {
    color: "var(--text-sub-admin)",
    marginTop: "6px",
    fontSize: "14px",
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
    background: "#1e293b",
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
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
    alignItems: "start",
    marginTop: "10px",
  },

  // 🔥 TAMBAHIN INI
  gridMobile: {
    gridTemplateColumns: "1fr",
  },
  mapBox: {
    background: "#1e293b",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)", // 🔥 jangan terlalu berat
  },

  tableBox: {
    background: "#1e293b",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column" as const,
    height: "460px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "16px",
    flex: 1,
    tableLayout: "fixed" as const, // 🔥 penting banget biar td ga melebarkan tabe  l
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
    background: "#1e293b",
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
    color: "#e2e8f0",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // 🔥 penting
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
    overflowX: "auto" as const,
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
    marginTop: "20px",
    background: "var(--divider-admin)", // 🔥 naik ke atas
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
    background: "var(--card-admin)", // 🔥 AUTO THEME
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    padding: "20px",
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
    width: "100%",
    height: "300px", // mobile friendly
    borderRadius: "14px",
    overflow: "hidden",
  },

  adminPanel: {
    marginTop: "6px", // 🔥 kasih jarak dikit dari atas
    background: "#24324A", // sekalian fix theme
    padding: "5px 10px", // 🔥 dipendekin
    borderRadius: "12px", // 🔥 sedikit lebih kecil
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
    color: "#727478",
    minWidth: "100px", // 🔥 tambah jarak
  },

  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "white",
  },

  value: {
    textAlign: "right" as const,
    maxWidth: "60%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "14px",
    wordBreak: "break-word" as const,
    color: "white",
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
    color: "var(--text-admin)", // 🔥 INI KUNCINYA
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
    width: "100%",
    maxWidth: "100%",
    height: "auto", // 🔥 penting
    maxHeight: "260px",
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

  confirmBox: {
    background: "#1E293B",
    padding: "24px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center" as const,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },

  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#cbd5f5",
    cursor: "pointer",
  },

  deleteConfirmBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
  emptyTd: {
    textAlign: "center" as const,
    padding: "50px 20px",
    color: "#94a3b8",
    fontSize: "15px",
    opacity: 0.8,
  },
  cardWrapper: {
    padding: "6px", // 🔥 kasih jarak luar
    borderRadius: "20px",
    background: "rgba(255,255,255,0.03)", // subtle layer
  },
  filterSelect: {
    padding: "1px 1px",
    borderRadius: "8px",
    background: "#0F172A",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "11px",
  },
  filterWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end", // 🔥 biar nempel kanan
  },

  filterLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "4px",
    marginRight: "15px",
  },
};

export default AdminDashboard;

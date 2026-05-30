import { Home, FilePlus, History, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const location = useLocation();
  const path = location.pathname;
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    const userMode = localStorage.getItem("userMode");

    // 🔥 kalau guest langsung keluar
    if (userMode === "guest") {
      localStorage.removeItem("userMode");

      navigate("/", {
        replace: true,
      });

      return;
    }

    // 🔥 kalau login baru tampil popup
    setShowLogoutConfirm(true);
  };
  return (
    <>
      {/* OVERLAY */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9998,
          }}
        />
      )}
      <div
        style={{
          ...styles.sidebar,
          display: "flex",
          position: isMobile ? "fixed" : "relative",
          transform: isMobile
            ? open
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
          left: 0,

          top: 0,
          height: isMobile ? "100vh" : "calc(100vh - 60px)",
          transition: "transform 0.3s ease",
          zIndex: 9999,
        }}
      >
        {/* TOP */}
        <div style={{ flex: 1 }}>
          <h3 style={styles.menuTitle}>Menu</h3>

          <div style={styles.menuWrapper}>
            <div style={styles.divider}></div>

            <div style={styles.menu}>
              <div
                style={{
                  ...styles.item,
                  backgroundColor:
                    path === "/dashboard" || hoverIndex === 0
                      ? "#334155"
                      : "transparent",

                  color:
                    path === "/dashboard" || hoverIndex === 0
                      ? "white"
                      : "#cbd5e1",

                  transform:
                    path === "/dashboard" || hoverIndex === 0
                      ? "translateX(4px)"
                      : "translateX(0)",
                }}
                onMouseEnter={() => setHoverIndex(0)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => navigate("/dashboard")}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </div>

              <div
                style={{
                  ...styles.item,
                  backgroundColor:
                    path === "/create-report" || hoverIndex === 1
                      ? "#334155"
                      : "transparent",

                  color:
                    path === "/create-report" || hoverIndex === 1
                      ? "white"
                      : "#cbd5e1",

                  transform:
                    path === "/create-report" || hoverIndex === 1
                      ? "translateX(4px)"
                      : "translateX(0)",
                }}
                onMouseEnter={() => setHoverIndex(1)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => {
                  const isLogin = localStorage.getItem("isLogin") === "true";

                  if (!isLogin) {
                    setShowLoginWarning(true);
                  } else {
                    navigate("/create-report");
                  }
                }}
              >
                <FilePlus size={18} />
                <span>Buat Laporan</span>
              </div>

              <div
                style={{
                  ...styles.item,
                  backgroundColor:
                    path === "/history" || hoverIndex === 2
                      ? "#334155"
                      : "transparent",

                  color:
                    path === "/history" || hoverIndex === 2
                      ? "white"
                      : "#cbd5e1",

                  transform:
                    path === "/history" || hoverIndex === 2
                      ? "translateX(4px)"
                      : "translateX(0)",
                }}
                onMouseEnter={() => setHoverIndex(2)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => navigate("/history")} // 🔥 INI WAJIB
              >
                <History size={18} />
                <span>Riwayat Laporan</span>
              </div>
            </div>

            <div style={styles.dividerBottom}></div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={styles.logoutWrapper}>
          <div
            style={{
              ...styles.logout,
              backgroundColor:
                hoverIndex === 99 ? "rgba(239,68,68,0.1)" : "transparent",
            }}
            onMouseEnter={() => setHoverIndex(99)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </div>
        </div>
      </div>
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.logoutModal}>
            <h3 style={styles.modalTitle}>Keluar dari Akun?</h3>

            <p style={styles.modalText}>Anda yakin ingin keluar dari akun?</p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>

              <button
                style={styles.logoutBtn}
                onClick={() => {
                  const userId = localStorage.getItem("userId");

                  if (userId) {
                    localStorage.removeItem(`myReports_${userId}`);
                  }
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  localStorage.removeItem("isLogin");
                  localStorage.removeItem("user");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("userMode");

                  navigate("/login", {
                    replace: true,
                  });
                }}
              >
                Ya, Keluar
              </button>
            </div>
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
  sidebar: {
    width: "260px",
    minWidth: "260px",
    backgroundColor: "#1E293B",
    color: "white",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start", // 🔥 GANTI INI
    boxSizing: "border-box" as const,
    height: "calc(100vh - 60px)",
  },

  menuTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#e2e8f0",
    transform: "translateY(-10px)",
  },

  divider: {
    height: "1px",
    backgroundColor: "#475569",
    opacity: 0.5,
    marginTop: "20px",
    marginBottom: "20px",
  },

  dividerBottom: {
    height: "1px",
    backgroundColor: "#475569",
    opacity: 0.5,
    marginTop: "20px",
  },

  menu: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
    alignItems: "flex-start", // 🔥 INI KUNCINYA
  },

  menuWrapper: {
    marginTop: "20px", // 🔥 ini yang dorong semua ke bawah
  },

  item: {
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    gap: "12px",
    alignItems: "center",
    color: "#cbd5e1",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },

  logout: {
    color: "#ef4444",
    cursor: "pointer",
    display: "inline-flex",
    gap: "10px",
    alignItems: "center",
    fontWeight: "500",
    width: "fit-content", // 🔥 WAJIB
    borderRadius: "10px",
    transition: "all 0.2s ease",
    padding: "5px 5px",
  },

  logoutWrapper: {
    marginTop: "auto", // 🔥 dorong ke bawah TANPA bikin area gede
    marginBottom: window.innerWidth < 768 ? "50px" : "0px",
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
  logoutModal: {
    width: "82%",
    maxWidth: "290px",
    background: "#1E293B",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    textAlign: "center" as const,
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
    color: "white",
    marginBottom: "10px",
  },

  modalText: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "22px",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
  },

  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer",
  },

  logoutBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Sidebar;

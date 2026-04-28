import { LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const AdminSidebar = ({ open, setOpen }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hover, setHover] = useState(false);

  // 🔥 RESPONSIVE DETECT
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 🔥 OVERLAY (SAMA KAYAK USER) */}
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
          position: isMobile ? "fixed" : "relative",
          transform: isMobile
            ? open
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
          top: 0,
          left: 0,
          height: isMobile ? "100vh" : "calc(100vh - 60px)",
          transition: "transform 0.3s ease",
          zIndex: 9999,
        }}
      >
        <h3 style={styles.menuTitle}>Menu</h3>

        <div style={styles.divider}></div>

        {/* DASHBOARD */}
        <div
          style={{
            ...styles.menuItem,
            backgroundColor:
              path === "/admin-dashboard" || hover ? "#334155" : "transparent",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => navigate("/admin-dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </div>

        <div style={styles.divider}></div>

        {/* LOGOUT */}
        <div
          style={styles.logout}
          onClick={() => {
            navigate("/admin-login");
          }}
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </div>
      </div>
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
    justifyContent: "flex-start" as const,
    boxSizing: "border-box" as const,
    height: "calc(100vh - 60px)",

    position: "relative", // 🔥 TAMBAH INI
  },

  menuTitle: {
    marginBottom: "20px",
    fontSize: "16px",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.2s",
  },

  divider: {
    height: "1px",
    background: "#475569",
    margin: "20px 0",
  },

  logout: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ef4444",
    cursor: "pointer",

    position: "absolute" as const, // 🔥 TAMBAH
    bottom: "80px", // 🔥 JARAK DARI BAWAH
    left: "20px", // 🔥 SESUAI PADDING SIDEBAR
  },
};

export default AdminSidebar;

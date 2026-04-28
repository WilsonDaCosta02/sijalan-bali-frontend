import { Sun, Moon, Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  setOpenSidebar: (value: boolean) => void;
};

const AdminNavbar = ({ setOpenSidebar }: Props) => {
  const location = useLocation();
  const path = location.pathname;

  const isDashboard = path.includes("admin-dashboard"); // 🔥 kunci

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme_admin");
    return saved ? saved === "dark" : true;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoverUser, setHoverUser] = useState(false);

  const adminName = localStorage.getItem("admin_username") || "Administrator";

  // 📱 RESPONSIVE
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🌗 THEME
  useEffect(() => {
    const root = document.getElementById("admin-root");
    if (!root) return;

    if (darkMode) {
      root.classList.add("dark-admin");
      localStorage.setItem("theme_admin", "dark");
    } else {
      root.classList.remove("dark-admin");
      localStorage.setItem("theme_admin", "light");
    }
  }, [darkMode]);

  return (
    <div style={styles.navbar}>
      {/* LEFT */}
      <div style={styles.left}>
        {/* 🔥 HAMBURGER (HANYA DI DASHBOARD) */}
        {isMobile && isDashboard && (
          <div
            onClick={() => setOpenSidebar(true)}
            style={{ cursor: "pointer", marginRight: "8px" }}
          >
            <Menu size={22} />
          </div>
        )}

        <img src="/favicon.png" style={styles.logo} />
        <h2 style={styles.title}>SIJALAN Bali</h2>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        {/* 🌗 DARK MODE */}
        <div onClick={() => setDarkMode(!darkMode)} style={styles.iconWrapper}>
          {darkMode ? (
            <Sun color="rgba(15,118,110,1)" />
          ) : (
            <Moon color="rgba(15,118,110,1)" />
          )}
        </div>

        {/* 🔥 DIVIDER (HANYA DI DASHBOARD) */}
        {isDashboard && <div style={styles.divider}></div>}

        {/* 🔥 USER ADMIN (HANYA DI DASHBOARD) */}
        {isDashboard && (
          <div
            style={{
              ...styles.user,
              backgroundColor: hoverUser
                ? "rgba(148,163,184,0.25)"
                : "transparent",
            }}
            onMouseEnter={() => setHoverUser(true)}
            onMouseLeave={() => setHoverUser(false)}
          >
            <User size={18} />
            <span>{adminName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "60px",
    padding: "0 8px", // 🔥 dari 24 → 16 (biar ga mepet di HP)
    borderBottom: "1px solid var(--divider-main)",
    backgroundColor: "var(--navbar-admin)",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // 🔥 lebih rapat
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // 🔥 dari 20 → 14 (lebih balance)
    marginRight: "-5px", // 🔥 biar ga mepet di HP
  },

  iconWrapper: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  divider: {
    width: "1px",
    height: "20px", // 🔥 sedikit lebih kecil biar proporsional
    backgroundColor: "#94a3b8",
    opacity: 0.5,
  },

  logo: {
    width: "40px", // 🔥 sedikit kecil biar balance
  },

  title: {
    color: "rgba(15, 118, 110, 1)",
    margin: 0,
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // 🔥 dari 10 → 8
    padding: "6px 10px", // 🔥 biar ga terlalu lebar di HP
    borderRadius: "8px",
    cursor: "default",
    transition: "0.2s",
  },
};

export default AdminNavbar;

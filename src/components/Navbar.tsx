import { Sun, Moon, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { API_URL } from "../config/api";

type NavbarProps = {
  setOpenSidebar: (value: boolean) => void;
};

const Navbar = ({ setOpenSidebar }: NavbarProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // 🔥 default dark
  });
  const isLogin = localStorage.getItem("isLogin") === "true";
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isAuthPage = path === "/" || path === "/login" || path === "/register";
  const [username, setUsername] = useState("User");
  const [hoverUser, setHoverUser] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUsername(data.name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark"); // 🔥 simpan
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light"); // 🔥 simpan
    }
  }, [darkMode]);

  return (
    <div className="navbar" style={styles.navbar}>
      <div style={styles.left}>
        {/* 🔥 HAMBURGER (MOBILE ONLY) */}
        <div
          onClick={() => setOpenSidebar(true)}
          style={{
            display: isMobile && !isAuthPage ? "block" : "none",
            cursor: "pointer",
          }}
        >
          <Menu size={22} />
        </div>
        <img src="/favicon.png" alt="logo" style={styles.logo} />
        <h2 style={styles.title}>SIJALAN Bali</h2>
      </div>

      <div style={styles.right}>
        {/* 🌗 DARK MODE */}
        <div onClick={() => setDarkMode(!darkMode)} style={styles.iconWrapper}>
          {darkMode ? (
            <Sun color="rgba(15,118,110,1)" />
          ) : (
            <Moon color="rgba(15,118,110,1)" />
          )}
        </div>

        {/* 🔥 DIVIDER */}
        {!isAuthPage && <div style={styles.divider}></div>}

        {/* USER / LOGIN */}
        {!isAuthPage &&
          (isLogin ? (
            <div
              style={{
                ...styles.user,
                backgroundColor: hoverUser
                  ? "rgba(148,163,184,0.25)"
                  : "transparent",
                transform: hoverUser ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={() => setHoverUser(true)}
              onMouseLeave={() => setHoverUser(false)}
              onClick={() => navigate("/profile")}
            >
              <User size={18} />
              <span>{username}</span>
            </div>
          ) : (
            <button
              className="auth-btn-primary navbar-btn"
              onClick={() => navigate("/login")}
            >
              <User size={16} />
              Masuk
            </button>
          ))}
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
    padding: "0 24px",
    borderBottom: "1px solid var(--divider-main)",
    flexWrap: "wrap" as const, // 🔥 ini garisnya
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "-15px",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginRight: "-15px",
  },

  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#94a3b8",
    opacity: 0.5,
  },

  logo: {
    width: "40px",
  },

  title: {
    color: "rgba(15, 118, 110, 1)",
    margin: 0,
  },

  /* 🔥 USER LOGIN */
  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // 🔥 pakai ini (lebih lega)
    padding: "6px 10px", // 🔥 area hover
    borderRadius: "8px", // 🔥 biar halus
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  avatar: {
    width: "32px", // 🔥 sedikit lebih besar biar mirip Figma
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
  },
  hamburger: {
    cursor: "pointer",
  },
};

export default Navbar;

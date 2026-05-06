import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import userIcon from "../../assets/user-auth-icon.png";
import { Mail, Lock } from "lucide-react";
import { API_URL } from "../../config/api";

const Profile = () => {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [hoverSave, setHoverSave] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const s = styles(isMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
          setName(data.name);
          setEmail(data.email);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar setOpenSidebar={setOpenSidebar} />

      <div style={s.container}>
        <Sidebar
          open={isMobile ? openSidebar : true}
          setOpen={setOpenSidebar}
        />

        <div style={s.content}>
          {/* HEADER */}
          <div style={s.header}>
            <h1 style={s.title}>Profil Anda</h1>
            <p style={s.subtitle} className="subtitle-green">
              Atur profil Anda di sini
            </p>
          </div>

          <div style={s.headerDivider} className="divider-dynamic"></div>

          {/* WRAPPER */}
          <div style={s.cardWrapper}>
            {/* CARD */}
            <div style={s.card}>
              {/* LEFT */}
              <div style={s.left}>
                <div style={s.avatarWrapper}>
                  <img src={userIcon} style={s.avatarImg} />
                </div>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={s.input}
                />

                <button className="btn-primary" style={{ width: "100%" }}>
                  Ubah Nama
                </button>
              </div>

              {/* RIGHT */}
              <div style={s.right}>
                <label style={s.label}>Email</label>
                <div style={s.inputGroup}>
                  <Mail size={16} color="#ffffff" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={s.inputField}
                  />
                </div>

                <label style={s.label}>Password</label>
                <div style={s.inputGroup}>
                  <Lock size={16} color="#ffffff" />
                  <input value="********" readOnly style={s.inputField} />
                </div>

                <button className="btn-primary full">Ubah Email</button>
                <button className="btn-primary full">Ubah Password</button>

                <button
                  style={{
                    ...s.saveBtn,
                    backgroundColor: hoverSave ? "#4b5563" : "#6b7280",
                    transform: hoverSave ? "translateY(-1px)" : "translateY(0)",
                  }}
                  onMouseEnter={() => setHoverSave(true)}
                  onMouseLeave={() => setHoverSave(false)}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = (isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    display: "flex",
    height: "calc(100vh - 60px)",
  },

  content: {
    flex: 1,
    padding: "28px 24px",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-main)",
    overflowY: "auto",
    paddingBottom: "80px",
  },

  card: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "20px" : "40px",
    backgroundColor: "#1E293B",
    padding: isMobile ? "20px" : "32px",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "750px",
  },

  left: {
    flex: "1 1 200px",
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "center",
    width: "100%",
  },

  right: {
    flex: "2 1 300px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  label: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "-6px",
  },

  avatarWrapper: {
    width: "100px",
    height: "100px",
    borderRadius: "16px",
    backgroundColor: "#134e4a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },

  avatarImg: {
    width: "60px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "#020617",
    color: "white",
    width: "100%",
    textAlign: isMobile ? "center" : "left",
  },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#020617",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    padding: "10px",
  },

  inputField: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "white",
  },

  saveBtn: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
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
    color: "var(--text-main)",
    marginTop: "6px",
  },

  headerDivider: {
    height: "1px",
    marginBottom: "30px",
    marginTop: "-10px",
  },

  cardWrapper: {
    display: "flex",
    justifyContent: "center",
    padding: isMobile ? "0px" : "0px 20px",
  },
});

export default Profile;

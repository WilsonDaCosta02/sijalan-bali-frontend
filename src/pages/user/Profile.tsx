import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import userIcon from "../../assets/user-auth-icon.png";
import { Mail, Lock } from "lucide-react";
import { authFetch } from "../../utils/authFetch";

const Profile = () => {
  const [name, setName] = useState(localStorage.getItem("username") || "");

  const [email, setEmail] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return user.email || "";
  });
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [hoverSave, setHoverSave] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const s = styles(isMobile);
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

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
        const response = await authFetch("/api/auth/me");

        const data = await response.json();

        if (response.ok) {
          setName(data.name);
          setEmail(data.email);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      // 🔥 jika isi password lama tapi password baru kosong
      if (currentPassword && !password) {
        showToast("Masukkan password baru", "error");

        return;
      }

      // 🔥 jika isi password baru tapi password lama kosong
      if (password && !currentPassword) {
        showToast("Masukkan password lama terlebih dahulu", "error");

        return;
      }

      // 🔥 password lama tidak boleh sama dengan password baru
      if (currentPassword && password && currentPassword === password) {
        showToast(
          "Password baru tidak boleh sama dengan password lama",
          "error",
        );

        return;
      }
      if (password) {
        if (password.length < 8) {
          showToast("Password minimal 8 karakter", "error");

          return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).+$/;

        if (!passwordRegex.test(password)) {
          showToast("Password harus mengandung huruf besar dan angka", "error");

          return;
        }
      }

      const response = await authFetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Gagal update profil", "error");
        return;
      }

      // 🔥 update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      user.name = name;
      user.email = email;

      localStorage.setItem("user", JSON.stringify(user));

      localStorage.setItem("username", name);

      window.dispatchEvent(new Event("profileUpdated"));

      showToast("Profil berhasil diperbarui", "success");

      setPassword("");
      setCurrentPassword("");
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan server", "error");
    }
  };

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
                <label style={s.label}>Nama</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={s.input}
                />
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
                <label style={s.label}>Password Saat Ini</label>

                <div style={s.inputGroup}>
                  <Lock size={16} color="#ffffff" />

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    style={s.inputField}
                  />
                </div>
                <label style={s.label}>Password Baru</label>
                <div style={s.inputGroup}>
                  <Lock size={16} color="#ffffff" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    style={s.inputField}
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
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
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 20px",
            borderRadius: "999px",
            background:
              toast.type === "success"
                ? "rgba(20,184,166,0.95)"
                : "rgba(239,68,68,0.95)",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            zIndex: 99999,
          }}
        >
          <span style={{ fontSize: "16px" }}>
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>

          {toast.message}
        </div>
      )}
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
    gap: isMobile ? "0px" : "40px",
    backgroundColor: "#1E293B",
    padding: isMobile ? "30px" : "32px",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "750px",
    height: "fit-content",
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
    flex: isMobile ? "unset" : "2 1 300px",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "10px" : "14px",
    marginTop: isMobile ? "-18px" : "0px",
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

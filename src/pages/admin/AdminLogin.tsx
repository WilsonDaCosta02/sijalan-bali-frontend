import AdminNavbar from "../../components/AdminNavbar";
import Background from "../../components/Background";
import "../../styles/auth.css";
import userIcon from "../../assets/user-auth-icon.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { API_URL } from "../../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const [showSuccess, setShowSuccess] =
  useState(false);

const [errorMessage, setErrorMessage] =
  useState("");

  return (
    <div id="admin-root">
      {" "}
      {/* 🔥 WAJIB ADA BIAR DARK MODE JALAN */}
      <AdminNavbar setOpenSidebar={() => {}} />
      <Background>
        <div className="auth-card">
          {/* ICON */}
          <div className="auth-header">
            <div className="auth-icon">
              <img src={userIcon} alt="admin" />
            </div>

            <h2>Login Admin</h2>
            <p>Akses khusus administrator</p>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@sijalan.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Password</label>

            <div className="input-password">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            className="auth-btn-primary"
           onClick={async () => {
  try {
    if (!email || !password) {
      setErrorMessage(
        "Email dan password wajib diisi",
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 2500);

      return;
    }

    setLoading(true);

    const response = await fetch(
      `${API_URL}/api/auth/admin-login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(
        data.message ||
          "Login admin gagal",
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 2500);

      return;
    }

    // 🔥 simpan auth
    localStorage.setItem(
      "admin_token",
      data.token,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user),
    );

    localStorage.setItem(
      "admin_username",
      data.user.name,
    );

    localStorage.setItem(
      "userMode",
      "admin",
    );

    setShowSuccess(true);

    setTimeout(() => {
      navigate("/admin-dashboard");
    }, 1500);
  } catch (err) {
    console.log(err);

    setErrorMessage(
      "Terjadi kesalahan server",
    );

    setTimeout(() => {
      setErrorMessage("");
    }, 2500);
  } finally {
    setLoading(false);
  }
}}
          >
            {loading
  ? "Loading..."
  : "Masuk sebagai Admin"}
          </button>
        </div>
        {errorMessage && (
  <div style={styles.errorToast}>
    <span style={styles.errorIcon}>
      !
    </span>

    {errorMessage}
  </div>
)}

{showSuccess && (
  <div style={styles.modalOverlay}>
    <div style={styles.successModal}>
      <div style={styles.successIcon}>
        ✓
      </div>

      <h3 style={styles.successTitle}>
        Berhasil Masuk
      </h3>

      <p style={styles.successText}>
        Selamat datang Admin SIJALAN
      </p>
    </div>
  </div>
)}
      </Background>
    </div>
  );
};
const styles = {
modalOverlay: {
  position: "fixed" as const,
  inset: 0,

  background:
    "rgba(0,0,0,0.5)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  zIndex: 99999,
},

successModal: {
  width: "82%",
  maxWidth: "280px",

  background: "#1E293B",

  borderRadius: "22px",

  padding: "28px 24px",

  textAlign: "center" as const,

  border:
    "1px solid rgba(255,255,255,0.08)",

  boxShadow:
    "0 10px 40px rgba(0,0,0,0.4)",
},

successIcon: {
  width: "60px",
  height: "60px",

  borderRadius: "50%",

  background:
    "rgba(34,197,94,0.2)",

  color: "#4ade80",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  fontSize: "30px",

  fontWeight: "bold",

  margin: "0 auto 16px",
},

successTitle: {
  color: "white",

  marginBottom: "8px",

  fontSize: "20px",
},

successText: {
  color: "#94a3b8",

  fontSize: "14px",

  lineHeight: "1.5",
},

errorToast: {
  position: "fixed" as const,

  top: "90px",

  left: "50%",

  transform:
    "translateX(-50%)",

  background: "#7f1d1d",

  color: "white",

  padding: "12px 18px",

  borderRadius: "14px",

  display: "flex",

  alignItems: "center",

  gap: "10px",

  fontSize: "14px",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.3)",

  zIndex: 999999,

  border:
    "1px solid rgba(255,255,255,0.08)",
},

errorIcon: {
  width: "22px",

  height: "22px",

  borderRadius: "50%",

  background:
    "rgba(255,255,255,0.15)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  fontWeight: "bold",
},
}
export default AdminLogin;

import Navbar from "../../components/Navbar";
import "../../styles/auth.css";
import userIcon from "../../assets/user-auth-icon.png";
import Background from "../../components/Background";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { API_URL } from "../../config/api";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <>
      <Navbar setOpenSidebar={() => {}} />

      <Background>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <img src={userIcon} alt="user" />
            </div>

            <h2>Selamat Datang</h2>
            <p>Silakan masuk ke akun Anda</p>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="user@example.com"
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

          <button
            className="auth-btn-primary"
            onClick={async () => {
              try {
                if (!email || !password) {
                  alert("Email dan password wajib diisi");
                  return;
                }

                setLoading(true);

                const response = await fetch(`${API_URL}/api/auth/login`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },

                  body: JSON.stringify({
                    email,
                    password,
                  }),
                });

                const data = await response.json();

                if (!response.ok) {
                  alert(data.message || "Login gagal");
                  return;
                }

                // 🔥 SIMPAN AUTH
                localStorage.setItem("token", data.token);

                localStorage.setItem("user", JSON.stringify(data.user));

                localStorage.setItem("userId", data.user.id);

                localStorage.setItem("username", data.user.name);

                localStorage.setItem("isLogin", "true");

                localStorage.setItem("userMode", "user");

                setShowSuccess(true);

                setTimeout(() => {
                  navigate("/dashboard", {
                    replace: true,
                  });
                }, 1500);
              } catch (err) {
                console.error(err);
                alert("Terjadi kesalahan server");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Loading..." : "Masuk"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#fafcff",
              margin: "10px 0",
            }}
          >
            Belum punya akun?{" "}
            <span
              onClick={() =>
                navigate("/register", {
                  replace: true,
                })
              }
              style={{
                display: "inline-block",

                marginLeft: "4px",

                padding: "4px 10px",

                borderRadius: "999px",

                background: "rgba(59,130,246,0.35)",

                color: "#91b9e7",

                fontWeight: "600",

                cursor: "pointer",

                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(34, 95, 194, 0.25)";

                e.currentTarget.style.transform = "translateY(-1px)";

                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(27, 101, 220, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.5)";

                e.currentTarget.style.transform = "translateY(0)";

                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Daftar di sini
            </span>
          </p>
        </div>
        {showSuccess && (
          <div style={styles.modalOverlay}>
            <div style={styles.successModal}>
              <div style={styles.successIcon}>✓</div>

              <h3 style={styles.successTitle}>Berhasil Masuk</h3>

              <p style={styles.successText}>Selamat datang di SIJALAN</p>
            </div>
          </div>
        )}
      </Background>
    </>
  );
};
const styles = {
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.5)",

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

    border: "1px solid rgba(255,255,255,0.08)",

    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },

  successIcon: {
    width: "60px",
    height: "60px",

    borderRadius: "50%",

    background: "rgba(34,197,94,0.2)",

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
};
export default Login;

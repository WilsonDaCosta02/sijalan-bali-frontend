import Navbar from "../../components/Navbar";
import Background from "../../components/Background";
import "../../styles/auth.css";
import userIcon from "../../assets/user-auth-icon.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { API_URL } from "../../config/api";

const Register = () => {
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    try {
      if (!name || !email || !phone || !password || !confirmPassword) {
        setErrorMessage("Semua field wajib diisi");

        setTimeout(() => {
          setErrorMessage("");
        }, 2500);

        return;
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Konfirmasi password tidak sama");

        setTimeout(() => {
          setErrorMessage("");
        }, 2500);

        return;
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Register gagal");

        setTimeout(() => {
          setErrorMessage("");
        }, 2500);

        return;
        return;
      }

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan server");

      setTimeout(() => {
        setErrorMessage("");
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar setOpenSidebar={() => {}} />

      <Background>
        {errorMessage && (
          <div style={styles.errorToast}>
            <span style={styles.errorIcon}>!</span>

            {errorMessage}
          </div>
        )}
        {/* 🔥 POPUP SUCCESS */}
        {showSuccess && (
          <div style={styles.overlay} onClick={() => setShowSuccess(false)}>
            <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
              <h3>Berhasil 🎉</h3>
              <p>Akun berhasil dibuat</p>

              <button
                style={styles.popupBtn}
                onClick={() => navigate("/login", { replace: true })}
              >
                Login Sekarang
              </button>
            </div>
          </div>
        )}

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <img src={userIcon} alt="user" />
            </div>

            <h2>Daftar Akun</h2>
            <p>Silakan buat akun baru</p>
          </div>

          <div className="form-group">
            <label>Nama</label>
            <input
              type="text"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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

          <div className="form-group">
            <label>No HP</label>
            <input
              type="text"
              placeholder="08xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
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

            <p
              style={{
                fontSize: "9px",
                color: "#fafcff",
                marginTop: "0px",
                marginBottom: "10px",
              }}
            >
              Password minimal 8 karakter, mengandung huruf besar dan angka
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label>Konfirmasi Password</label>

            <div className="input-password">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button className="auth-btn-primary" onClick={handleRegister}>
            {loading ? "Loading..." : "Daftar"}
          </button>

          <button
            className="auth-btn-secondary"
            onClick={() => navigate("/login", { replace: true })}
          >
            Kembali ke Login
          </button>
        </div>
      </Background>
    </>
  );
};

/* 🔥 STYLE POPUP */
const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  popup: {
    backgroundColor: "#1E293B",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center" as const,
    color: "white",
    width: "280px",
    animation: "fadeIn 0.3s ease",
  },

  popupBtn: {
    marginTop: "12px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "rgba(15,118,110,1)",
    color: "white",
    cursor: "pointer",
  },
  errorToast: {
    position: "fixed" as const,

    top: "90px",
    left: "50%",

    transform: "translateX(-50%)",

    background: "#7f1d1d",

    color: "white",

    padding: "12px 18px",

    borderRadius: "14px",

    display: "flex",
    alignItems: "center",
    gap: "10px",

    fontSize: "14px",

    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",

    zIndex: 999999,

    border: "1px solid rgba(255,255,255,0.08)",
  },

  errorIcon: {
    width: "22px",
    height: "22px",

    borderRadius: "50%",

    background: "rgba(255,255,255,0.15)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    fontWeight: "bold",
  },
};

export default Register;

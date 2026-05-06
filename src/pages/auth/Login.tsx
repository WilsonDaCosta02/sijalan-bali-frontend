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

                const response = await fetch(`${API_URL}/auth/login`, {
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

                localStorage.setItem("username", data.user.name);

                localStorage.setItem("isLogin", "true");

                localStorage.setItem("userMode", "user");

                navigate("/dashboard", {
                  replace: true,
                });
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
              color: "#94a3b8",
              margin: "10px 0",
            }}
          >
            Belum punya akun?{" "}
            <span
              onClick={() => navigate("/register", { replace: true })}
              style={{
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Daftar di sini
            </span>
          </p>
        </div>
      </Background>
    </>
  );
};

export default Login;

import Navbar from "../../components/Navbar";
import "../../styles/auth.css";
import userIcon from "../../assets/user-auth-icon.png";
import Background from "../../components/Background";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            onClick={() => {
              const user = localStorage.getItem("registeredUser");

              if (!user) {
                alert("Belum ada akun, silakan daftar dulu");
                return;
              }

              const parsed = JSON.parse(user);

              if (email !== parsed.email || password !== parsed.password) {
                alert("Email atau password salah");
                return;
              }

              localStorage.setItem("isLogin", "true");
              localStorage.setItem("userMode", "user");
              localStorage.setItem("username", parsed.name);

              navigate("/dashboard", { replace: true });
            }}
          >
            Masuk
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

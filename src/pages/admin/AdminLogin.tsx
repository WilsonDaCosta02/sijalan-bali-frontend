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
                const response = await fetch(
                  `${API_URL}/api/auth/admin-login`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email,
                      password,
                    }),
                  },
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.message || "Login admin gagal");
                  return;
                }

                // 🔥 simpan auth
                localStorage.setItem("admin_token", data.token);

                localStorage.setItem("user", JSON.stringify(data.user));

                localStorage.setItem("admin_username", data.user.name);

                localStorage.setItem("userMode", "admin");

                navigate("/admin-dashboard");
              } catch (err) {
                console.log(err);
                alert("Terjadi kesalahan server");
              }
            }}
          >
            Masuk sebagai Admin
          </button>
        </div>
      </Background>
    </div>
  );
};

export default AdminLogin;

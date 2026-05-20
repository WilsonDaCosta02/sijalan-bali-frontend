import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src="/favicon.png" style={styles.icon} />

        <h1 style={styles.title}>
          Monitoring Infrastruktur <br />
          Jalan Provinsi Bali
        </h1>

        <p style={styles.subtitle}>
          Sistem Informasi Geospasial untuk pelaporan dan pemantauan kondisi
          jalan secara terintegrasi dan real-time.
        </p>

        <div style={styles.buttonGroup}>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Masuk ke SIJALAN
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              localStorage.removeItem("isLogin");
              localStorage.removeItem("userMode");
              localStorage.removeItem("username");
              localStorage.removeItem("registeredUser"); // 🔥 INI WAJIB

              localStorage.setItem("userMode", "guest");

              navigate("/dashboard");
            }}
          >
            Lanjut sebagai Tamu
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative" as const,
    height: "100%", // 🔥 ganti ini
  },
  content: {
    position: "relative" as const,
    zIndex: 2,
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center" as const,
    color: "white",

    padding: window.innerWidth < 768 ? "40px 24px 90px" : "20px",

    boxSizing: "border-box" as const,
  },
  icon: {
    width: "60px",
    marginBottom: "5px",
  },
  title: {
    fontSize: "clamp(20px, 5vw, 36px)", // 🔥 responsive auto
    fontWeight: "bold",
    marginBottom: "10px",
    lineHeight: "1.2",
  },
  subtitle: {
    maxWidth: "600px",
    marginTop: "10px",
    marginBottom: "20px",
    opacity: 0.9,
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  primary: {
    backgroundColor: "rgba(15, 118, 110, 1)",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.3)",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "white",
  },
};

export default Hero;

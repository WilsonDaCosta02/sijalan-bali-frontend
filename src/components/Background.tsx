import heroImg from "../assets/hero.jpg"

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        {children}
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: "relative" as const,
    height: "calc(100vh - 60px)",
    backgroundImage: `url(${heroImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center 30%",
    backgroundRepeat: "no-repeat",
  },
  overlay: {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
  position: "relative" as const,
  zIndex: 2,
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center" as const,
},
}

export default Background
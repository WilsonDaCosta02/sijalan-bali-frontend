import Navbar from "../../components/Navbar"
import Background from "../../components/Background"
import Hero from "../../components/Hero"

const Landing = () => {
  return (
    <>
      <Navbar setOpenSidebar={() => {}} />
      <Background>
        <Hero />
      </Background>
    </>
  )
}

export default Landing
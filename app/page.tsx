import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import PipIntro from "@/components/pip-intro"
import Profiles from "@/components/profiles"
import Mentorship from "@/components/mentorship"
import Institutions from "@/components/institutions"
import Discovery from "@/components/discovery"
import Safety from "@/components/safety"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <main className="overflow-hidden">
          <Hero />
          <PipIntro />
          <Profiles />
          <Mentorship />
          <Institutions />
          <Discovery />
          <Safety />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}

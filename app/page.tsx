
import { testDatabaseConnections } from '@/lib/db-utils'
import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import PipIntro from "@/components/pip-intro"
import Profiles from "@/components/profiles"
import Mentorship from "@/components/mentorship"
import Institutions from "@/components/institutions"
import Discovery from "@/components/discovery"
import Safety from "@/components/safety"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  // Test the connection when the component mounts
  testDatabaseConnections().then(results => {
    console.log('Database connection test results:', results)
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <main>
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

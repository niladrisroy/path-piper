import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import PipIntro from "@/components/pip-intro"
import Profiles from "@/components/profiles"
import Mentorship from "@/components/mentorship"
import Institutions from "@/components/institutions"
import Discovery from "@/components/discovery"
import Safety from "@/components/safety"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PathPiper",
    url: "https://pathpiper.com",
    logo: "https://pathpiper.com/images/pathpiper-logo-full.png",
    description:
      "Safe, global education social network connecting students, mentors, and institutions.",
    sameAs: [
      "https://twitter.com/pathpiper",
      "https://instagram.com/pathpiper",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@pathpiper.com",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PathPiper",
    url: "https://pathpiper.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://pathpiper.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is PathPiper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PathPiper is a safe, global education social network that connects students with AI-matched mentors, career discovery tools, and an academic community. It is designed specifically for students, with built-in safety, privacy, and COPPA/GDPR-K compliance.",
        },
      },
      {
        "@type": "Question",
        name: "Is PathPiper safe for kids?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. PathPiper is COPPA and GDPR-K compliant, with AI-powered content moderation, 24/7 human moderation, parent dashboards, and privacy-first architecture. We never sell student data.",
        },
      },
      {
        "@type": "Question",
        name: "How does AI mentorship work on PathPiper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PathPiper's AI reads your profile, learning goals, interests, and style — then matches you with mentors who are already a 90%+ fit. The system continuously refines recommendations as you grow.",
        },
      },
      {
        "@type": "Question",
        name: "Is PathPiper free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, PathPiper is free to join for students. Sign up at my.pathpiper.com/auth and get your profile set up in under 2 minutes.",
        },
      },
      {
        "@type": "Question",
        name: "Who can join PathPiper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PathPiper is open to students, mentors (educators, professionals, academics), and institutions (schools, colleges, universities). Each role has a tailored experience.",
        },
      },
      {
        "@type": "Question",
        name: "What is Pip on PathPiper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pip is PathPiper's AI learning companion — a guide that suggests mentors, celebrates your achievements, and nudges you toward career opportunities aligned with your goals.",
        },
      },
    ],
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <main className="overflow-hidden">
          <Hero />
          <HowItWorks />
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

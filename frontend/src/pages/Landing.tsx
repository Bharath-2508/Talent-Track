import { useState, useEffect } from 'react'
import { Target } from 'lucide-react'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import SportsScroll from '../components/landing/SportsScroll'
import FeaturesSection from '../components/landing/FeaturesSection'
import JourneySection from '../components/landing/JourneySection'
import PortalsSection from '../components/landing/PortalsSection'

export default function Landing() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const sectionIds = ['home', 'sports', 'features', 'journey', 'portals']
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            if (id === 'sports') {
              setActiveSection('features')
            } else {
              setActiveSection(id)
            }
          }
        })
      },
      {
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.2,
      }
    )

    sectionElements.forEach((el) => observer.observe(el))

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="landing" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Background ambient glowing orbs */}
      <div className="bg-orb" />

      {/* Navbar with smooth active state indicator */}
      <Navbar activeSection={activeSection} />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Built exclusively for Running / Sprinting - Showcase Section */}
      <SportsScroll />

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. Athlete Journey Section */}
      <JourneySection />

      {/* 5. Role-Based Portals Section */}
      <PortalsSection />

      {/* Footer */}
      <footer
        className="footer"
        style={{
          borderTop: '1px solid var(--border)',
          padding: '40px 24px',
          textAlign: 'center',
          background: 'rgba(7, 11, 20, 0.95)',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}
      >
        <div
          className="flex center"
          style={{
            justifyContent: 'center',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <Target size={18} color="#3d8bff" />
          <span style={{ fontWeight: 700, color: '#fff' }}>
            Analyze → Learn → Improve → Track → Showcase → Get Recruited
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
          © 2026 TalentTrack AI · Built for the future of running &amp; sprinting technology &amp; talent discovery
        </p>
      </footer>
    </div>
  )
}

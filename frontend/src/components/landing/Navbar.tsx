import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavbarProps {
  activeSection: string
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileOpen(false)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'journey', label: 'Journey' },
    { id: 'portals', label: 'Portals' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070b14]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg shadow-black/40'
          : 'bg-transparent py-5'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.75)',
        borderBottom: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Brand Logo */}
        <button
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 group text-left cursor-pointer border-none bg-transparent"
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          <div
            className="brand-logo"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 8px 20px -6px rgba(124, 92, 255, 0.6)',
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 18,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              TalentTrack <span className="grad-text">AI</span>
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav
          className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 99,
            padding: '4px 8px',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent rounded-full ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  position: 'relative',
                  padding: '6px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 99,
                  transition: 'color 0.2s ease',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/40 rounded-full shadow-[0_0_12px_rgba(61,139,255,0.4)]"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--grad-soft)',
                      border: '1px solid var(--grad-border)',
                      borderRadius: 99,
                      boxShadow: '0 0 14px rgba(61, 139, 255, 0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10" style={{ position: 'relative', zIndex: 2 }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/player/login')}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/player/register')}
            className="btn btn-primary btn-sm"
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              background: 'var(--grad)',
              border: 'none',
              borderRadius: 10,
              boxShadow: '0 4px 16px -4px rgba(124, 92, 255, 0.6)',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden icon-btn"
            style={{
              display: 'none',
              padding: 8,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: '#fff',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            background: 'rgba(10, 15, 28, 0.96)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                fontSize: 15,
                fontWeight: 600,
                color: activeSection === item.id ? 'var(--blue)' : 'var(--text)',
                background: activeSection === item.id ? 'var(--grad-soft)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </header>
  )
}

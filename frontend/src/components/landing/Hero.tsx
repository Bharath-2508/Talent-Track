import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Activity, ShieldCheck, Zap, Award } from 'lucide-react'

export default function Hero() {
  const navigate = useNavigate()

  const scrollToSports = () => {
    const el = document.getElementById('sports') || document.getElementById('features')
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="land-hero" style={{ paddingTop: 130, paddingBottom: 80 }}>
      <div className="hero-grid" style={{ maxWidth: 1080 }}>
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ width: '100%' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="hero-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 99,
              background: 'var(--grad-soft)',
              border: '1px solid var(--grad-border)',
              boxShadow: '0 0 20px rgba(61, 139, 255, 0.25)',
              color: '#dbe7ff',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <Sparkles size={16} className="text-blue-400 animate-pulse" color="#3d8bff" />
            <span>AI-Powered Running / Sprinting Intelligence</span>
          </motion.div>

          {/* Main Title */}
          <h1
            className="hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 5.2vw, 64px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}
          >
            Discover Your Potential.
            <br />
            Become the <span className="grad-text">Athlete</span> You Were Meant to Be.
          </h1>

          {/* Subtitle */}
          <p
            className="hero-sub"
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(16px, 2vw, 19px)',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            AI-powered performance analysis, personalized training and intelligent recruitment — one platform built exclusively for runners and sprinters and their coaches.
          </p>

          {/* CTAs */}
          <div
            className="hero-cta"
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 48,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/player/register')}
              className="btn btn-primary btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 14,
                background: 'var(--grad)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 10px 30px -8px rgba(124, 92, 255, 0.7)',
                cursor: 'pointer',
              }}
            >
              Get Started <ArrowRight size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToSports}
              className="btn btn-outline btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 26px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-strong)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Explore AI Analysis
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="hero-stats"
            style={{
              display: 'flex',
              gap: 48,
              justifyContent: 'center',
              flexWrap: 'wrap',
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="hero-stat" style={{ textAlign: 'center' }}>
              <div className="n grad-text" style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                10,000+
              </div>
              <div className="l" style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                Athletes Analyzed
              </div>
            </div>

            <div className="hero-stat" style={{ textAlign: 'center' }}>
              <div className="n grad-text" style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                100%
              </div>
              <div className="l" style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                Sprint-Focused
              </div>
            </div>

            <div className="hero-stat" style={{ textAlign: 'center' }}>
              <div className="n grad-text" style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                87%
              </div>
              <div className="l" style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                Avg AI Accuracy
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Decorative Mockup Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7 }}
        style={{
          maxWidth: 920,
          margin: '50px auto 0',
          position: 'relative',
          padding: 2,
          borderRadius: 24,
          background: 'var(--grad-border)',
          boxShadow: '0 20px 60px -20px rgba(61, 139, 255, 0.4)',
        }}
      >
        <div
          style={{
            background: 'var(--bg-soft-2)',
            borderRadius: 22,
            padding: '24px 28px',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--grad-soft)',
                border: '1px solid var(--grad-border)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--blue)',
              }}
            >
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700 }}>
                Live AI Pose Tracking Engine
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                Running / Sprinting Form Analysis
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Detected Form Score</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                94.2 <span style={{ fontSize: 13 }}>/ 100</span>
              </div>
            </div>
            <span className="side-chip" style={{ background: 'rgba(52, 211, 153, 0.15)', borderColor: 'rgba(52, 211, 153, 0.3)', color: '#34d399' }}>
              <ShieldCheck size={14} /> Verified Biomechanics
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

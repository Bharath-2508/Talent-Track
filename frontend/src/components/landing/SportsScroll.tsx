import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react'

interface SportData {
  id: string
  name: string
  emoji: string
  color: string
  grad: string
  border: string
  desc: string
  aiExamples: string[]
  aiMessage: string
  metrics: { label: string; score: number }[]
}

const SPORTS_DATA: SportData[] = [
  {
    id: 'running',
    name: 'Running / Sprinting',
    emoji: '🏃',
    color: '#3d8bff',
    grad: 'linear-gradient(135deg, rgba(61, 139, 255, 0.25) 0%, rgba(124, 92, 255, 0.1) 100%)',
    border: 'rgba(61, 139, 255, 0.4)',
    desc: 'Biomechanical AI tracking for sprint stride mechanics, posture, arm drive, knee drive, body alignment and movement symmetry.',
    aiExamples: ['Posture', 'Arm movement', 'Knee drive', 'Body alignment', 'Running technique', 'Symmetry'],
    aiMessage: 'AI focuses only on running and sprinting movements and performance.',
    metrics: [
      { label: 'Posture', score: 88 },
      { label: 'Arm Movement', score: 84 },
      { label: 'Leg / Knee Movement', score: 86 },
      { label: 'Running Technique', score: 83 },
      { label: 'Movement Symmetry', score: 85 },
    ],
  },
]

export default function SportsScroll() {
  const targetRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1])
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.96, 1])

  const activeSport = SPORTS_DATA[0]

  return (
    <section
      id="sports"
      ref={targetRef}
      style={{
        position: 'relative',
        height: isMobile ? 'auto' : '120vh',
        background: 'linear-gradient(180deg, var(--bg) 0%, #f1f5f9 50%, var(--bg) 100%)',
        paddingTop: isMobile ? 60 : 0,
        paddingBottom: isMobile ? 60 : 0,
      }}
    >
      <div
        style={{
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 0 : 80,
          minHeight: isMobile ? 'auto' : '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: isMobile ? '0 20px' : '30px 0',
        }}
      >
        {/* Section Header */}
        <div className="center" style={{ maxWidth: 760, margin: '0 auto 28px', padding: '0 20px' }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} /> Running / Sprinting Intelligence
          </div>
          <h2 className="sec-title mt-2" style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800 }}>
            Built Exclusively for <span className="grad-text">Running / Sprinting</span>
          </h2>
          <p className="sec-sub" style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 8 }}>
            AI-powered analysis designed specifically for sprint biomechanics — never generic, never fabricated.
          </p>
        </div>

        {/* Dynamic AI Message Banner */}
        <motion.div style={{ maxWidth: 840, margin: '0 auto 32px', width: '100%', padding: '0 20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: activeSport.grad,
              border: `1px solid ${activeSport.border}`,
              borderRadius: 16,
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: `0 8px 24px -6px ${activeSport.border}`,
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 22 }}>{activeSport.emoji}</span>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: activeSport.color,
                  marginRight: 8,
                }}
              >
                {activeSport.name} AI:
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                "{activeSport.aiMessage}"
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Single Focus Card */}
        <motion.div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 20px',
            opacity,
            scale,
          }}
        >
          <div style={{ width: '100%', maxWidth: 620, flexShrink: 0 }}>
            <SportCard sport={activeSport} isActive={true} />
          </div>
        </motion.div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginTop: 28,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 99,
              background: 'var(--grad-soft)',
              border: '1px solid var(--grad-border)',
              color: '#dbe7ff',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} color={activeSport.color} /> 100% Sprint-Aware · No other sports
          </span>
        </div>
      </div>
    </section>
  )
}

function SportCard({ sport, isActive }: { sport: SportData; isActive: boolean }) {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(20px)',
        border: isActive ? `1px solid ${sport.border}` : '1px solid var(--border)',
        borderRadius: 24,
        padding: 28,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isActive ? `0 18px 45px -15px ${sport.border}` : 'var(--shadow)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb background inside card */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: sport.color,
          opacity: 0.12,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: sport.grad,
              border: `1px solid ${sport.border}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
            }}
          >
            {sport.emoji}
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff' }}>
              {sport.name}
            </h3>
            <span style={{ fontSize: 11, color: sport.color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Isolated AI Module
            </span>
          </div>
        </div>

        <span
          style={{
            background: 'var(--grad-soft)',
            border: '1px solid var(--grad-border)',
            borderRadius: 99,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: '#dbe7ff',
          }}
        >
          100% Sprint-Aware
        </span>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, marginBottom: 22 }}>
        {sport.desc}
      </p>

      {/* AI Analysis Examples Tags */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700, marginBottom: 10 }}>
          Target AI Analysis Metrics:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sport.aiExamples.map((ex) => (
            <span
              key={ex}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CheckCircle2 size={13} color={sport.color} />
              {ex}
            </span>
          ))}
        </div>
      </div>

      {/* Sample Metrics Mock */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sport.metrics.map((m) => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: sport.color }}>
                {m.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
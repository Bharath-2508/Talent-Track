import { motion } from 'framer-motion'
import {
  Upload,
  Cpu,
  BarChart,
  Target,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowDown,
} from 'lucide-react'

interface Step {
  num: string
  title: string
  desc: string
  icon: any
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Upload Video',
    desc: 'Record and upload raw practice footage directly from your mobile or camera.',
    icon: Upload,
  },
  {
    num: '02',
    title: 'AI Analysis',
    desc: 'Pose detection AI extracts 3D landmarks and evaluates running-specific posture & motion.',
    icon: Cpu,
  },
  {
    num: '03',
    title: 'Get Performance Insights',
    desc: 'Receive instant scorecard detailing strengths, form defects, and risk warnings.',
    icon: BarChart,
  },
  {
    num: '04',
    title: 'Personalized Training',
    desc: 'Follow AI-tailored daily drills and pro reference tutorials targeted at your exact flaws.',
    icon: Target,
  },
  {
    num: '05',
    title: 'Track Growth',
    desc: 'Watch your performance score evolve across historical comparisons and milestone badges.',
    icon: TrendingUp,
  },
  {
    num: '06',
    title: 'Connect With Coaches/Academies',
    desc: 'Showcase your verified AI portfolio to scouts and apply directly to academy trials.',
    icon: Award,
  },
]

export default function JourneySection() {
  return (
    <section id="journey" className="section" style={{ paddingTop: 70, paddingBottom: 90 }}>
      {/* Header */}
      <div className="center" style={{ maxWidth: 760, margin: '0 auto 54px' }}>
        <div className="section-tag">Athlete Pathway</div>
        <h2 className="sec-title mt-2" style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800 }}>
          From First Video to <span className="grad-text">First Selection</span>
        </h2>
        <p className="sec-sub" style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 10 }}>
          A clear 6-step guided roadmap from raw practice footage to elite scouting opportunities.
        </p>
      </div>

      {/* Desktop Horizontal Journey Steps */}
      <div className="hidden lg:block" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 12,
            position: 'relative',
          }}
        >
          {STEPS.map((s, idx) => {
            const IconComp = s.icon
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {/* Step Circle Badge */}
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 20,
                    background: 'var(--grad)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    boxShadow: '0 10px 24px -6px rgba(124, 92, 255, 0.6)',
                    marginBottom: 16,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <IconComp size={24} />
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'rgba(10, 15, 28, 0.95)',
                      border: '1px solid var(--grad-border)',
                      borderRadius: 99,
                      padding: '2px 7px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--cyan)',
                    }}
                  >
                    {s.num}
                  </span>
                </div>

                {/* Title */}
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#fff',
                    marginBottom: 8,
                    minHeight: 40,
                  }}
                >
                  {s.title}
                </h4>

                {/* Description */}
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  {s.desc}
                </p>

                {/* Connecting Arrow for items except the last */}
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 26,
                      right: -16,
                      color: 'var(--text-dim)',
                      zIndex: 1,
                    }}
                  >
                    <ChevronRight size={20} color="var(--blue)" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Mobile/Tablet Vertical Sequential Flow */}
      <div className="lg:hidden" style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {STEPS.map((s, idx) => {
            const IconComp = s.icon
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'var(--grad)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      STEP {s.num}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff', margin: '2px 0 4px' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>

                {idx < STEPS.length - 1 && (
                  <div style={{ margin: '8px 0', color: 'var(--blue)' }}>
                    <ArrowDown size={18} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

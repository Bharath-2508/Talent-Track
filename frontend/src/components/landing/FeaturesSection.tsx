import { motion, Variants } from 'framer-motion'
import {
  Cpu,
  Target,
  Play,
  Award,
  TrendingUp,
  Users,
  UserCheck,
  Clock,
  Sliders,
  FileText,
  BarChart3,
} from 'lucide-react'

interface Feature {
  icon: any
  title: string
  desc: string
  tag: string
  color: string
}

const FEATURES: Feature[] = [
  {
    icon: Cpu,
    title: 'AI Performance Analysis',
    desc: 'Upload running / sprinting videos. AI scores 20+ biomechanical metrics in seconds.',
    tag: 'Core AI Engine',
    color: '#3d8bff',
  },
  {
    icon: Target,
    title: 'Personalized Training Plans',
    desc: 'Adaptive daily training schedules target your specific biomechanical weaknesses detected in video.',
    tag: 'Smart Drills',
    color: '#8b5cf6',
  },
  {
    icon: Play,
    title: 'Learning Recommendations',
    desc: 'Running-specific learning videos recommended only for your exact form flaws and skill gaps.',
    tag: 'Video Hub',
    color: '#22d3ee',
  },
  {
    icon: Award,
    title: 'Scholarships & Trials',
    desc: 'Instant match with open track trials, sprint academies, and university athletics scholarships.',
    tag: 'Opportunities',
    color: '#fbbf24',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    desc: 'Watch your AI score climb across timeline, comparisons and unlocked milestone badges.',
    tag: 'Analytics',
    color: '#34d399',
  },
  {
    icon: Users,
    title: 'Coach Recruitment',
    desc: 'Direct visibility to verified coaches and scouts searching for specific skill profiles.',
    tag: 'Discovery',
    color: '#e879f9',
  },
  {
    icon: UserCheck,
    title: 'AI Athlete Portfolio',
    desc: 'Professional showcase page with verified metrics, video clips, and career stats.',
    tag: 'Showcase',
    color: '#3d8bff',
  },
  {
    icon: Clock,
    title: 'Athlete Growth Timeline',
    desc: 'Chronological history of your video uploads, score improvements, and achievements.',
    tag: 'History',
    color: '#8b5cf6',
  },
  {
    icon: Sliders,
    title: 'AI Video Comparison',
    desc: 'Side-by-side video player with landmark overlay comparison against past attempts or pros.',
    tag: 'Comparison',
    color: '#22d3ee',
  },
  {
    icon: FileText,
    title: 'Resume Generator',
    desc: 'One-click AI resume PDF generator tailored for trials and university recruitment.',
    tag: 'Export',
    color: '#fbbf24',
  },
  {
    icon: BarChart3,
    title: 'Coach Recruitment Analytics',
    desc: 'Deep talent funnel analytics, player comparison tools, and shortlist management for scouts.',
    tag: 'Coach Suite',
    color: '#34d399',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="section" style={{ paddingTop: 80, paddingBottom: 90 }}>
      {/* Header */}
      <div className="center" style={{ maxWidth: 760, margin: '0 auto 50px' }}>
        <div className="section-tag">Platform Capabilities</div>
        <h2 className="sec-title mt-2" style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800 }}>
          Everything An Athlete Needs To <span className="grad-text">Excel & Get Recruited</span>
        </h2>
        <p className="sec-sub" style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 10 }}>
          From raw running footage to intelligent scouting analytics — an all-in-one platform built for running and sprinting talent.
        </p>
      </div>

      {/* Grid of 11 Features */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 22,
        }}
      >
        {FEATURES.map((f) => {
          const IconComp = f.icon
          return (
            <motion.div
              key={f.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 26,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Top Row: Icon + Tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'var(--grad)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    boxShadow: '0 8px 20px -6px rgba(124, 92, 255, 0.6)',
                  }}
                >
                  <IconComp size={22} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: f.color,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: 99,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {f.tag}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#fff',
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

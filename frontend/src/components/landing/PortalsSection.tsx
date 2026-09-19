import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, UserPlus, Zap, Shield, Building2 } from 'lucide-react'

export default function PortalsSection() {
  const navigate = useNavigate()

  return (
    <section id="portals" className="section" style={{ paddingTop: 70, paddingBottom: 110 }}>
      {/* Header */}
      <div className="center" style={{ maxWidth: 760, margin: '0 auto 54px' }}>
        <div className="section-tag">Role-Based Access</div>
        <h2 className="sec-title mt-2" style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800 }}>
          Three Tailored Portals · <span className="grad-text">One Ecosystem</span>
        </h2>
        <p className="sec-sub" style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 10 }}>
          Choose your designated portal to access running-specific performance tools and scouting networks.
        </p>
      </div>

      {/* Grid of 3 Portals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 28,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Card 1: Athlete Portal (Slide from Left) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -8, transition: { duration: 0.25 } }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 17, 32, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(61, 139, 255, 0.35)',
            borderRadius: 24,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(61, 139, 255, 0.25)',
          }}
        >
          {/* Top Icon & Tag */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: 'var(--grad)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 26,
                boxShadow: '0 10px 24px -6px rgba(124, 92, 255, 0.6)',
              }}
            >
              <Zap size={28} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--cyan)',
                background: 'rgba(34, 211, 238, 0.12)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                padding: '4px 12px',
                borderRadius: 99,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              For Athletes
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              marginBottom: 10,
            }}
          >
            Athlete Portal
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 28, flex: 1 }}>
            For athletes who want to analyze, improve and showcase their running performance with sprint-specific AI analysis and training plans.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
            {['AI Video Performance Scoring', 'Sprint-specific Drill Recommendations', 'Sharable Talent Showcase Resume'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dbe7ff' }}>
                <span style={{ color: 'var(--blue)', fontWeight: 800 }}>✓</span> {feat}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button
              onClick={() => navigate('/player/login')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <LogIn size={15} /> Player Login
            </button>
            <button
              onClick={() => navigate('/player/register')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'var(--grad)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 6px 18px -4px rgba(124, 92, 255, 0.6)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <UserPlus size={15} /> Player Register
            </button>
          </div>
        </motion.div>

        {/* Card 2: Coach Portal (Scale & Fade In) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -8, transition: { duration: 0.25 } }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 17, 32, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: 24,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 26,
                boxShadow: '0 10px 24px -6px rgba(168, 85, 247, 0.6)',
              }}
            >
              <Shield size={28} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--purple)',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '4px 12px',
                borderRadius: 99,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              For Coaches & Scouts
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              marginBottom: 10,
            }}
          >
            Coach Portal
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 28, flex: 1 }}>
            For coaches who want to discover and evaluate athletes with AI match scores, performance filters, and recruitment funnels.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
            {['AI Talent Search Engine', 'Multi-Athlete Comparison Tool', 'Direct Trial Invitation System'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dbe7ff' }}>
                <span style={{ color: 'var(--purple)', fontWeight: 800 }}>✓</span> {feat}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button
              onClick={() => navigate('/coach/login')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <LogIn size={15} /> Coach Login
            </button>
            <button
              onClick={() => navigate('/coach/login')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 6px 18px -4px rgba(139, 92, 246, 0.6)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <UserPlus size={15} /> Coach Register
            </button>
          </div>
        </motion.div>

        {/* Card 3: Academy Portal (Slide from Right) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -8, transition: { duration: 0.25 } }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 17, 32, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            borderRadius: 24,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(52, 211, 153, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 26,
                boxShadow: '0 10px 24px -6px rgba(16, 185, 129, 0.6)',
              }}
            >
              <Building2 size={28} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--green)',
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '4px 12px',
                borderRadius: 99,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              For Academies & Clubs
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              marginBottom: 10,
            }}
          >
            Academy Portal
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 28, flex: 1 }}>
            For academies that want to create trials, manage athlete applications, shortlist candidates and build talent pipelines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
            {['Public Trial Publishing Hub', 'Applicant Screening Pipeline', 'Recruitment Analytics Dashboard'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dbe7ff' }}>
                <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span> {feat}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button
              onClick={() => navigate('/coach/login')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <LogIn size={15} /> Academy Login
            </button>
            <button
              onClick={() => navigate('/coach/login')}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 6px 18px -4px rgba(16, 185, 129, 0.6)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <UserPlus size={15} /> Academy Register
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

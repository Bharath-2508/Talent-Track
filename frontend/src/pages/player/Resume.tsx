import { useState } from 'react'
import { Download, FileText, Printer, Mail, Phone, MapPin } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { ATHLETE, SPORT_META, STRENGTHS, BADGES, WEAKNESSES } from '../../data/mock'

export default function Resume() {
  const { sport } = useAthlete()
  const meta = SPORT_META[sport]
  const [generating, setGenerating] = useState(false)

  const gen = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 1600)
  }

  return (
    <Layout nav={PLAYER_NAV} title="My Resume" crumb="My Resume" portal="player" notifCount={2}>
      <SectionHead
        title="My AI Sports Resume"
        sub="A professional, coach-ready summary generated from my AI profile"
        action={
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={gen}><Printer size={14} /> Print</button>
            <button className="btn btn-primary btn-sm" onClick={gen}><Download size={14} /> Download PDF</button>
          </div>
        }
      />

      {generating && <div className="skeleton" style={{ height: 90, marginBottom: 18 }} />}

      <div className="resume">
        <div className="flex between wrap gap-2">
          <div>
            <div className="r-name">{ATHLETE.name}</div>
            <div className="r-role">{meta.icon} {meta.label} · {ATHLETE.position}</div>
            <div className="r-contact flex wrap gap-2">
              <span className="flex gap-1"><Mail size={13} /> {ATHLETE.email}</span>
              <span className="flex gap-1"><Phone size={13} /> +91 98765 43210</span>
              <span className="flex gap-1"><MapPin size={13} /> {ATHLETE.location}</span>
            </div>
          </div>
          <div>
            <span className="r-score">AI Score: {ATHLETE.overallScore}/100</span>
            <div className="tiny" style={{ color: '#6b7280', marginTop: 6 }}>{ATHLETE.age} years · {ATHLETE.gender} · {ATHLETE.experience}</div>
          </div>
        </div>

        <div className="r-sec-title">AI Performance Summary</div>
        <div className="r-summary">
          A {meta.label.toLowerCase()} {ATHLETE.position.toLowerCase()} with an elite AI action score of 87/100. Excellent balance and technique with a verified 96% sport-detection confidence. Improved +21 AI points in 4 months through TalentTrack AI personalized training. Strong district-level potential (92%) with state readiness projected by next season.
        </div>

        <div className="r-sec-title">Sport Profile</div>
        {[
          ['Sport', meta.label],
          ['Position', ATHLETE.position],
          ['Experience', ATHLETE.experience],
          ['Performance Score', `${ATHLETE.overallScore}/100`],
          ['Improvement', `+${ATHLETE.improvement}% (4 months)`],
        ].map(([k, v]) => (
          <div key={k} className="r-line">
            <span style={{ fontWeight: 700, color: '#111827' }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}

        <div className="r-sec-title">Key Skills</div>
        <div className="flex wrap gap-1">
          {['Top Speed 36.2 km/h', 'Smooth Stride Rhythm', 'Fast Reactivity', 'Fitness 8.5/10', ...STRENGTHS.map((s) => s.replace('Excellent ', '')).slice(0, 2)].map((s) => (
            <span key={s} style={{ background: '#eef2ff', color: '#4338ca', padding: '4px 10px', borderRadius: 6, fontSize: 12.5, fontWeight: 600 }}>{s}</span>
          ))}
        </div>

        <div className="r-sec-title">Achievements & Badges</div>
        {BADGES.filter((b) => b.earned).map((b) => (
          <div key={b.name} className="r-line">
            <span>{b.icon} {b.name}</span>
            <span>{b.date}</span>
          </div>
        ))}
        <div className="r-line">
          <span>🏏 District selection · Player of the Match</span>
          <span>Mar 2026</span>
        </div>

        <div className="r-sec-title">Certificates</div>
        <div className="r-line"><span>🎓 TalentTrack AI – Advanced {meta.label} Analytics</span><span>Apr 2026</span></div>
        <div className="r-line"><span>🎓 Level 2 Strength & Conditioning Foundation</span><span>Jan 2026</span></div>

        <div className="r-sec-title">Contact Information</div>
        <div className="r-line"><span>Email</span><span>{ATHLETE.email}</span></div>
        <div className="r-line"><span>Phone</span><span>+91 98765 43210</span></div>
        <div className="r-line"><span>Location</span><span>{ATHLETE.location}</span></div>
      </div>

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><FileText /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Resume tips from AI</div>
              <div className="tiny dim">Shortlisted by 3 coaches this month · add your latest match video for higher visibility</div>
            </div>
          </div>
          <Pill color="pill-green">✓ ATS friendly</Pill>
        </div>
      </Card>
    </Layout>
  )
}

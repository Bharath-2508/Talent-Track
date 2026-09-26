import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Building2, Award, Pencil } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, Progress } from '../../components/ui'
import { COACH, ANALYTICS } from '../../data/mock'

export default function CoachProfile() {
  return (
    <Layout nav={COACH_NAV} title="Profile" crumb="Profile" portal="coach" notifCount={3}>
      <SectionHead title="Coach Profile" sub="Public profile shown to athletes and academies" action={<button className="btn btn-outline btn-sm"><Pencil size={14} /> Edit Profile</button>} />

      <div className="grid grid-2">
        <Card glow pad style={{ gridColumn: '1 / -1' }}>
          <div className="flex between wrap gap-4">
            <div className="flex" style={{ gap: 20 }}>
              <Avatar name={COACH.name} size={88} index={3} />
              <div>
                <h2 className="sec-title" style={{ fontSize: 24 }}>{COACH.name}</h2>
                <div className="flex gap-2 mt-1 wrap">
                  <Pill color="pill-blue">🛡️ {COACH.role}</Pill>
                  <Pill><Building2 size={12} /> {COACH.organization}</Pill>
                </div>
                <div className="flex gap-3 mt-3 wrap tiny muted">
                  <span className="flex gap-1"><Mail size={13} /> {COACH.email}</span>
                  <span className="flex gap-1"><Phone size={13} /> +91 99887 66554</span>
                  <span className="flex gap-1"><MapPin size={13} /> Chennai, Tamil Nadu</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="match-badge text-grad" style={{ fontSize: 22 }}>{ANALYTICS.successRate}%</div>
              <div className="tiny dim">recruitment success rate</div>
            </div>
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Specializations" />
          <div className="flex gap-2 wrap">
            <Pill color="pill-blue">🏃 Sprint Athletes</Pill>
            <Pill color="pill-green">🏁 Speed & Technique</Pill>
            <Pill>Performance Development</Pill>
            <Pill>Youth Talent ID</Pill>
            <Pill>Match Analysis</Pill>
          </div>
          <div className="mt-3">
            <div className="flex between mb-1"><span className="tiny" style={{ fontWeight: 600 }}>Profile strength</span><span className="tiny dim">92%</span></div>
            <Progress value={92} />
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Credentials" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🎓', t: 'B.P.Ed – Sports Coaching', s: 'TN University · 2016' },
              { icon: '🏆', t: 'AFI Level 2 Sprint Coach', s: 'Athletics Federation of India · 2019' },
              { icon: '⭐', t: 'Top 5% Scout Rating', s: 'TalentTrack AI · 2026' },
              { icon: '🏅', t: 'FIFA Talent Coach Certificate', s: 'AIFF · 2021' },
            ].map((c) => (
              <div key={c.t} className="flex" style={{ gap: 12 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.t}</div>
                  <div className="tiny dim">{c.s}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Pill color="pill-amber"><Award size={12} /> Verified Club Coach</Pill>
          </div>
        </Card>

        <Card pad style={{ gridColumn: '1 / -1' }}>
          <SectionHead title="About" />
          <p className="muted small">
            {COACH.name} is a talent identification specialist at {COACH.organization} with 9 years of experience scouting youth
            running and sprinting. Leverages TalentTrack AI analytics to shortlist athletes based on objective AI performance
            scores rather than bias. Has helped 40+ athletes reach district and state level.
          </p>
          <Link to="/coach/dashboard" className="btn btn-primary btn-sm mt-3">Back to Dashboard</Link>
        </Card>
      </div>
    </Layout>
  )
}

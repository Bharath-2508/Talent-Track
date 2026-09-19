import { Link } from 'react-router-dom'
import { Shield, HeartPulse, Footprints, Upload } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'

export default function InjuryRisk() {
  const { stats } = useAthlete()
  const injury = stats.injury

  return (
    <Layout nav={PLAYER_NAV} title="Injury Risk" crumb="Injury Risk" portal="player" notifCount={0}>
      <SectionHead
        title="Injury Risk Dashboard"
        sub="AI assessment of current load risk across key joints"
      />

      {!injury ? (
        <Card glow pad>
          <div className="empty">
            <div className="empty-ic">🛡️</div>
            <h3>No injury assessment yet</h3>
            <p>Joint risk levels and safety tips are generated from your running video assessment.</p>
            <Link to="/player/upload" className="btn btn-primary"><Upload size={15} /> Upload My Video</Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-3">
          <Card glow pad style={{ gridColumn: '1 / -1' }}>
            <div className="flex between wrap gap-4">
              <div className="flex" style={{ gap: 16, alignItems: 'center' }}>
                <div className="stat-icon pulse-ring" style={{ background: 'rgba(52,211,153,0.14)', borderColor: 'rgba(52,211,153,0.4)', color: 'var(--green)' }}>
                  <Shield />
                </div>
                <div>
                  <div className="tiny dim">Current Risk Level</div>
                  <div className={`risk-pill ${injury.risk === 'Low' ? 'risk-low' : injury.risk === 'Moderate' ? 'risk-mid' : 'risk-high'} mt-1`}>
                    {injury.risk}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card pad>
            <SectionHead title="Possible Areas" action={<HeartPulse size={16} color="#fb7185" />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {injury.areas.map((a) => (
                <div key={a.name} className="flex between" style={{ padding: 12, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--border)' }}>
                  <div className="flex" style={{ gap: 10 }}>
                    <Footprints size={17} color="var(--text-dim)" />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <span className={`area-dot`} style={{ background: a.dot, alignSelf: 'center' }} />
                    <span className={`pill ${a.level === 'Low' ? 'pill-green' : 'pill-amber'}`} style={{ fontSize: 11 }}>{a.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card pad>
            <SectionHead title="Training Safety Suggestions" action={<Pill color="pill-green">AI Generated</Pill>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {injury.tips.map((t, i) => (
                <div key={i} className="flex" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <div className="step-num" style={{ width: 26, height: 26, margin: 0, flexShrink: 0, fontSize: 11 }}>{i + 1}</div>
                  <span className="tiny muted">{t}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}
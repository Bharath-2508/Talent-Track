import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, CheckCircle2, ArrowRight } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, Pill, Ring } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { SPORT_META } from '../../data/mock'

export default function AiDetection() {
  const { sport } = useAthlete()
  const meta = SPORT_META[sport]
  const [stage, setStage] = useState<'scanning' | 'detected'>('scanning')
  const [conf, setConf] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setConf((c) => {
        if (c >= 96) {
          clearInterval(t)
          setStage('detected')
          return 96
        }
        return c + 4
      })
    }, 160)
    return () => clearInterval(t)
  }, [])

  return (
    <Layout nav={PLAYER_NAV} title="AI Running Analysis" crumb="Upload Video / Analysis" portal="player" notifCount={2}>
      <div className="grid grid-2">
        <Card pad>
          <SectionTitle>AI Video Analysis</SectionTitle>
          <div className="scan-box mt-3">
            {stage === 'scanning' ? (
              <>
                <div className="scan-grid" />
                <div className="scan-line" />
                <div style={{ height: 420, display: 'grid', placeItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-icon pulse-ring" style={{ margin: '0 auto 16px' }}>
                      <Cpu />
                    </div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>AI Analysis in Progress…</div>
                    <div className="tiny dim mt-1">Analyzing pose · Scoring running metrics</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&q=60"
                  alt="running form analysis"
                  style={{ height: 420, objectFit: 'cover', width: '100%' }}
                />
                <div className="scan-chip">
                  <span className="pill pill-green" style={{ background: 'rgba(6,20,14,0.8)' }}>✓ Analysis complete</span>
                </div>
                <div
                  style={{
                    position: 'absolute', bottom: 14, left: 14, right: 14,
                    display: 'flex', gap: 10, flexWrap: 'wrap',
                  }}
                >
                  <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}>Overall: 87</span>
                  <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}>Posture: 88</span>
                  <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}>Symmetry: 85</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card glow pad>
            <SectionTitle>Running / Sprinting Analysis</SectionTitle>
            {stage === 'detected' ? (
              <div className="mt-3 center">
                <div style={{ fontSize: 64 }}>{meta.icon}</div>
                <div className="detect-sport text-grad mt-2">{meta.label}</div>
                <div className="mt-2">
                  <span className="pill pill-green">Confidence: <b style={{ color: '#fff' }}>96%</b></span>
                </div>
                <div className="flex center mt-3" style={{ justifyContent: 'center' }}>
                  <Ring value={conf} size={130} stroke={10} label={`${conf}%`} sub="confidence" />
                </div>
                <div className="ai-insight mt-3">
                  <Cpu />
                  <span>
                    <b>{meta.label} Performance Analysis Ready.</b> All analysis, training and recommendations are based only on running / sprinting — {meta.label.toLowerCase()}.
                  </span>
                </div>
                <Link to="/player/report" className="btn btn-primary btn-lg btn-block mt-3">
                  View Performance Report <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <div className="mt-3" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Extracting frames…', 'Locking Running / Sprinting analysis…', 'Running pose estimation…', 'Scoring performance metrics…'].map((s, i) => (
                  <div key={s} className="flex gap-2">
                    <div className="bar" style={{ width: 26, flexShrink: 0, alignSelf: 'center' }}>
                      <div className="bar-fill" style={{ width: `${(conf / 96) * 100}%`, animation: 'none' }} />
                    </div>
                    <span className="tiny dim">{s}</span>
                  </div>
                ))}
                <div className="mt-2">
                  <Pill color="pill-blue">Confidence {Math.min(conf, 96)}%</Pill>
                </div>
              </div>
            )}
          </Card>
          <Card pad>
            <div className="flex gap-2">
              <CheckCircle2 size={20} color="#34d399" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Sprint-locked analysis</div>
                <div className="tiny dim mt-1">
                  Every metric, video and opportunity in your account now targets {meta.label}. Only running / sprinting content is shown.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="card-title" style={{ fontSize: 17 }}>{children}</h2>
}

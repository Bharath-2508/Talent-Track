import { Link } from 'react-router-dom'
import { Cpu, TrendingUp, Upload } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill, Ring } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'

export default function CareerPotential() {
  const { stats } = useAthlete()
  const hasAssessment = stats.overall > 0

  return (
    <Layout nav={PLAYER_NAV} title="Career Potential" crumb="Career Potential" portal="player" notifCount={0}>
      <SectionHead
        title="Career Potential"
        sub="AI projection of the highest level you can compete at with your current performance"
        action={hasAssessment ? <Pill color="pill-blue"><TrendingUp size={12} /> based on your latest report</Pill> : undefined}
      />

      {!hasAssessment ? (
        <Card glow pad>
          <div className="empty">
            <div className="empty-ic">🚀</div>
            <h3>Career projection unavailable</h3>
            <p>Your career potential is projected from verified AI assessment data. Upload a running video to get started.</p>
            <Link to="/player/upload" className="btn btn-primary"><Upload size={15} /> Upload My Video</Link>
          </div>
        </Card>
      ) : (
        <>
          <Card glow pad>
            <div className="flex wrap" style={{ gap: 36, justifyContent: 'center', alignItems: 'center' }}>
              {stats.careerPotential?.map((c) => (
                <div key={c.level} className="center">
                  <Ring value={c.value} size={150} stroke={11} label={`${c.value}%`} sub={c.level} color={c.color} />
                  <div className="tiny dim mt-2">{c.level} Level</div>
                </div>
              ))}
            </div>
          </Card>
          <Card pad className="mt-4">
            <div className="ai-insight">
              <Cpu />
              <span>Your career potential is recalculated after every verified assessment. Keep improving your AI score to unlock higher levels.</span>
            </div>
            <div className="mt-3" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.careerPotential?.map((c, i) => (
                <div key={c.level}>
                  <div className="flex between mb-1">
                    <span className="tiny" style={{ fontWeight: 600 }}>{c.level} readiness</span>
                    <span className="tiny dim">{c.value}%</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${c.value}%`, background: c.color, animationDelay: `${i * 0.15}s` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </Layout>
  )
}
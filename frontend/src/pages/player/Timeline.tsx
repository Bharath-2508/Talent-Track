import { Link } from 'react-router-dom'
import { ChevronDown, Trophy, TrendingUp, Upload } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { CoachInboxSection } from '../../components/CoachInboxSection'

export default function GrowthTimeline() {
  const { stats } = useAthlete()
  const timeline = stats.timeline
  const totalGain = timeline.length > 1 ? timeline[timeline.length - 1].score - timeline[0].score : 0

  return (
    <Layout nav={PLAYER_NAV} title="My Growth" crumb="My Growth" portal="player" notifCount={0}>
      <SectionHead
        title="My Growth Timeline"
        sub="My AI score evolution, skill improvements, badges and milestones"
        action={totalGain > 0 ? <Pill color="pill-green"><TrendingUp size={12} /> +{totalGain} points</Pill> : undefined}
      />

      {timeline.length === 0 ? (
        <Card glow pad>
          <div className="empty">
            <div className="empty-ic">📈</div>
            <h3>No growth data yet</h3>
            <p>Your growth timeline is built from verified assessments. Upload and analyze your first video to begin.</p>
            <Link to="/player/upload" className="btn btn-primary"><Upload size={15} /> Upload My Video</Link>
          </div>
        </Card>
      ) : (
        <Card pad>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={t.month} className="t-item">
                <div className="t-dot">
                  <div className="inner" />
                </div>
                <Card className="t-card" hover>
                  <div className="flex between wrap gap-2">
                    <div className="t-month">
                      {t.month}
                      <span className="pill pill-green">▲ +{i === 0 ? t.score : t.score - timeline[i - 1].score} pts</span>
                    </div>
                    {t.badge && <Pill color="pill-amber">{t.badge}</Pill>}
                  </div>
                  <div className="tiny dim mt-1">{t.milestone}</div>
                  <div className="flex gap-2 mt-2 wrap">
                    {t.skills.map((s) => (
                      <span key={s} className="skill-chip">{s}</span>
                    ))}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="mt-2" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-dim)' }}>
                      <ChevronDown size={20} />
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coach Invitations & Direct Messages Section */}
      <CoachInboxSection />

      <Card glow pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><Trophy /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Next milestone</div>
              <div className="tiny dim">Continue uploading assessments to keep your timeline and badges growing.</div>
            </div>
          </div>
          <Link to="/player/upload" className="btn btn-outline btn-sm">Upload Next Video</Link>
        </div>
      </Card>
    </Layout>
  )
}
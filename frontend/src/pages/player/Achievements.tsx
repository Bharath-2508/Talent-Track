import { Lock } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { BADGE_CATALOG } from '../../data/mock'

export default function Achievements() {
  const { stats } = useAthlete()
  const earnedNames = new Set(stats.badges.filter((b) => b.earned).map((b) => b.name))
  const earned = stats.badges.filter((b) => b.earned)

  return (
    <Layout nav={PLAYER_NAV} title="My Achievements" crumb="Achievements" portal="player" notifCount={0}>
      <SectionHead
        title="AI Skill Badges"
        sub={`${earned.length} of ${BADGE_CATALOG.length} badges earned · badges appear automatically in your athlete portfolio`}
        action={<Pill color="pill-amber">{earned.length ? 'Keep it up!' : 'Next: complete an assessment'}</Pill>}
      />

      {earned.length === 0 && (
        <Card glow pad className="mb-4">
          <div className="empty" style={{ padding: '36px 16px' }}>
            <div className="empty-ic">🏆</div>
            <h3>No badges unlocked yet</h3>
            <p>Badges are earned automatically from verified AI assessment scores.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-3">
        {BADGE_CATALOG.map((b) => {
          const isEarned = earnedNames.has(b.name)
          const meta = stats.badges.find((x) => x.name === b.name && x.earned)
          return (
            <Card key={b.name} hover className={isEarned ? 'badge-card' : 'badge-card badge-locked'} pad>
              <div className="badge-ic">
                {!isEarned && <Lock size={20} style={{ position: 'absolute', color: 'var(--text-dim)' }} />}
                <span>{b.icon}</span>
                <div className="glow" />
              </div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              {isEarned ? (
                <Pill color="pill-green">Unlocked {meta?.date}</Pill>
              ) : (
                <Pill>Locked</Pill>
              )}
            </Card>
          )
        })}
      </div>

      <Card glow pad className="mt-4">
        <SectionHead title="Badge criteria" sub="How to unlock every badge" />
        <div style={{ display: 'grid', gap: 8 }}>
          {BADGE_CATALOG.map((b) => {
            const isEarned = earnedNames.has(b.name)
            return (
              <div key={b.name} className="flex between wrap gap-2" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-2">
                  <span>{b.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{b.name}</span>
                </div>
                <span className="tiny dim">{b.desc}</span>
                {isEarned ? <span className="pill pill-green">✓ Earned</span> : <span className="pill">In progress</span>}
              </div>
            )
          })}
        </div>
      </Card>
    </Layout>
  )
}
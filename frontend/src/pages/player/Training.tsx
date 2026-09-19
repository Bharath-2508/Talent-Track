import { Link } from 'react-router-dom'
import { CalendarCheck, Flame, Dumbbell, Moon, Trophy, Play } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { TRAINING_PLAN, SPORT_META } from '../../data/mock'

const TYPE_STYLE: Record<string, { icon: string; pill: string }> = {
  Speed: { icon: '🏃', pill: 'pill-blue' },
  Skill: { icon: '🎯', pill: 'pill-purple' },
  Recovery: { icon: '🧘', pill: 'pill-green' },
  Strength: { icon: '🏋️', pill: 'pill-amber' },
  Race: { icon: '🏁', pill: 'pill-cyan' },
}

export default function TrainingPlan() {
  const { sport } = useAthlete()
  const meta = SPORT_META[sport]
  const today = new Date().getDay()
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today]

  return (
    <Layout nav={PLAYER_NAV} title="My Training Plan" crumb="Training Plan" portal="player" notifCount={2}>
      <SectionHead
        title="My Weekly Training Plan"
        sub={`Personalized program generated from my latest ${meta.label.toLowerCase()} AI report`}
        action={<Pill color="pill-green">✓ Synced with weaknesses</Pill>}
      />

      <div className="plan-grid">
        {TRAINING_PLAN.map((d) => {
          const t = TYPE_STYLE[d.type] || TYPE_STYLE.Skill
          const isToday = d.day === todayName
          return (
            <Card key={d.day} hover pad className={isToday ? 'day-card day-today' : 'day-card'}>
              <div className="day-name">{d.day}</div>
              <div style={{ fontSize: 26 }}>{d.emoji}</div>
              <div className="day-focus">{d.focus}</div>
              <span className={`pill ${t.pill}`} style={{ alignSelf: 'center' }}>{d.type}</span>
              <span className={`tiny ${d.intensity === 'Low' ? 'dim' : d.intensity === 'Medium' ? 'muted' : ''}`}>
                {d.intensity === 'High' ? <span style={{ color: 'var(--amber)' }}>High intensity</span> : d.intensity}
              </span>
              {isToday && <span className="pill pill-green" style={{ alignSelf: 'center' }}>Today</span>}
            </Card>
          )
        })}
      </div>

      <div className="grid grid-2 mt-4">
        <Card pad>
          <SectionHead title="Training Modules" action={<Link to="/player/learn" className="link small">Learning Hub</Link>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Flame size={17} />, t: 'Sprint Acceleration', d: '4 × 60m flying sprints · 3 min rest', dur: '45 min', type: 'Speed' },
              { icon: <Dumbbell size={17} />, t: 'Balance & Footwork Circuit', d: 'Bosu + ladder drills targeting balance (81 → 85)', dur: '35 min', type: 'Skill' },
              { icon: <Play size={17} />, t: 'Sprint Technique Drill', d: 'Posture + knee drive with resistance bands', dur: '40 min', type: 'Skill' },
              { icon: <Moon size={17} />, t: 'Recovery Protocol', d: 'Mobility, foam rolling, 20 min meditation', dur: '25 min', type: 'Recovery' },
            ].map((m) => (
              <div key={m.t} className="flex" style={{ gap: 13 }}>
                <div className="stat-icon" style={{ width: 40, height: 40 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex between wrap gap-1">
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.t}</div>
                    <span className="pill pill-blue" style={{ fontSize: 11 }}>{m.dur}</span>
                  </div>
                  <div className="tiny dim">{m.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card glow pad>
          <SectionHead title="AI Coaching Notes" />
          <div className="ai-insight mb-2">
            <SparkIcon />
            <span>
              Your balance (81) and knee drive are the priority. Add the Tuesday arm drive circuit <b>before</b> every sprint session this month.
            </span>
          </div>
          <div className="ai-insight">
            <CalendarCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
            <span>
              Saturday time trial is critical — apply the speed endurance and stride-length corrections in race conditions.
            </span>
          </div>
          <div className="mt-3">
            <div className="flex gap-2">
              <Trophy size={18} color="#fbbf24" />
              <span className="tiny muted">
                Goal this week: push {meta.label} overall score past 90 by improving Consistency to 85.
              </span>
            </div>
          </div>
          <Link to="/player/upload" className="btn btn-primary btn-block mt-3">
            Log Practice Video After Training
          </Link>
        </Card>
      </div>
    </Layout>
  )
}

function SparkIcon() {
  return <SparkSVG />
}
function SparkSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.94 14.34 3 21l-1-1 6.66-6.94" />
      <path d="M9.94 14.34 12 12" />
      <path d="m5.53 10.4 1.3-1.3.9.9 2.5-2.5a3.5 3.5 0 0 0 5.03 4.88l-1.1 1.1.9.9-1.3 1.3" />
      <path d="M14 4c.5 2 .5 2 2 3s3 .5 4 1c-1.5.5-2.5 1.5-3 3-.5-1.5-1-2-2-2s-1.5-.5-2-2c.5-1.5 1-2 2-3" />
    </svg>
  )
}

import { useState } from 'react'
import { Play, Clock, BarChart3, Cpu, CheckCircle2 } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { LEARNING_VIDEOS, SPORT_META } from '../../data/mock'

const DIFF_PILL: Record<string, string> = {
  Beginner: 'pill-green',
  Intermediate: 'pill-amber',
  Advanced: 'pill-red',
}

export default function LearningHub() {
  const { sport } = useAthlete()
  const meta = SPORT_META[sport]
  const [filter, setFilter] = useState('All')
  const videos = LEARNING_VIDEOS.filter((v) => v.sport === sport)
  const skills = ['All', ...Array.from(new Set(videos.map((v) => v.skill)))]
  const shown = filter === 'All' ? videos : videos.filter((v) => v.skill === filter)

  return (
    <Layout nav={PLAYER_NAV} title="My Learning Hub" crumb="Learning Hub" portal="player" notifCount={2}>
      <SectionHead
        title="Learn From The Best"
        sub={`AI-curated ${meta.label} training videos based on my weaknesses (Low Knee Drive · Arm Swing Imbalance)`}
        action={
          <div className="flex gap-2">
            <Pill color="pill-blue">{meta.icon} {meta.label} only</Pill>
            <span className="pill pill-green"><CheckCircle2 size={12} /> Matched to your report</span>
          </div>
        }
      />

      <div className="ai-insight mb-4">
        <Cpu />
        <span>
          <b>AI detected: Low Knee Drive & Arm Swing Imbalance.</b> The videos below were selected only from {meta.label} content to directly address these areas. Unrelated sports are never recommended.
        </span>
      </div>

      <div className="tabs mb-3">
        {skills.map((s) => (
          <button key={s} className={filter === s ? 'tab active' : 'tab'} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {shown.map((v, i) => (
          <Card key={v.id} hover className="video-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="video-thumb" style={{ background: v.gradient }}>
              <span>{v.emoji}</span>
              <span className="video-dur"><Clock size={11} style={{ verticalAlign: '-1px' }} /> {v.duration}</span>
              <div style={{ position: 'absolute', width: 46, height: 46, borderRadius: 99, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }}>
                <Play size={20} fill="#fff" color="#fff" />
              </div>
            </div>
            <div className="video-info">
              <div className="flex between gap-1">
                <span className={`pill ${DIFF_PILL[v.difficulty]}`} style={{ fontSize: 11 }}>{v.difficulty}</span>
                <span className="pill pill-cyan" style={{ fontSize: 11 }}>by {v.coach}</span>
              </div>
              <div className="video-title">{v.title}</div>
              <div className="flex gap-2">
                <span className="pill" style={{ fontSize: 11 }}>{v.skill}</span>
              </div>
              <div className="video-why">
                <b style={{ color: 'var(--text)' }}>Why recommended:</b> {v.why}
              </div>
              <button className="btn btn-primary btn-sm btn-block">
                <Play size={15} /> Watch Video
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><BarChart3 /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Learning progress this week</div>
              <div className="tiny dim">3 of 5 recommended videos completed</div>
            </div>
          </div>
          <div className="bar" style={{ width: 220 }}>
            <div className="bar-fill" style={{ width: '60%' }} />
          </div>
          <span className="pill pill-green">60% complete</span>
        </div>
      </Card>
    </Layout>
  )
}

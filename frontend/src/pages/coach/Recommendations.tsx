import { Link } from 'react-router-dom'
import { Cpu, ArrowRight, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar } from '../../components/ui'
import { PLAYERS } from '../../data/mock'

export default function Recommendations() {
  const matches = [...PLAYERS].sort((a, b) => b.match - a.match).filter((p) => p.match >= 90)

  return (
    <Layout nav={COACH_NAV} title="AI Player Recommendations" crumb="AI Recommendations" portal="coach" notifCount={3}>
      <SectionHead
        title="AI Recommended Athletes"
        sub="Based on your requirement: Running / Sprinting · Age 16–18 · Speed > 85 · Balance > 80"
        action={
          <div className="flex gap-2 wrap">
            <Pill color="pill-blue">🏃 Running / Sprinting</Pill>
            <Pill>Age 16–18</Pill>
            <Pill>Speed &gt; 85</Pill>
            <Pill>Balance &gt; 80</Pill>
          </div>
        }
      />

      <div className="ai-insight mb-4">
        <Cpu />
        <span>
          <b>AI matched 3 athletes</b> against your criteria. Each score reflects overall fit for a fast, technical winger profile. Performance trends shown from last 4 months.
        </span>
      </div>

      <div className="grid grid-3">
        {matches.map((p, i) => (
          <Card key={p.id} hover glow pad style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex between gap-2">
              <div className="flex" style={{ gap: 12 }}>
                <Avatar name={p.name} index={p.id} size={48} />
                <div>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="tiny dim">{p.position} · {p.age} yrs · {p.location}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="match-badge text-grad">{p.match}%</div>
                <div className="tiny dim">match</div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 wrap">
              <span className="pill pill-blue">AI Score {p.aiScore}</span>
              <span className="pill pill-cyan">Speed {p.speed}</span>
              <span className="pill pill-green">Balance {p.balance}</span>
              <span className="pill pill-purple">Tech {p.technique}</span>
            </div>

            <div className="mt-3" style={{ height: 90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.trend.map((v, idx) => ({ m: ['J','F','M','A'][idx], v }))}>
                  <XAxis dataKey="m" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip contentStyle={{ background: '#0e1526', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                  <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-1 mt-2 wrap">
              {p.skills.slice(0, 3).map((s) => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <Link to={`/coach/player/${p.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                View Profile <ArrowRight size={13} />
              </Link>
              <button className="btn btn-outline btn-sm"><Star size={14} /></button>
            </div>
          </Card>
        ))}
      </div>

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><Cpu /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Want more precision?</div>
              <div className="tiny dim">Add filters like agility score, goal contribution or club background</div>
            </div>
          </div>
          <Link to="/coach/search" className="btn btn-outline btn-sm">Open Talent Search</Link>
        </div>
      </Card>
    </Layout>
  )
}

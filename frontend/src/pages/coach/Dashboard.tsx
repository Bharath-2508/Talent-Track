import { Link } from 'react-router-dom'
import { Cpu, ArrowRight, Star, Eye } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { COACH, PLAYERS, SPORT_META, COACH_NOTIFICATIONS } from '../../data/mock'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function CoachDashboard() {
  const unread = COACH_NOTIFICATIONS.filter((n) => !n.read).length
  const topPlayers = [...PLAYERS].sort((a, b) => b.aiScore - a.aiScore).slice(0, 4)

  return (
    <Layout nav={COACH_NAV} title="Coach Dashboard" crumb="Dashboard" portal="coach" notifCount={unread}>
      <Card glow className="welcome-banner mb-4" style={{ gridColumn: '1 / -1' }}>
        <div className="flex between wrap gap-3">
          <div>
            <h2 className="sec-title">Welcome back, {COACH.name.split(' ')[1]} 👋</h2>
            <p className="sec-sub">Here&apos;s your recruitment overview for this week · {COACH.academy}</p>
            <div className="flex gap-2 mt-3 wrap">
              <Pill color="pill-blue">🛡️ {COACH.role}</Pill>
              <Pill color="pill-green">12 players selected this season</Pill>
            </div>
          </div>
          <Link to="/coach/trials" className="btn btn-primary">
            Create New Trial <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      <div className="grid grid-5 mb-4">
        {COACH.stats.map((s) => (
          <Card key={s.label} hover pad className="stat">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-2">
        <Card glow pad>
          <SectionHead
            title="AI Recommended Players"
            sub="Top matches for your open running & sprinting trials"
            action={<Link to="/coach/recommendations" className="link small">View all</Link>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topPlayers.map((p, i) => {
              const m = SPORT_META[p.sport]
              return (
                <Link key={p.id} to={`/coach/player/${p.id}`} className="card card-hover card-pad" style={{ display: 'flex', gap: 14, alignItems: 'center', animationDelay: `${i * 0.05}s` }}>
                  <Avatar name={p.name} index={p.id} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex between wrap gap-1">
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <span className="match-badge text-grad">{p.match}% match</span>
                    </div>
                    <div className="tiny dim">{m.icon} {m.label} · {p.position} · {p.age} yrs</div>
                    <div className="flex gap-1 mt-1 wrap">
                      <ScoreChip value={p.aiScore} />
                      <span className="pill pill-green" style={{ fontSize: 11 }}>▲ {p.improvement}%</span>
                    </div>
                  </div>
                  <Eye size={17} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <SectionHead title="Recruitment Overview" sub="Players per sport this month" />
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Running / Sprinting', players: 64 }]}>
                  <defs>
                    <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d8bff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0e1526', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
                  <Bar dataKey="players" fill="url(#cb)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card pad>
            <SectionHead title="Recent Activity" action={<Link to="/coach/notifications" className="link small">All</Link>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COACH_NOTIFICATIONS.slice(0, 3).map((n) => (
                <div key={n.id} className={n.read ? 'notif' : 'notif unread'}>
                  <div className="notif-icon">{n.icon}</div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.desc}</div>
                  </div>
                  <div className="tiny dim" style={{ flexShrink: 0 }}>{n.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><Cpu /></div>
            <div>
              <div style={{ fontWeight: 700 }}>AI scout brief</div>
              <div className="tiny dim">3 high-potential sprinters matched your speed &gt; 84, balance &gt; 80 criteria</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/coach/recommendations" className="btn btn-outline btn-sm"><Star size={14} /> View recommendations</Link>
            <Link to="/coach/applications" className="btn btn-primary btn-sm">Applications <ArrowRight size={14} /></Link>
          </div>
        </div>
      </Card>
    </Layout>
  )
}

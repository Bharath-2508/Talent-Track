import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, ArrowRight, Star, Eye, Users, TrendingUp, Award, Calendar } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../../lib/api'

interface Analytics {
  players_tracked: number
  shortlisted: number
  invitations_sent: number
  trials_hosted: number
  success_rate: number
  funnel: { stage: string; value: number }[]
  sport_wise: { name: string; value: number }[]
}

interface Athlete {
  id: number
  name: string
  ai_score?: number
  location?: string
  gender?: string
  position?: string
}

interface Notification {
  id: number
  icon: string
  title: string
  desc: string
  time: string
  read: boolean
}

export default function CoachDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [topPlayers, setTopPlayers] = useState<Athlete[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [coachName, setCoachName] = useState('Coach')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tt_user')
    if (stored) {
      try { setCoachName(JSON.parse(stored).full_name?.split(' ')[0] || 'Coach') } catch {}
    }

    Promise.allSettled([
      api.get<Analytics>('/coach/analytics'),
      api.get<Athlete[]>('/coach/athletes'),
      api.get<Notification[]>('/coach/notifications'),
    ]).then(([aRes, pRes, nRes]) => {
      if (aRes.status === 'fulfilled') setAnalytics(aRes.value)
      if (pRes.status === 'fulfilled') {
        setTopPlayers([...pRes.value]
          .filter(p => p.ai_score != null)
          .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
          .slice(0, 4))
      }
      if (nRes.status === 'fulfilled') setNotifications(nRes.value.slice(0, 3))
      setLoading(false)
    })
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const statCards = analytics ? [
    { icon: <Users size={20} />, label: 'Total Athletes', value: analytics.players_tracked },
    { icon: <Star size={20} />, label: 'Shortlisted', value: analytics.shortlisted },
    { icon: '📨', label: 'Invitations Sent', value: analytics.invitations_sent },
    { icon: <Calendar size={20} />, label: 'Trials Hosted', value: analytics.trials_hosted },
    { icon: <TrendingUp size={20} />, label: 'Success Rate', value: `${analytics.success_rate}%` },
  ] : []

  return (
    <Layout nav={COACH_NAV} title="Coach Dashboard" crumb="Dashboard" portal="coach" notifCount={unread}>
      <Card glow className="welcome-banner mb-4" style={{ gridColumn: '1 / -1' }}>
        <div className="flex between wrap gap-3">
          <div>
            <h2 className="sec-title">Welcome back, {coachName} 👋</h2>
            <p className="sec-sub">Here's your recruitment overview · Running / Sprinting talent platform</p>
            <div className="flex gap-2 mt-3 wrap">
              <Pill color="pill-blue">🛡️ Coach</Pill>
              {analytics && <Pill color="pill-green">{analytics.players_tracked} athletes tracked</Pill>}
            </div>
          </div>
          <Link to="/coach/trials" className="btn btn-primary">
            Create New Trial <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {!loading && (
        <div className="grid grid-5 mb-4">
          {statCards.map((s) => (
            <Card key={String(s.label)} hover pad className="stat">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-2">
        <Card glow pad>
          <SectionHead
            title="Top AI-Scored Athletes"
            sub="Highest performing running athletes on platform"
            action={<Link to="/coach/recommendations" className="link small">View all</Link>}
          />
          {topPlayers.length === 0 ? (
            <div className="empty">
              <div className="empty-ic"><Award /></div>
              <h3>No athletes with analysis yet</h3>
              <p>Athletes will appear here after uploading and analyzing their running videos.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topPlayers.map((p, i) => (
                <Link key={p.id} to={`/coach/player/${p.id}`} className="card card-hover card-pad" style={{ display: 'flex', gap: 14, alignItems: 'center', animationDelay: `${i * 0.05}s` }}>
                  <Avatar name={p.name} index={p.id} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex between wrap gap-1">
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    </div>
                    <div className="tiny dim">🏃 Running · {p.position || 'Sprinter'} · {p.location || '—'}</div>
                    <div className="flex gap-1 mt-1 wrap">
                      {p.ai_score != null && <ScoreChip value={p.ai_score} />}
                    </div>
                  </div>
                  <Eye size={17} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <SectionHead title="Recruitment Funnel" sub="From viewed to invited" />
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.funnel || []}>
                  <defs>
                    <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d8bff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)', color: '#0f172a' }} />
                  <Bar dataKey="value" fill="url(#cb)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card pad>
            <SectionHead title="Recent Notifications" action={<Link to="/coach/notifications" className="link small">All</Link>} />
            {notifications.length === 0 ? (
              <div className="empty" style={{ padding: '20px 0' }}>
                <div className="empty-ic">🔔</div>
                <h3>No notifications yet</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.map((n) => (
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
            )}
          </Card>
        </div>
      </div>

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><Cpu /></div>
            <div>
              <div style={{ fontWeight: 700 }}>AI Talent Scout</div>
              <div className="tiny dim">Find high-potential sprinters using AI score filters</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/coach/recommendations" className="btn btn-outline btn-sm"><Star size={14} /> Recommendations</Link>
            <Link to="/coach/applications" className="btn btn-primary btn-sm">Applications <ArrowRight size={14} /></Link>
          </div>
        </div>
      </Card>
    </Layout>
  )
}

import { useParams, Link } from 'react-router-dom'
import { Star, Send, MessageCircle, ArrowLeft, Download, Play, TrendingUp, Check, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip, Ring, Progress } from '../../components/ui'
import { PLAYERS, SPORT_META, SPORT_METRICS, BADGES, ATHLETE, STRENGTHS, WEAKNESSES } from '../../data/mock'

export default function PlayerProfile() {
  const { id } = useParams()
  const p = PLAYERS.find((x) => x.id === Number(id)) || PLAYERS[0]

  if (!p) {
    return (
      <Layout nav={COACH_NAV} title="Player Profile" crumb="Find Players" portal="coach" notifCount={3}>
        <Link to="/coach/search" className="btn btn-ghost btn-sm mb-3"><ArrowLeft size={15} /> Back to search</Link>
        <div style={{ padding: 40, textAlign: 'center' }}>Player not found or data is empty.</div>
      </Layout>
    )
  }

  const meta = SPORT_META[p.sport]
  const metrics = SPORT_METRICS[p.sport]

  return (
    <Layout nav={COACH_NAV} title="Player Profile" crumb={`Find Players / ${p.name}`} portal="coach" notifCount={3}>
      <Link to="/coach/search" className="btn btn-ghost btn-sm mb-3"><ArrowLeft size={15} /> Back to search</Link>

      <Card glow pad className="mb-4">
        <div className="flex between wrap gap-4">
          <div className="flex" style={{ gap: 20 }}>
            <Avatar name={p.name} size={84} index={p.id} />
            <div>
              <div className="flex gap-2 wrap">
                <h2 className="sec-title" style={{ fontSize: 24 }}>{p.name}</h2>
                <span className="match-badge text-grad">{p.match}% match</span>
              </div>
              <div className="flex gap-2 mt-1 wrap">
                <Pill color="pill-blue">{meta.icon} {meta.label}</Pill>
                <Pill>{p.position}</Pill>
                <Pill>{p.age} yrs · {p.gender}</Pill>
                <Pill>📍 {p.location}</Pill>
                <Pill>{p.experience} Level</Pill>
              </div>
              <div className="flex gap-2 mt-3 wrap">
                <ScoreChip value={p.aiScore} />
                <span className="pill pill-green">▲ {p.improvement}% this quarter</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary"><Star size={15} /> Shortlist</button>
            <button className="btn btn-outline"><Send size={15} /> Invite to Trial</button>
            <button className="btn btn-ghost"><MessageCircle size={15} /> Contact</button>
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card pad>
          <SectionHead title="AI Performance Report" action={<Link to="/coach/recommendations" className="link small">Compare</Link>} />
          <div className="flex" style={{ gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <Ring value={p.aiScore} size={120} stroke={11} label={`${p.aiScore}`} sub="Overall" />
            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ l: 'Speed', v: p.speed }, { l: 'Balance', v: p.balance }, { l: 'Technique', v: p.technique }].map((m) => (
                <div key={m.l}>
                  <div className="flex between mb-1">
                    <span className="tiny" style={{ fontWeight: 600 }}>{m.l}</span>
                    <span className="tiny dim">{m.v}</span>
                  </div>
                  <Progress value={m.v} h={7} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-2 mt-3" style={{ gap: 10 }}>
            {metrics.map((m) => (
              <div key={m.label} className="metric">
                <div className="metric-top">
                  <span className="metric-name">{m.label}</span>
                  <span className="metric-val" style={{ fontSize: 15 }}>{m.value}</span>
                </div>
                <Progress value={m.value} h={6} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <SectionHead title="Strengths & Weaknesses" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STRENGTHS.map((s) => (
                <div key={s} className="strength-item">
                  <div className="check-icon"><Check /></div>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{s}</span>
                </div>
              ))}
              {WEAKNESSES.map((w) => (
                <div key={w.name} className="weak-item">
                  <div className="warn-icon"><AlertTriangle /></div>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{w.name}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card pad>
            <SectionHead title="Performance Trend" sub="Last 4 months" />
            <div className="chart-h" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.trend.map((v, i) => ({ m: ['Jan', 'Feb', 'Mar', 'Apr'][i], v }))}>
                  <XAxis dataKey="m" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)', color: '#0f172a' }} />
                  <Line type="monotone" dataKey="v" stroke="#3d8bff" strokeWidth={3} dot={{ r: 4, fill: '#3d8bff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card pad>
            <SectionHead title="Videos" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ t: 'Match Analysis – Apr 2026', c: 'linear-gradient(135deg,#6d28d9,#3d8bff)' }, { t: 'Skill Session – Mar 2026', c: 'linear-gradient(135deg,#0e7490,#22d3ee)' }].map((v) => (
                <div key={v.t} className="flex" style={{ gap: 12 }}>
                  <div style={{ width: 80, height: 52, borderRadius: 10, background: v.c, display: 'grid', placeItems: 'center' }}>
                    <Play size={18} fill="#fff" color="#fff" />
                  </div>
                  <div style={{ alignSelf: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.t}</div>
                    <div className="tiny dim">AI analyzed · {p.aiScore} avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card pad>
          <SectionHead title="Growth Timeline" action={<TrendingUp size={15} color="#34d399" />} />
          {p.trend.map((v, i) => (
            <div key={i} className="flex between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="tiny" style={{ fontWeight: 600 }}>{['Jan', 'Feb', 'Mar', 'Apr'][i]}</span>
              <div className="bar" style={{ width: 140 }}><div className="bar-fill" style={{ width: `${v}%`, animationDelay: `${i * 0.1}s` }} /></div>
              <span className="tiny" style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <SectionHead title="Skill Badges" />
            <div className="flex gap-2 wrap">
              {BADGES.filter((b) => b.earned).map((b) => (
                <div key={b.name} className="flex" style={{ gap: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--panel)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{b.name}</div>
                    <div className="tiny dim">{b.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card pad>
            <SectionHead title="Achievements & Resume" />
            <div className="flex gap-2 wrap">
              <Pill color="pill-amber">🏆 Player of the Match · Mar 2026</Pill>
              <Pill>🎓 {meta.label} Analytics Certificate</Pill>
            </div>
            <button className="btn btn-outline btn-sm btn-block mt-3"><Download size={14} /> Download AI Resume</button>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

import { Link } from 'react-router-dom'
import { Share2, Download, MapPin, Target, FileText, Film, TrendingUp, Award, Upload } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill, Ring, Avatar } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { SPORT_META } from '../../data/mock'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Portfolio() {
  const { sport, athlete, stats, videos } = useAthlete()
  const meta = SPORT_META[sport]
  const hasAssessment = stats.overall > 0
  const earnedBadges = stats.badges.filter((b) => b.earned)

  return (
    <Layout nav={PLAYER_NAV} title="My Portfolio" crumb="My Portfolio" portal="player" notifCount={0}>
      <div className="grid grid-3">
        <Card glow pad style={{ gridColumn: '1 / -1' }}>
          <div className="flex between wrap gap-4">
            <div className="flex" style={{ gap: 20 }}>
              <Avatar name={athlete.name || 'A'} size={92} index={1} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>MY ATHLETE PORTFOLIO</div>
                <h2 className="sec-title" style={{ fontSize: 26 }}>{athlete.name || 'Registered Athlete'}</h2>
                <div className="flex gap-2 mt-1 wrap">
                  <Pill color="pill-blue">{meta.icon} {meta.label}</Pill>
                  {athlete.position && <Pill>{athlete.position}</Pill>}
                  {athlete.location && <Pill><MapPin size={11} /> {athlete.location}</Pill>}
                  {athlete.experience && <Pill>{athlete.experience} Level</Pill>}
                </div>
              </div>
            </div>
            <div className="flex" style={{ gap: 18, alignItems: 'center' }}>
              <Ring value={athlete.overallScore} size={110} stroke={10} label={`${stats.overall}`} sub="AI Score" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary"><Share2 size={15} /> Share Portfolio</button>
                <button className="btn btn-outline"><Download size={15} /> Download Portfolio</button>
              </div>
            </div>
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Performance" action={<Link to="/player/report" className="link small">Full report</Link>} />
          {stats.growth.length >= 2 ? (
            <>
              <div className="chart-h" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.growth}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[60, 100]} />
                    <Tooltip contentStyle={{ background: '#0e1526', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 mt-2 wrap">
                <Pill color="pill-green">▲ {stats.growth.length} reports tracked</Pill>
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: '40px 16px' }}>
              <div className="empty-ic">📈</div>
              <h3>No performance data yet</h3>
              <p>Assessment history will appear here after your first AI report.</p>
            </div>
          )}
        </Card>

        <Card pad>
          <SectionHead title="Achievements & Badges" action={<Link to="/player/achievements" className="link small">View all</Link>} />
          {earnedBadges.length ? (
            <div className="grid grid-2" style={{ gap: 10 }}>
              {earnedBadges.map((b) => (
                <div key={b.name} className="flex" style={{ gap: 10, padding: 10, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 24 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{b.name}</div>
                    <div className="tiny dim">{b.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '40px 16px' }}>
              <div className="empty-ic"><Award /></div>
              <h3>No badges yet</h3>
              <p>Badges unlock automatically from your AI assessments.</p>
            </div>
          )}
          <div className="mt-2">
            <Pill color="pill-amber"><Target size={12} /> {videos.length} video{videos.length === 1 ? '' : 's'} uploaded</Pill>
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Videos" action={<Link to="/player/upload" className="link small">Upload</Link>} />
          {videos.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {videos.slice(0, 5).map((v) => (
                <div key={v.id} className="flex" style={{ gap: 12 }}>
                  <div style={{ width: 70, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#6d28d9,#3d8bff)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
                    🎬
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                    <div className="tiny dim">{v.date} · {v.size} · {v.status === 'Analyzed' ? 'Analyzed' : 'Pending analysis'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '40px 16px' }}>
              <div className="empty-ic">🎥</div>
              <h3>No running videos uploaded yet</h3>
              <p>Upload your session to start receiving AI analysis.</p>
              <Link to="/player/upload" className="btn btn-primary btn-sm"><Upload size={14} /> Upload Video</Link>
            </div>
          )}
        </Card>

        <Card pad>
          <SectionHead title="Key Strengths" action={<TrendingUp size={16} color="#34d399" />} />
          {stats.strengths.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.strengths.map((s) => (
                <span key={s} className="skill-chip" style={{ fontSize: 13 }}>{s}</span>
              ))}
            </div>
          ) : (
            <div className="tiny dim">Key strengths are generated from your AI assessment.</div>
          )}
          <div className="mt-3">
            {hasAssessment ? (
              <>
                <Pill color="pill-blue">AI Score: {stats.overall}/100</Pill>
              </>
            ) : (
              <Pill>No assessment yet</Pill>
            )}
          </div>
        </Card>

        <Card pad style={{ gridColumn: '1 / -1' }}>
          <SectionHead title="Coach Feedback" action={<FileText size={16} color="#3d8bff" />} />
          <div className="empty" style={{ padding: '40px 16px' }}>
            <div className="empty-ic">💬</div>
            <h3>No coach feedback yet</h3>
            <p>Feedback from coaches and scouts you are matched with will appear here.</p>
          </div>
          <div className="flex gap-2 mt-3 wrap">
            <Link to="/player/report" className="btn btn-primary btn-sm"><FileText size={14} /> AI Reports</Link>
            <Link to="/player/timeline" className="btn btn-outline btn-sm"><TrendingUp size={14} /> Progress</Link>
            <button className="btn btn-outline btn-sm"><Film size={14} /> Certificates</button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
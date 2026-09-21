import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Users, UserX, Star } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { api } from '../../lib/api'

interface Athlete {
  id: number
  user_id: number
  name: string
  sport: string
  age?: number
  gender?: string
  location?: string
  experience?: string
  position?: string
  ai_score?: number
  shortlisted?: boolean
}

export default function AllPlayers() {
  const [players, setPlayers] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Athlete[]>('/coach/athletes')
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleShortlist = async (athlete: Athlete) => {
    try {
      if (athlete.shortlisted) {
        await api.delete(`/coach/shortlist/${athlete.id}`)
      } else {
        await api.post(`/coach/shortlist/${athlete.id}`)
      }
      setPlayers(prev => prev.map(p => p.id === athlete.id ? { ...p, shortlisted: !p.shortlisted } : p))
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <Layout nav={COACH_NAV} title="All Players" crumb="All Players" portal="coach" notifCount={0}>
      <SectionHead
        title="All Registered Athletes"
        sub={`${players.length} running athletes · view profiles and AI scores`}
        action={<Pill color="pill-blue"><Users size={12} /> {players.length} athletes</Pill>}
      />

      {loading ? (
        <div className="empty"><div className="empty-ic">⏳</div><h3>Loading athletes…</h3></div>
      ) : players.length === 0 ? (
        <Card pad style={{ textAlign: 'center', padding: '50px 20px' }}>
          <UserX size={48} style={{ margin: '0 auto 16px', color: 'var(--text-dim)' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No Athletes Registered Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px' }}>
            Athletes will appear here once they register and complete an analysis.
          </p>
          <Link to="/player/register" className="btn btn-primary btn-sm">Register as Athlete</Link>
        </Card>
      ) : (
        <div className="grid grid-4">
          {players.map((p, i) => (
            <Card key={p.id} hover pad className="athlete-card" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="ath-top">
                <Avatar name={p.name} index={p.id} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ath-name">{p.name}</div>
                  <div className="ath-meta">🏃 {p.sport}</div>
                </div>
                {p.ai_score != null && <ScoreChip value={p.ai_score} />}
              </div>
              <div className="flex gap-1 wrap">
                <span className="pill">{p.position || 'Sprinter'}</span>
                <span className="pill">{p.experience || '—'}</span>
                {p.location && <span className="pill">📍 {p.location}</span>}
              </div>
              <div className="flex gap-1 wrap">
                {p.gender && <span className="pill pill-blue">{p.gender}</span>}
                {p.ai_score != null
                  ? <span className="pill pill-green">AI Score: {p.ai_score}</span>
                  : <span className="pill">No analysis yet</span>
                }
              </div>
              <div className="ath-foot">
                <button
                  className={`btn btn-sm ${p.shortlisted ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleShortlist(p)}
                  style={{ flex: 1 }}
                >
                  <Star size={13} /> {p.shortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
                <Link to={`/coach/player/${p.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  View <FileText size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><ArrowRight /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Looking for something specific?</div>
              <div className="tiny dim">Use filters for age, gender, location and AI score</div>
            </div>
          </div>
          <Link to="/coach/search" className="btn btn-primary btn-sm">Advanced Search</Link>
        </div>
      </Card>
    </Layout>
  )
}

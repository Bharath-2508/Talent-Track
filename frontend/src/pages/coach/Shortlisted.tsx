import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Eye, Send, UserPlus } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Avatar, ScoreChip } from '../../components/ui'
import { api } from '../../lib/api'

interface Athlete {
  id: number
  name: string
  sport: string
  position?: string
  ai_score?: number
  location?: string
  gender?: string
}

export default function Shortlisted() {
  const [list, setList] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Athlete[]>('/coach/shortlisted')
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id: number) => {
    try {
      await api.delete(`/coach/shortlist/${id}`)
      setList(prev => prev.filter(p => p.id !== id))
    } catch (e: any) { alert(e.message) }
  }

  const invite = async (id: number) => {
    try {
      await api.post(`/coach/invite/${id}`, { message: 'You have been invited to a running trial!' })
      alert('Invitation sent!')
    } catch (e: any) { alert(e.message) }
  }

  return (
    <Layout nav={COACH_NAV} title="Shortlisted Players" crumb="Shortlisted Players" portal="coach" notifCount={0}>
      <SectionHead
        title="Shortlisted Athletes"
        sub={`${list.length} athletes in your shortlist`}
        action={<button className="btn btn-outline btn-sm"><Send size={14} /> Invite all to trial</button>}
      />

      {loading ? (
        <div className="empty"><div className="empty-ic">⏳</div><h3>Loading…</h3></div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="empty-ic"><UserPlus /></div>
          <h3>No athletes shortlisted yet</h3>
          <p>Browse athletes and click "Shortlist" to add them here.</p>
          <Link to="/coach/players" className="btn btn-primary btn-sm">Browse Athletes</Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {list.map((p) => (
            <Card key={p.id} hover pad>
              <div className="flex between gap-2">
                <div className="flex" style={{ gap: 13 }}>
                  <Avatar name={p.name} index={p.id} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div className="tiny dim">🏃 Running · {p.position || 'Sprinter'} · {p.location || '—'}</div>
                  </div>
                </div>
                {p.ai_score != null && <ScoreChip value={p.ai_score} />}
              </div>
              <div className="flex gap-2 mt-3">
                <Link to={`/coach/player/${p.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}><Eye size={13} /> View</Link>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => invite(p.id)}><Send size={13} /> Invite</button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(p.id)}><Star size={13} color="#fbbf24" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><UserPlus /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Shortlist tip</div>
              <div className="tiny dim">Athletes with high AI scores are more likely to accept trial invitations</div>
            </div>
          </div>
          <Link to="/coach/recommendations" className="btn btn-outline btn-sm">Discover more AI matches</Link>
        </div>
      </Card>
    </Layout>
  )
}

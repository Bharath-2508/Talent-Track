import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Users, UserX } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { SPORT_META, Sport } from '../../data/mock'

interface RegisteredUser {
  ID: string
  Role: string
  'Full Name': string
  Email: string
  'Primary Sport': string
  Gender: string
  'Date of Birth': string
  Location: string
  'Experience Level': string
  'Playing Position': string
  'Created At': string
}

export default function AllPlayers() {
  const [players, setPlayers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          // Filter users who are registered as PLAYER
          const playerList = data.users.filter(
            (u: RegisteredUser) => u.Role?.toUpperCase() === 'PLAYER'
          )
          setPlayers(playerList)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout nav={COACH_NAV} title="All Players" crumb="All Players" portal="coach" notifCount={3}>
      <SectionHead
        title="All Registered Players"
        sub={`${players.length} registered athletes in Excel database · open any player's report`}
        action={<Pill color="pill-blue"><Users size={12} /> {players.length} players</Pill>}
      />

      {loading ? (
        <Card pad style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }}>
          Loading registered athletes...
        </Card>
      ) : players.length === 0 ? (
        <Card pad style={{ textAlign: 'center', padding: '50px 20px' }}>
          <UserX size={48} style={{ margin: '0 auto 16px', color: 'var(--text-dim)' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No Players Registered Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px' }}>
            New player registrations will automatically be saved to Excel and appear here.
          </p>
          <Link to="/player/register" className="btn btn-primary btn-sm">
            Register New Player
          </Link>
        </Card>
      ) : (
        <div className="grid grid-4">
          {players.map((p, i) => {
            const rawSport = (p['Primary Sport'] || 'Running / Sprinting').toLowerCase() as Sport
            const m = SPORT_META[rawSport] || SPORT_META['running']
            const idNum = parseInt(p.ID, 10) || i + 1

            return (
              <Card key={p.ID} hover pad className="athlete-card" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="ath-top">
                  <Avatar name={p['Full Name']} index={idNum} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ath-name">{p['Full Name']}</div>
                    <div className="ath-meta">{m.icon} {p['Primary Sport']}</div>
                  </div>
                  <ScoreChip value={85} />
                </div>
                <div className="flex gap-1 wrap">
                  <span className="pill">{p['Playing Position'] || 'Player'}</span>
                  <span className="pill">{p['Experience Level'] || 'Intermediate'}</span>
                  <span className="pill">📍 {p['Location'] || 'N/A'}</span>
                </div>
                <div className="flex gap-1 wrap">
                  <span className="pill pill-blue">{p.Gender || 'Male'}</span>
                  <span className="pill pill-green">Role: {p.Role}</span>
                </div>
                <div className="ath-foot">
                  <span className="trend-up">Registered in Excel</span>
                </div>
                <Link to={`/coach/player/${p.ID}`} className="btn btn-primary btn-sm btn-block">
                  View Profile <FileText size={13} />
                </Link>
              </Card>
            )
          })}
        </div>
      )}

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><ArrowRight /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Looking for something specific?</div>
              <div className="tiny dim">Use filters for sport, age, location and AI metrics</div>
            </div>
          </div>
          <Link to="/coach/search" className="btn btn-primary btn-sm">Search Players</Link>
        </div>
      </Card>
    </Layout>
  )
}

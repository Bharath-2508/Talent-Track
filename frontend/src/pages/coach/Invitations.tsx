import { useState } from 'react'
import { Send, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar } from '../../components/ui'
import { PLAYERS, SPORT_META } from '../../data/mock'

type Invite = {
  id: number
  name: string
  sport: string
  trial: string
  status: 'Pending' | 'Accepted' | 'Declined'
  date: string
}

const SENT: Invite[] = [
  { id: 5, name: 'Daniel Fernandes', sport: 'Running', trial: 'State Sprint Camp Trials', status: 'Accepted', date: 'Aug 12, 2026' },
  { id: 2, name: 'Vikram Reddy', sport: 'Running', trial: 'AFI District Talent Trials', status: 'Pending', date: 'Aug 13, 2026' },
  { id: 9, name: 'Meera Iyer', sport: 'Running', trial: 'Club Track & Field Selection', status: 'Declined', date: 'Aug 10, 2026' },
]

const STATUS: Record<string, { pill: string; icon: React.ReactNode }> = {
  Pending: { pill: 'pill-amber', icon: <Clock size={13} /> },
  Accepted: { pill: 'pill-green', icon: <CheckCircle2 size={13} /> },
  Declined: { pill: 'pill-red', icon: <XCircle size={13} /> },
}

export default function Invitations() {
  const [invited, setInvited] = useState<number[]>([])
  const candidates = PLAYERS.filter((p) => p.aiScore >= 85).slice(0, 6)

  return (
    <Layout nav={COACH_NAV} title="Invitations" crumb="Invitations" portal="coach" notifCount={3}>
      <SectionHead
        title="Invite Players"
        sub="Send trial invitations to athletes you want to recruit"
        action={<Pill color="pill-blue"><Send size={12} /> {SENT.length + invited.length} invitations sent</Pill>}
      />

      <Card glow pad className="mb-4">
        <SectionHead title="Step 1 · Invite high-rated athletes" sub="Players with 85+ AI score, ready to be scouted" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {candidates.map((p) => {
            const m = SPORT_META[p.sport]
            const done = invited.includes(p.id)
            return (
              <div key={p.id} className="flex between wrap gap-2" style={{ padding: 12, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--border)' }}>
                <div className="flex" style={{ gap: 12 }}>
                  <Avatar name={p.name} index={p.id} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div className="tiny dim">{m.icon} {m.label} · {p.position} · {p.age} yrs · AI {p.aiScore}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {done ? (
                    <span className="btn btn-sm" style={{ background: 'rgba(52,211,153,0.14)', color: 'var(--green)', borderColor: 'rgba(52,211,153,0.35)', pointerEvents: 'none' }}>
                      <CheckCircle2 size={14} /> Invitation sent
                    </span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setInvited([...invited, p.id])}>
                      <Send size={13} /> Invite for trial
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card pad>
        <SectionHead title="Invitations Sent" sub="Track responses from athletes" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...invited.map((id) => {
            const p = PLAYERS.find((x) => x.id === id)!
            return { id: p.id, name: p.name, sport: SPORT_META[p.sport].label, trial: 'District Trial', status: 'Pending' as const, date: 'Just now' }
          }), ...SENT].map((inv) => {
            const st = STATUS[inv.status]
            return (
              <div key={inv.id + inv.date} className="flex between wrap gap-2" style={{ padding: 13, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inv.name}</div>
                  <div className="tiny dim">{inv.sport} · {inv.trial} · sent {inv.date}</div>
                </div>
                <span className={`pill ${st.pill}`}>{st.icon} {inv.status}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </Layout>
  )
}

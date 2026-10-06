import { useEffect, useState, useCallback } from 'react'
import { Send, CheckCircle2, Clock, XCircle, UserCheck, MailOpen, Phone, Mail, User } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar } from '../../components/ui'
import { api } from '../../lib/api'

type InvitationResponse = {
  id: number
  athlete_name: string
  athlete_email: string
  athlete_phone: string
  response_type: string
  message: string
  created_at: string
}

type SentInvitation = {
  id: number
  athlete_name: string
  athlete_email: string
  athlete_id: number
  subject: string
  message: string
  status: string
  read_at: string | null
  trial_id: number | null
  date: string
  response: InvitationResponse | null
}

type AthleteItem = {
  id: number
  name: string
  sport: string
  position: string
  age: number | null
  ai_score: number | null
  location: string
}

const STATUS: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', pill: 'pill-amber', icon: <Clock size={13} /> },
  read: { label: 'Read by Athlete', pill: 'pill-blue', icon: <MailOpen size={13} /> },
  interested: { label: 'Interested', pill: 'pill-green', icon: <CheckCircle2 size={13} /> },
  accepted: { label: 'Interested', pill: 'pill-green', icon: <CheckCircle2 size={13} /> },
  declined: { label: 'Declined', pill: 'pill-red', icon: <XCircle size={13} /> },
}

export default function Invitations() {
  const [sentList, setSentList] = useState<SentInvitation[]>([])
  const [candidates, setCandidates] = useState<AthleteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [invitingId, setInvitingId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [invsRes, athletesRes] = await Promise.allSettled([
        api.get<SentInvitation[]>('/coach/invitations'),
        api.get<AthleteItem[]>('/coach/athletes'),
      ])

      if (invsRes.status === 'fulfilled' && invsRes.value) {
        setSentList(invsRes.value)
      } else {
        setSentList([])
      }

      if (athletesRes.status === 'fulfilled' && athletesRes.value) {
        setCandidates(athletesRes.value)
      } else {
        setCandidates([])
      }
    } catch (e) {
      console.error('Failed to load invitations:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSendInvite = async (athlete: AthleteItem) => {
    setInvitingId(athlete.id)
    try {
      await api.post(`/coach/invite/${athlete.id}`, {
        message: `Official Sprint & Track Trial Invitation sent to ${athlete.name}.`,
      })
      await loadData()
    } catch (e) {
      console.error('Invite error:', e)
    } finally {
      setInvitingId(null)
    }
  }

  const invitedAthleteIds = new Set(sentList.map((i) => i.athlete_id))

  return (
    <Layout nav={COACH_NAV} title="Invitations" crumb="Invitations" portal="coach" notifCount={sentList.length}>
      <SectionHead
        title="Invite Players"
        sub="Send trial invitations to registered athletes in the talent pool"
        action={
          <Pill color="pill-blue">
            <Send size={12} /> {sentList.length} invitations sent
          </Pill>
        }
      />

      {/* Step 1: Registered Athletes Candidate List */}
      <Card glow pad className="mb-4">
        <SectionHead
          title="Step 1 · Invite Registered Athletes"
          sub="Select top candidates from the active player database"
        />
        {loading ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">⏳</div>
            <h4>Loading active candidate list...</h4>
          </div>
        ) : candidates.length === 0 ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">🏃</div>
            <h4>No registered athletes found</h4>
            <p>Athletes who register on the portal will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {candidates.slice(0, 8).map((p) => {
              const isInvited = invitedAthleteIds.has(p.id)
              const isSending = invitingId === p.id
              return (
                <div
                  key={p.id}
                  className="flex between wrap gap-2"
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex" style={{ gap: 12 }}>
                    <Avatar name={p.name} index={p.id} size={44} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div className="tiny dim">
                        🏃 {p.position || 'Sprinter'} · {p.location || 'State Center'} · {p.age || 18} yrs · AI Score: {p.ai_score ?? 60}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isInvited ? (
                      <span
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(52,211,153,0.14)',
                          color: 'var(--green)',
                          borderColor: 'rgba(52,211,153,0.35)',
                          pointerEvents: 'none',
                        }}
                      >
                        <UserCheck size={14} /> Invitation Sent
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendInvite(p)}
                        disabled={isSending}
                      >
                        <Send size={13} /> {isSending ? 'Sending...' : 'Invite for Trial'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Step 2: Real Sent Invitations History */}
      <Card pad>
        <SectionHead title="Invitations Sent" sub="Track responses from invited athletes in real time" />
        {loading ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">⏳</div>
            <h4>Loading sent invitations...</h4>
          </div>
        ) : sentList.length === 0 ? (
          <div className="empty" style={{ minHeight: 140 }}>
            <div className="empty-ic">📨</div>
            <h3>No trial invitations sent yet</h3>
            <p>Click "Invite for Trial" above to invite registered athletes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sentList.map((inv) => {
              const statusKey = inv.status ? inv.status.toLowerCase() : 'pending'
              const st = STATUS[statusKey] || STATUS.pending
              const formattedDate = inv.date || 'Recent'

              return (
                <div
                  key={inv.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: inv.response ? 'rgba(16, 185, 129, 0.05)' : 'var(--panel)',
                    border: inv.response ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div className="flex between wrap gap-2" style={{ alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-bright)' }}>
                        {inv.athlete_name}
                      </div>
                      <div className="tiny dim mt-1">
                        Title: <strong>{inv.subject || 'Trial Invitation'}</strong> · Sent: {formattedDate}
                      </div>
                    </div>
                    <span className={`pill ${st.pill}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>

                  {/* Message preview */}
                  <div className="tiny dim" style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8 }}>
                    "{inv.message}"
                  </div>

                  {/* Athlete Contact Response Details */}
                  {inv.response && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background:
                          inv.response.response_type === 'interested'
                            ? 'rgba(52, 211, 153, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        border:
                          inv.response.response_type === 'interested'
                            ? '1px solid rgba(52, 211, 153, 0.35)'
                            : '1px solid rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: inv.response.response_type === 'interested' ? '#34d399' : '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <UserCheck size={16} />
                        <span>Athlete Response: {inv.response.response_type === 'interested' ? "I'm Interested" : 'Declined'}</span>
                      </div>

                      {inv.response.response_type === 'interested' && (
                        <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                          <div className="flex gap-1" style={{ alignItems: 'center' }}>
                            <User size={13} className="text-dim" />
                            <span><strong>Name:</strong> {inv.response.athlete_name}</span>
                          </div>
                          <div className="flex gap-1" style={{ alignItems: 'center' }}>
                            <Phone size={13} className="text-dim" />
                            <span><strong>Phone:</strong> <a href={`tel:${inv.response.athlete_phone}`} style={{ color: 'var(--green)', textDecoration: 'underline' }}>{inv.response.athlete_phone}</a></span>
                          </div>
                          <div className="flex gap-1" style={{ alignItems: 'center', gridColumn: 'span 2' }}>
                            <Mail size={13} className="text-dim" />
                            <span><strong>Email:</strong> <a href={`mailto:${inv.response.athlete_email}`} style={{ color: 'var(--green)', textDecoration: 'underline' }}>{inv.response.athlete_email}</a></span>
                          </div>
                          <div className="tiny dim" style={{ gridColumn: 'span 2', marginTop: 2 }}>
                            Submitted on {inv.response.created_at}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </Layout>
  )
}

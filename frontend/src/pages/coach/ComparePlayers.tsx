import { useState, useEffect, useCallback } from 'react'
import { GitCompare, Trophy, Search, RotateCcw, Check, Plus, Star, Send } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { api } from '../../lib/api'
import { PLAYERS as MOCK_PLAYERS } from '../../data/mock'

export type AthleteComparisonItem = {
  id: number
  user_id?: number
  name: string
  sport: string
  age: number | null
  gender: string
  location: string
  experience: string
  position: string
  ai_score: number | null
  speed: number
  balance: number
  technique: number
  posture?: number
  arm_movement?: number
  leg_movement?: number
  body_alignment?: number
  running_technique?: number
  symmetry?: number
  skills: string[]
  shortlisted: boolean
}

const METRICS = [
  { key: 'ai_score', label: 'Overall AI Score' },
  { key: 'speed', label: 'Running Technique & Speed' },
  { key: 'balance', label: 'Movement Symmetry & Balance' },
  { key: 'posture', label: 'Posture & Alignment' },
  { key: 'leg_movement', label: 'Knee Drive & Stride Score' },
  { key: 'arm_movement', label: 'Arm Swing Amplitude Score' },
  { key: 'body_alignment', label: 'Body Collinearity Score' },
] as const

export default function ComparePlayers() {
  const [allAthletes, setAllAthletes] = useState<AthleteComparisonItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [inviteModalAthlete, setInviteModalAthlete] = useState<AthleteComparisonItem | null>(null)
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<AthleteComparisonItem[]>('/coach/athletes')
      if (data && data.length > 0) {
        setAllAthletes(data)
        if (data.length >= 2) {
          setSelectedIds([data[0].id, data[1].id])
        } else if (data.length === 1) {
          setSelectedIds([data[0].id])
        }
      } else {
        const fallback = MOCK_PLAYERS.map((p) => ({
          id: p.id,
          name: p.name,
          sport: p.sport,
          age: p.age || 18,
          gender: p.gender || 'Male',
          location: p.location || 'State Center',
          experience: p.experience || '2 yrs',
          position: p.position || 'Sprinter',
          ai_score: p.aiScore || 65,
          speed: p.speed || 65,
          balance: p.balance || 70,
          technique: p.technique || 65,
          posture: p.technique || 65,
          leg_movement: p.speed || 75,
          arm_movement: p.balance || 60,
          body_alignment: p.technique || 70,
          skills: p.skills || [],
          shortlisted: p.shortlisted || false,
        }))
        setAllAthletes(fallback)
        setSelectedIds([fallback[0].id, fallback[1].id])
      }
    } catch {
      const fallback = MOCK_PLAYERS.map((p) => ({
        id: p.id,
        name: p.name,
        sport: p.sport,
        age: p.age || 18,
        gender: p.gender || 'Male',
        location: p.location || 'State Center',
        experience: p.experience || '2 yrs',
        position: p.position || 'Sprinter',
        ai_score: p.aiScore || 65,
        speed: p.speed || 65,
        balance: p.balance || 70,
        technique: p.technique || 65,
        posture: p.technique || 65,
        leg_movement: p.speed || 75,
        arm_movement: p.balance || 60,
        body_alignment: p.technique || 70,
        skills: p.skills || [],
        shortlisted: p.shortlisted || false,
      }))
      setAllAthletes(fallback)
      setSelectedIds([fallback[0].id, fallback[1].id])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAthletes()
  }, [fetchAthletes])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
        ? prev
        : [...prev, id]
    )
  }

  const handleShortlistToggle = async (athlete: AthleteComparisonItem) => {
    try {
      if (athlete.shortlisted) {
        await api.delete(`/coach/shortlist/${athlete.id}`)
      } else {
        await api.post(`/coach/shortlist/${athlete.id}`)
      }
      setAllAthletes((prev) =>
        prev.map((a) => (a.id === athlete.id ? { ...a, shortlisted: !a.shortlisted } : a))
      )
    } catch (e) {
      console.error('Shortlist error:', e)
    }
  }

  const sendInvitation = async () => {
    if (!inviteModalAthlete) return
    try {
      await api.post(`/coach/invite/${inviteModalAthlete.id}`, { message: inviteMsg })
      setInviteSent(true)
      setTimeout(() => {
        setInviteModalAthlete(null)
        setInviteSent(false)
        setInviteMsg('')
      }, 1500)
    } catch (e) {
      console.error('Invite error:', e)
    }
  }

  const filteredPool = allAthletes.filter((a) => {
    if (query) {
      const q = query.toLowerCase()
      const match =
        a.name.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      if (!match) return false
    }
    if (genderFilter !== 'all' && a.gender.toLowerCase() !== genderFilter.toLowerCase()) return false
    if (positionFilter !== 'all' && a.position.toLowerCase() !== positionFilter.toLowerCase()) return false
    if (ageFilter !== 'all' && a.age) {
      const [lo, hi] = ageFilter.split('-').map(Number)
      if (a.age < lo || a.age > hi) return false
    }
    return true
  })

  const selectedAthletes = allAthletes.filter((a) => selectedIds.includes(a.id))

  const resolveMetric = (p: AthleteComparisonItem, key: string): number => {
    if (key === 'ai_score') return p.ai_score ?? 60
    if (key === 'speed') return p.speed || p.running_technique || 65
    if (key === 'balance') return p.balance || p.symmetry || 70
    if (key === 'posture') return p.posture || p.technique || 65
    if (key === 'leg_movement') return p.leg_movement || p.speed || 75
    if (key === 'arm_movement') return p.arm_movement || p.balance || 60
    if (key === 'body_alignment') return p.body_alignment || p.technique || 70
    const raw = (p as any)[key]
    return typeof raw === 'number' ? raw : 65
  }

  const bestValFor = (key: string) => {
    const vals = selectedAthletes.map((a) => resolveMetric(a, key))
    if (vals.length === 0) return 0
    return Math.max(...vals)
  }

  const topOverall = selectedAthletes.reduce<AthleteComparisonItem | null>((best, cur) => {
    if (!best) return cur
    return (cur.ai_score || 0) > (best.ai_score || 0) ? cur : best
  }, null)

  return (
    <Layout nav={COACH_NAV} title="Compare Athletes" crumb="Compare Athletes" portal="coach" notifCount={3}>
      <SectionHead
        title="Compare Athletes"
        sub="Compare sprint performance records, AI scores, and biomechanical results across registered athletes side-by-side"
        action={
          <Pill color="pill-purple">
            <GitCompare size={12} /> {selectedAthletes.length}/4 selected
          </Pill>
        }
      />

      {/* Step 1: Selection & Filter Panel */}
      <Card glow pad className="mb-4">
        <SectionHead
          title="Step 1 · Select Athletes to Compare"
          sub="Filter candidates by age, position or search, then click to add/remove (select up to 4)"
        />

        <div className="flex gap-2 mb-3 wrap">
          <div className="search-bar">
            <Search size={14} />
            <input
              className="input"
              placeholder="Search athlete name, position or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="field" style={{ margin: 0, minWidth: 130 }}>
            <select className="select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
              <option value="all">Any Age</option>
              <option value="14-16">14–16 yrs</option>
              <option value="16-18">16–18 yrs</option>
              <option value="19-21">19–21 yrs</option>
              <option value="21-25">21–25 yrs</option>
              <option value="25-35">25–35 yrs</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, minWidth: 130 }}>
            <select className="select" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
              <option value="all">Any Position</option>
              <option value="Sprinter">Sprinter</option>
              <option value="Middle Distance">Middle Distance</option>
              <option value="Long Distance">Long Distance</option>
              <option value="Hurdler">Hurdler</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, minWidth: 110 }}>
            <select className="select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="all">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {(query || ageFilter !== 'all' || positionFilter !== 'all' || genderFilter !== 'all') && (
            <button
              className="btn btn-ghost"
              onClick={() => { setQuery(''); setAgeFilter('all'); setPositionFilter('all'); setGenderFilter('all') }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">⏳</div>
            <h4>Loading registered athletes...</h4>
          </div>
        ) : filteredPool.length === 0 ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">🔍</div>
            <h4>No athletes match current filters</h4>
            <p>Try resetting filters to see all registered players.</p>
          </div>
        ) : (
          <div className="grid grid-4">
            {filteredPool.map((p) => {
              const selected = selectedIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className="card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 12,
                    border: selected ? '1px solid var(--grad-border)' : '1px solid var(--border)',
                    background: selected ? 'var(--grad-soft)' : 'var(--panel)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="flex" style={{ gap: 10 }}>
                    <Avatar name={p.name} index={p.id} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div className="tiny dim">🏃 {p.position} · {p.age ? `${p.age}y` : '18y'}</div>
                    </div>
                  </div>
                  <div className="flex between mt-2">
                    <ScoreChip value={p.ai_score || 60} />
                    {selected ? (
                      <span className="pill pill-green" style={{ fontSize: 11 }}>
                        <Check size={11} /> Selected
                      </span>
                    ) : (
                      <span className="pill" style={{ fontSize: 11 }}>
                        <Plus size={11} /> Select
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {/* Step 2: Side-by-Side Biomechanical Comparison Table */}
      <Card pad>
        <SectionHead
          title="Step 2 · Biomechanical & Result Comparison Table"
          sub="Side-by-side evaluation of athlete records, AI scores, and biomechanical indicators. 🏆 indicates top performance"
        />

        {selectedAthletes.length < 2 ? (
          <div className="empty" style={{ minHeight: 200 }}>
            <div className="empty-ic">🆚</div>
            <h3>Select at least 2 athletes to compare</h3>
            <p>Choose candidates from the selection grid above to populate the record comparison.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                    Attribute / Biomechanical Metric
                  </th>
                  {selectedAthletes.map((p) => (
                    <th key={p.id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', minWidth: 160 }}>
                      <Avatar name={p.name} index={p.id} size={42} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div className="tiny dim">🏃 {p.position} · {p.location || 'State Center'}</div>
                      <div className="mt-2 flex center wrap gap-1">
                        <button
                          className={`pill ${p.shortlisted ? 'pill-green' : 'pill'}`}
                          style={{ cursor: 'pointer', border: 'none', fontSize: 11 }}
                          onClick={() => handleShortlistToggle(p)}
                        >
                          <Star size={10} fill={p.shortlisted ? 'currentColor' : 'none'} /> {p.shortlisted ? 'Shortlisted' : '+ Shortlist'}
                        </button>
                        <button
                          className="pill pill-blue"
                          style={{ cursor: 'pointer', border: 'none', fontSize: 11 }}
                          onClick={() => setInviteModalAthlete(p)}
                        >
                          <Send size={10} /> Invite
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Profile attributes row */}
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>AGE & DEMOGRAPHICS</td>
                  {selectedAthletes.map((p) => (
                    <td key={p.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span className="pill pill-blue" style={{ fontWeight: 600 }}>
                        {p.age || 18} yrs · {p.gender || 'Male'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>EXPERIENCE & POSITION</td>
                  {selectedAthletes.map((p) => (
                    <td key={p.id} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>
                      <div><b>{p.position || 'Sprinter'}</b></div>
                      <div className="tiny dim">{p.experience || '2 yrs'}</div>
                    </td>
                  ))}
                </tr>

                {/* Metric comparisons */}
                {METRICS.map((m) => {
                  const best = bestValFor(m.key)
                  return (
                    <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 13.5 }}>
                        {m.label}
                      </td>
                      {selectedAthletes.map((p) => {
                        const val = resolveMetric(p, m.key)
                        const isBest = val === best
                        return (
                          <td key={p.id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span
                              className={isBest ? 'pill pill-green' : 'pill'}
                              style={{ fontWeight: 700, fontSize: 13 }}
                            >
                              {val} / 100
                              {isBest && ' 🏆'}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Step 3: AI Executive Verdict */}
      {selectedAthletes.length >= 2 && topOverall && (
        <Card pad className="mt-4" glow style={{ background: 'var(--grad-soft)', borderColor: 'var(--grad-border)' }}>
          <div className="flex between wrap gap-3">
            <div className="flex" style={{ gap: 14 }}>
              <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                <Trophy size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>AI Scout Comparative Verdict</div>
                <div className="tiny dim mt-1" style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <b>{topOverall.name}</b> holds the highest overall AI performance score (<b>{topOverall.ai_score || 60}/100</b>) among the compared candidates
                  at age <b>{topOverall.age || 18}</b>.
                  {selectedAthletes.find((a) => a.id !== topOverall.id) && (
                    <span>
                      {' '}They demonstrate strong biomechanical posture & knee drive metrics compared to peers in the {topOverall.position} category.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleShortlistToggle(topOverall)}
              >
                <Star size={13} fill={topOverall.shortlisted ? 'currentColor' : 'none'} />
                {topOverall.shortlisted ? 'Shortlisted' : `Shortlist ${topOverall.name}`}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setInviteModalAthlete(topOverall)}
              >
                <Send size={13} /> Invite {topOverall.name} to Trial
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      {inviteModalAthlete && (
        <div className="modal-backdrop" onClick={() => setInviteModalAthlete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <SectionHead
              title={`Send Trial Invitation to ${inviteModalAthlete.name}`}
              sub={`Position: ${inviteModalAthlete.position} · AI Score: ${inviteModalAthlete.ai_score ?? 60}`}
            />
            {inviteSent ? (
              <div className="empty" style={{ minHeight: 120 }}>
                <div className="empty-ic">✅</div>
                <h4>Invitation Sent Successfully!</h4>
                <p>An official notification has been delivered to {inviteModalAthlete.name}.</p>
              </div>
            ) : (
              <div>
                <div className="field mt-3">
                  <label className="label">Custom Invitation Note</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Enter details about the upcoming sprinting trial or academy evaluation..."
                    value={inviteMsg}
                    onChange={(e) => setInviteMsg(e.target.value)}
                  />
                </div>
                <div className="flex end gap-2 mt-4">
                  <button className="btn btn-ghost" onClick={() => setInviteModalAthlete(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={sendInvitation}>
                    <Send size={14} /> Send Invitation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

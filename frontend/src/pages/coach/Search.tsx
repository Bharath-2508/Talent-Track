import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowRight, RotateCcw, Filter } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { api } from '../../lib/api'

type AthleteResult = {
  id: number
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
  improvement: number
  skills: string[]
  shortlisted: boolean
}

const DEFAULT_FILTERS = {
  query: '',
  age: 'all',
  gender: 'all',
  position: 'all',
  location: '',
  experience: 'all',
  minScore: 0,
  minSpeed: 0,
  minBalance: 0,
  minTechnique: 0,
}

export default function TalentSearch() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [applied, setApplied] = useState(DEFAULT_FILTERS)
  const [athletes, setAthletes] = useState<AthleteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const fetchAthletes = useCallback(async (f: typeof DEFAULT_FILTERS) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f.query) params.set('q', f.query)
      if (f.gender !== 'all') params.set('gender', f.gender)
      if (f.location) params.set('location', f.location)
      if (f.position !== 'all') params.set('position', f.position)
      if (f.experience !== 'all') params.set('experience', f.experience)
      if (f.age !== 'all') {
        const [lo, hi] = f.age.split('-').map(Number)
        params.set('age_min', String(lo))
        params.set('age_max', String(hi))
      }
      if (f.minScore > 0) params.set('min_score', String(f.minScore))
      if (f.minSpeed > 0) params.set('min_speed', String(f.minSpeed))
      if (f.minBalance > 0) params.set('min_balance', String(f.minBalance))
      if (f.minTechnique > 0) params.set('min_technique', String(f.minTechnique))

      const qs = params.toString()
      const data = await api.get<AthleteResult[]>(`/coach/athletes${qs ? `?${qs}` : ''}`)
      setAthletes(data)
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load — no filters
  useEffect(() => {
    fetchAthletes(DEFAULT_FILTERS)
  }, [fetchAthletes])

  const handleApply = () => {
    setApplied(filters)
    fetchAthletes(filters)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setApplied(DEFAULT_FILTERS)
    fetchAthletes(DEFAULT_FILTERS)
  }

  const set = (key: keyof typeof DEFAULT_FILTERS, value: string | number) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const activeFilterCount = Object.entries(applied).filter(
    ([k, v]) => v !== (DEFAULT_FILTERS as any)[k]
  ).length

  return (
    <Layout nav={COACH_NAV} title="Search Players" crumb="Search Players" portal="coach" notifCount={3}>
      <SectionHead
        title="Search Players"
        sub={`${athletes.length} athlete${athletes.length !== 1 ? 's' : ''} found · results are strictly filtered to running / sprinting`}
        action={
          <div className="flex gap-2">
            {activeFilterCount > 0 && <Pill color="pill-purple">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</Pill>}
            <button className="pill pill-blue" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal size={12} /> {showFilters ? 'Hide filters' : 'Smart filters'}
            </button>
          </div>
        }
      />

      {showFilters && (
        <Card glow pad className="filter-panel">
          <div className="flex gap-2 mb-3 wrap">
            <div className="search-bar">
              <Search />
              <input
                className="input"
                placeholder="Search by name, position or skill (e.g. sprint)"
                value={filters.query}
                onChange={(e) => set('query', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>
            <button className="btn btn-primary" onClick={handleApply} disabled={loading}>
              <Filter size={14} /> Apply
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="filter-grid">
            <div className="field">
              <label className="label">Age Group</label>
              <select className="select" value={filters.age} onChange={(e) => set('age', e.target.value)}>
                <option value="all">Any Age</option>
                <option value="14-16">14–16</option>
                <option value="16-18">16–18</option>
                <option value="19-21">19–21</option>
                <option value="21-25">21–25</option>
                <option value="25-35">25–35</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Gender</label>
              <select className="select" value={filters.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="all">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Position</label>
              <select className="select" value={filters.position} onChange={(e) => set('position', e.target.value)}>
                <option value="all">Any Position</option>
                <option value="Sprinter">Sprinter</option>
                <option value="Middle Distance">Middle Distance</option>
                <option value="Long Distance">Long Distance</option>
                <option value="Hurdler">Hurdler</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="City"
                value={filters.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Experience</label>
              <select className="select" value={filters.experience} onChange={(e) => set('experience', e.target.value)}>
                <option value="all">Any Level</option>
                <option value="Beginner">Beginner (0–2 yrs)</option>
                <option value="Intermediate">Intermediate (3–5 yrs)</option>
                <option value="Advanced">Advanced (6+ yrs)</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex between mb-1">
              <span className="tiny" style={{ fontWeight: 600 }}>Minimum AI attributes</span>
            </div>
            <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              <div className="field">
                <label className="label">AI Score ≥ {filters.minScore}</label>
                <input
                  type="range" min={0} max={100}
                  value={filters.minScore}
                  className="input" style={{ padding: 0 }}
                  onChange={(e) => set('minScore', Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label className="label">Speed ≥ {filters.minSpeed}</label>
                <input
                  type="range" min={0} max={100}
                  value={filters.minSpeed}
                  className="input" style={{ padding: 0 }}
                  onChange={(e) => set('minSpeed', Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label className="label">Balance ≥ {filters.minBalance}</label>
                <input
                  type="range" min={0} max={100}
                  value={filters.minBalance}
                  className="input" style={{ padding: 0 }}
                  onChange={(e) => set('minBalance', Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label className="label">Technique ≥ {filters.minTechnique}</label>
                <input
                  type="range" min={0} max={100}
                  value={filters.minTechnique}
                  className="input" style={{ padding: 0 }}
                  onChange={(e) => set('minTechnique', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="empty" style={{ minHeight: 200 }}>
          <div className="empty-ic">⏳</div>
          <h3>Searching athletes…</h3>
        </div>
      ) : athletes.length === 0 ? (
        <Card pad className="mt-3">
          <div className="empty">
            <div className="empty-ic">🔍</div>
            <h3>No athletes found</h3>
            <p>Try adjusting your filters or resetting to see all registered athletes.</p>
            <button className="btn btn-outline btn-sm mt-2" onClick={handleReset}>
              <RotateCcw size={14} /> Reset all filters
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-3 mt-1">
          {athletes.map((p, i) => (
            <Card key={p.id} hover pad className="athlete-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="ath-top">
                <Avatar name={p.name} index={p.id} />
                <div style={{ flex: 1 }}>
                  <div className="ath-name">{p.name}</div>
                  <div className="ath-meta">🏃 {p.sport} · {p.position} · {p.age ?? '—'} yrs · {p.location || '—'}</div>
                </div>
                <ScoreChip value={p.ai_score} />
              </div>
              {p.skills.length > 0 && (
                <div className="ath-skills">
                  {p.skills.slice(0, 3).map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 wrap">
                <span className="pill pill-blue">Speed {p.speed}</span>
                <span className="pill pill-green">Balance {p.balance}</span>
                <span className="pill pill-purple">Tech {p.technique}</span>
              </div>
              <div className="ath-foot">
                {p.shortlisted && <Pill color="pill-green">★ Shortlisted</Pill>}
                <Link to={`/coach/player/${p.id}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                  View Profile <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowRight, Eye } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Avatar, ScoreChip } from '../../components/ui'
import { PLAYERS, SPORT_META, SPORTS, Sport } from '../../data/mock'

const RANGES = [
  { key: 'score', label: 'AI Score', min: 60, max: 100 },
  { key: 'speed', label: 'Speed', min: 50, max: 100 },
  { key: 'balance', label: 'Balance', min: 50, max: 100 },
  { key: 'technique', label: 'Technique', min: 50, max: 100 },
]

export default function TalentSearch() {
  const [sport, setSport] = useState<Sport | 'all'>('all')
  const [age, setAge] = useState('all')
  const [gender, setGender] = useState('all')
  const [position, setPosition] = useState('all')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('all')
  const [query, setQuery] = useState('')

  let list = PLAYERS
  if (sport !== 'all') list = list.filter((p) => p.sport === sport)
  if (gender !== 'all') list = list.filter((p) => p.gender.toLowerCase() === gender.toLowerCase())
  if (position !== 'all') list = list.filter((p) => p.position === position)
  if (experience !== 'all') list = list.filter((p) => p.experience === experience)
  if (age !== 'all') {
    const [a, b] = age.split('-').map(Number)
    list = list.filter((p) => p.age >= a && p.age <= b)
  }
  if (location) list = list.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()))
  if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())))

  const positions = sport !== 'all' ? [...new Set(PLAYERS.filter((p) => p.sport === sport).map((p) => p.position))] : [...new Set(PLAYERS.map((p) => p.position))]

  return (
    <Layout nav={COACH_NAV} title="Search Players" crumb="Search Players" portal="coach" notifCount={3}>
      <SectionHead
        title="Search Players"
        sub={`${list.length} athletes found · results are strictly filtered to running / sprinting`}
        action={
          <div className="flex gap-2">
            <Pill color="pill-blue"><SlidersHorizontal size={12} /> Smart filters</Pill>
          </div>
        }
      />

      <Card glow pad className="filter-panel">
        <div className="flex gap-2 mb-3 wrap">
          <div className="search-bar">
            <Search />
            <input className="input" placeholder="Search by name or skill (e.g. sprint)" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-ghost">Reset</button>
        </div>
        <div className="filter-grid">
          <div className="field">
            <label className="label">Sport</label>
            <select className="select" value={sport} onChange={(e) => setSport(e.target.value as Sport | 'all')}>
              <option value="all">Running / Sprinting</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{SPORT_META[s].icon} {SPORT_META[s].label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Age Group</label>
            <select className="select" value={age} onChange={(e) => setAge(e.target.value)}>
              <option value="all">Any Age</option>
              <option value="16-18">16–18</option>
              <option value="19-21">19–21</option>
              <option value="21-25">21–25</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Gender</label>
            <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="all">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Position</label>
            <select className="select" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="all">Any Position</option>
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Location</label>
            <input className="input" placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Experience</label>
            <select className="select" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="all">Any Level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex between mb-1">
            <span className="tiny" style={{ fontWeight: 600 }}>Minimum AI attributes</span>
          </div>
          <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {RANGES.map((r) => (
              <div key={r.key} className="field">
                <label className="label">{r.label} ≥ {r.min}</label>
                <input type="range" min={50} max={100} value={r.min} className="input" style={{ padding: 0 }} onChange={() => {}} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-3">
        {list.map((p, i) => {
          const m = SPORT_META[p.sport]
          return (
            <Card key={p.id} hover pad className="athlete-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="ath-top">
                <Avatar name={p.name} index={p.id} />
                <div style={{ flex: 1 }}>
                  <div className="ath-name">{p.name}</div>
                  <div className="ath-meta">{m.icon} {m.label} · {p.position} · {p.age} yrs · {p.location}</div>
                </div>
                <ScoreChip value={p.aiScore} />
              </div>
              <div className="ath-skills">
                {p.skills.map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>
              <div className="flex gap-2 wrap">
                <span className="pill pill-blue">Speed {p.speed}</span>
                <span className="pill pill-green">Balance {p.balance}</span>
                <span className="pill pill-purple">Tech {p.technique}</span>
              </div>
              <div className="ath-foot">
                <span className="trend-up">▲ {p.improvement}% improvement</span>
                <Link to={`/coach/player/${p.id}`} className="btn btn-outline btn-sm">
                  View Profile <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, CheckCircle2 } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { TRIALS, SPORT_META, Sport, SPORTS } from '../../data/mock'

export default function CoachTrials() {
  const [showForm, setShowForm] = useState(false)
  const [created, setCreated] = useState(false)
  const mine = TRIALS.filter((t) => t.sport === 'running').slice(0, 3)

  const publish = (e: React.FormEvent) => {
    e.preventDefault()
    setCreated(true)
    setShowForm(false)
    setTimeout(() => setCreated(false), 2400)
  }

  return (
    <Layout nav={COACH_NAV} title="Trials" crumb="Trials" portal="coach" notifCount={3}>
      <SectionHead
        title="Academy Trials"
        sub="Create and manage trials for your academy"
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Create New Trial
          </button>
        }
      />

      {showForm && (
        <Card glow pad className="mb-4">
          <SectionHead title="Create New Trial" sub="Publish a trial to find athletes in your sport" />
          <form onSubmit={publish} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field-row">
              <div className="field">
                <label className="label">Trial Name</label>
                <input className="input" placeholder="e.g. Sprint Qualifier Camp" required />
              </div>
              <div className="field">
                <label className="label">Sport</label>
                <select className="select" defaultValue="">
                  <option value="" disabled>Select sport</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{SPORT_META[s].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Age Group</label>
                <select className="select">
                  <option>U-16</option>
                  <option>U-18</option>
                  <option>U-19</option>
                  <option>Open</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Location</label>
                <input className="input" placeholder="City / Venue" required />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Date</label>
                <input type="date" className="input" required />
              </div>
              <div className="field">
                <label className="label">Time</label>
                <input type="time" className="input" required />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Eligibility</label>
                <input className="input" placeholder="e.g. AI score 75+, district level" required />
              </div>
              <div className="field">
                <label className="label">Number of Positions</label>
                <input type="number" className="input" min={1} placeholder="e.g. 15" />
              </div>
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea className="textarea" rows={3} placeholder="Describe the trial, drills and what you look for…" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary"><Plus size={15} /> Publish Trial</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            {created && <div className="pill pill-green"><CheckCircle2 size={13} /> Trial published! Sprint athletes can now apply.</div>}
          </form>
        </Card>
      )}

      <div className="grid grid-3">
        {mine.map((t) => (
          <Card key={t.id} hover pad>
            <div className="trial-head">
              <div>
                <div className="trial-title">{t.name}</div>
                <div className="trial-org">{t.org}</div>
              </div>
              <span className="pill pill-green">● Live</span>
            </div>
            <div className="trial-meta mt-2">
              <div className="trial-meta-row">{SPORT_META[t.sport].icon} {SPORT_META[t.sport].label} · {t.ageGroup}</div>
              <div className="trial-meta-row">📍 {t.location} · {t.date}</div>
              <div className="trial-meta-row"><Users /> {t.positions} positions · {8 + t.id * 3} applicants</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>View Applications</button>
              <button className="btn btn-outline btn-sm"><Pencil size={14} /></button>
              <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}

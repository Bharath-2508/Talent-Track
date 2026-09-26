import { useEffect, useState } from 'react'
import { Plus, Users, CheckCircle2 } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { api } from '../../lib/api'

interface Trial {
  id: number
  name: string
  org: string
  age_group: string
  location: string
  date: string
  eligibility: string
  positions: number
  applicants: number
  is_active: boolean
}

export default function CoachTrials() {
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [created, setCreated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '', age_group: 'Open', location: '', date: '', org: '', eligibility: '', positions: 10,
  })

  useEffect(() => {
    api.get<Trial[]>('/coach/trials')
      .then(setTrials)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const publish = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post<{ trial_id: number }>('/coach/trials', form)
      setCreated(true)
      setShowForm(false)
      setForm({ name: '', age_group: 'Open', location: '', date: '', org: '', eligibility: '', positions: 10 })
      // Refresh list
      const updated = await api.get<Trial[]>('/coach/trials')
      setTrials(updated)
      setTimeout(() => setCreated(false), 3000)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout nav={COACH_NAV} title="Trials" crumb="Trials" portal="coach" notifCount={0}>
      <SectionHead
        title="Club Trials"
        sub="Create and manage trials for running / sprinting athletes"
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Create New Trial
          </button>
        }
      />

      {created && (
        <div className="pill pill-green mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
          <CheckCircle2 size={16} /> Trial published! Athletes can now apply.
        </div>
      )}

      {showForm && (
        <Card glow pad className="mb-4">
          <SectionHead title="Create New Trial" sub="Publish a running trial to find sprinting athletes" />
          <form onSubmit={publish} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field-row">
              <div className="field">
                <label className="label">Trial Name</label>
                <input className="input" placeholder="e.g. Sprint Qualifier Camp" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Organisation</label>
                <input className="input" placeholder="Your club / organization name" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Age Group</label>
                <select className="select" value={form.age_group} onChange={e => setForm(f => ({ ...f, age_group: e.target.value }))}>
                  <option>U-16</option><option>U-18</option><option>U-19</option><option>U-20</option><option>Open</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Location</label>
                <input className="input" placeholder="City / Venue" required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Date</label>
                <input type="date" className="input" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Number of Positions</label>
                <input type="number" className="input" min={1} value={form.positions} onChange={e => setForm(f => ({ ...f, positions: parseInt(e.target.value) || 10 }))} />
              </div>
            </div>
            <div className="field">
              <label className="label">Eligibility</label>
              <input className="input" placeholder="e.g. AI score 75+, district level" value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}><Plus size={15} /> {submitting ? 'Publishing…' : 'Publish Trial'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="empty"><div className="empty-ic">⏳</div><h3>Loading trials…</h3></div>
      ) : trials.length === 0 ? (
        <div className="empty">
          <div className="empty-ic">🏟️</div>
          <h3>No trials created yet</h3>
          <p>Click "Create New Trial" to publish your first running trial.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {trials.map((t) => (
            <Card key={t.id} hover pad>
              <div className="trial-head">
                <div>
                  <div className="trial-title">{t.name}</div>
                  <div className="trial-org">{t.org}</div>
                </div>
                <span className="pill pill-green">● Live</span>
              </div>
              <div className="trial-meta mt-2">
                <div className="trial-meta-row">🏃 Running · {t.age_group}</div>
                <div className="trial-meta-row">📍 {t.location} · {t.date}</div>
                <div className="trial-meta-row"><Users size={14} /> {t.positions} positions · {t.applicants} applicants</div>
                {t.eligibility && <div className="trial-meta-row">✓ {t.eligibility}</div>}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>View Applications</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { api } from '../../lib/api'

type Scholarship = {
  id: number
  name: string
  org: string
  type: string
  amount: string
  eligibility: string
  deadline: string
}

export default function Scholarships() {
  const [data, setData] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Scholarship[]>('/player/scholarships')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const typeColor: Record<string, string> = {
    Government: 'pill-blue', Private: 'pill-purple',
    Academy: 'pill-green', 'Sports Quota': 'pill-cyan',
  }

  return (
    <Layout nav={PLAYER_NAV} title="Scholarships" crumb="Scholarships" portal="player" notifCount={0}>
      <SectionHead title="Running Scholarships" sub="Funding opportunities for running / sprinting athletes" />
      {loading ? (
        <div className="empty"><div className="empty-ic">⏳</div><h3>Loading…</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.map((s) => (
            <Card key={s.id} hover pad>
              <div className="flex between wrap gap-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div className="tiny dim mt-1">{s.org}</div>
                  <div className="mt-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Pill color={typeColor[s.type] || 'pill-blue'}>{s.type}</Pill>
                    <Pill color="pill-green">💰 {s.amount}</Pill>
                    <Pill color="pill-purple">📅 Deadline: {s.deadline}</Pill>
                  </div>
                  <div className="tiny dim mt-2">Eligibility: {s.eligibility}</div>
                </div>
                <button className="btn btn-outline btn-sm">Apply</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}

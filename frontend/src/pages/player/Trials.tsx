import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { api } from '../../lib/api'

type Trial = {
  id: number
  name: string
  age_group: string
  location: string
  date: string
  org: string
  eligibility: string
  positions: number
}

export default function Trials() {
  const { athlete } = useAthlete()
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Trial[]>('/player/trials')
      .then(setTrials)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout nav={PLAYER_NAV} title="Running Trials" crumb="Trials" portal="player" notifCount={0}>
      <SectionHead title="Running Trials" sub="Open trials for running / sprinting athletes near you" />
      {loading ? (
        <div className="empty"><div className="empty-ic">⏳</div><h3>Loading trials…</h3></div>
      ) : trials.length === 0 ? (
        <div className="empty"><div className="empty-ic">🏟️</div><h3>No trials available yet</h3><p>Check back soon — coaches will post new running trials here.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trials.map((t) => (
            <Card key={t.id} hover pad>
              <div className="flex between wrap gap-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                  <div className="tiny dim mt-1">{t.org} · {t.location} · {t.date}</div>
                  <div className="mt-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Pill color="pill-blue">🏃 Running</Pill>
                    <Pill color="pill-purple">Age: {t.age_group}</Pill>
                    <Pill color="pill-green">{t.positions} positions</Pill>
                  </div>
                  {t.eligibility && <div className="tiny dim mt-2">Eligibility: {t.eligibility}</div>}
                </div>
                <button className="btn btn-primary btn-sm" disabled={!athlete.overallScore}>
                  Apply Now
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}

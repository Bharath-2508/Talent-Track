import { useState } from 'react'
import { ChevronsUpDown, Play, ArrowUpRight, Video } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { COMPARE } from '../../data/mock'

export default function VideoComparison() {
  const [prev, setPrev] = useState(0)
  const [latest, setLatest] = useState(2)
  const videos = [
    { t: 'Technique Run – Jan 2026', d: '1:24' },
    { t: 'Time Trial – Feb 2026', d: '1:18' },
    { t: 'Sprint Session – Apr 2026', d: '1:36' },
  ]

  const deltas = COMPARE.metrics.map((m) => ({
    ...m,
    diff: m.current - m.prev,
  }))
  const avgGain = Math.round(deltas.reduce((a, d) => a + d.diff, 0) / deltas.length)

  return (
    <Layout nav={PLAYER_NAV} title="My Video Comparison" crumb="Video Comparison" portal="player" notifCount={2}>
      <SectionHead
        title="Compare My Progress"
        sub="Select my previous video and my latest video to see my improvement side by side"
        action={<Pill color="pill-green">▲ Avg gain +{avgGain} pts</Pill>}
      />

      <div className="cmp-grid mb-4">
        <Card pad>
          <SectionHead title="Previous Video" action={<Video size={15} color="#9aa8bd" />} />
          <div className="flex gap-2 mb-3">
            {videos.map((v, i) => (
              <button key={v.t} className={prev === i ? 'pill pill-blue' : 'pill'} onClick={() => setPrev(i)}>
                {v.d} {prev === i ? '✓' : ''}
              </button>
            ))}
          </div>
          <div className="scan-box" style={{ background: videos[prev].t.includes('Jan') ? 'linear-gradient(135deg,#1e3a8a,#334155)' : 'linear-gradient(135deg,#0e7490,#22d3ee)' }}>
            <div style={{ height: 300, display: 'grid', placeItems: 'center', fontSize: 56 }}>🏏</div>
            <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
              <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}>{videos[prev].t}</span>
            </div>
            <div style={{ position: 'absolute', bottom: 12, right: 14 }}>
              <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}><Play size={11} /> {videos[prev].d}</span>
            </div>
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Latest Video" action={<span className="pill pill-green">✓ Current</span>} />
          <div className="flex gap-2 mb-3">
            {videos.map((v, i) => (
              <button key={v.t} className={latest === i ? 'pill pill-blue' : 'pill'} onClick={() => setLatest(i)}>
                {v.d} {latest === i ? '✓' : ''}
              </button>
            ))}
          </div>
          <div className="scan-box" style={{ background: 'linear-gradient(135deg,#6d28d9,#3d8bff)' }}>
            <div style={{ height: 300, display: 'grid', placeItems: 'center', fontSize: 56 }}>🏏</div>
            <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
              <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}>{videos[latest].t}</span>
            </div>
            <div style={{ position: 'absolute', bottom: 12, right: 14 }}>
              <span className="pill" style={{ background: 'rgba(8,12,20,0.85)' }}><Play size={11} /> {videos[latest].d}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card pad>
        <SectionHead title="Improvement Breakdown" sub="AI metrics compared frame by frame" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="cmp-metric" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontWeight: 700, color: 'var(--text-muted)', fontSize: 12 }}>
            <span>Metric</span>
            <span>Previous</span>
            <span>Current</span>
            <span style={{ textAlign: 'right' }}>Improvement</span>
          </div>
          {deltas.map((d) => (
            <div key={d.metric} className="cmp-metric card">
              <span className="m-label">{d.metric}</span>
              <span className="cmp-val prev">{d.prev}</span>
              <span className="cmp-val cur">{d.current}</span>
              <span className="improve-chip">
                <ArrowUpRight size={14} /> +{d.diff}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="ai-insight">
            <ChevronsUpDown size={20} color="#22d3ee" style={{ flexShrink: 0 }} />
            <span>
              Your <b>Technique (+16)</b> improved most. Keep the footwork drills — Speed has room to grow next.
            </span>
          </div>
        </div>
      </Card>
    </Layout>
  )
}

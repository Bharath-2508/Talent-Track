import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronsUpDown, ArrowUpRight, ArrowDownRight, Video, Upload, Sparkles } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { api } from '../../lib/api'

type AnalysisRec = {
  id: number
  overall_score: number
  posture_score: number
  arm_movement_score: number
  leg_movement_score: number
  body_alignment_score: number
  running_technique_score: number
  symmetry_score: number
  metrics: Array<{ label: string; value: number }>
  created_at: string
  comparison?: any
}

export default function VideoComparison() {
  const [analyses, setAnalyses] = useState<AnalysisRec[]>([])
  const [loading, setLoading] = useState(true)
  const [prevIdx, setPrevIdx] = useState(1)
  const [currIdx, setCurrIdx] = useState(0)

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const data = await api.get<AnalysisRec[]>('/player/analyses')
        setAnalyses(data || [])
        if (data && data.length >= 2) {
          setCurrIdx(0)
          setPrevIdx(1)
        }
      } catch (err) {
        console.error('Failed to load analyses:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalyses()
  }, [])

  const currentAn = analyses[currIdx]
  const prevAn = analyses[prevIdx]

  const metricsMap = (an: AnalysisRec | undefined) => {
    if (!an) return {}
    const map: Record<string, number> = {
      'Posture': an.posture_score || 0,
      'Arm Movement': an.arm_movement_score || 0,
      'Leg / Knee Movement': an.leg_movement_score || 0,
      'Body Alignment': an.body_alignment_score || 0,
      'Running Technique': an.running_technique_score || 0,
      'Movement Symmetry': an.symmetry_score || 0,
    }
    if (an.metrics) {
      an.metrics.forEach((m) => {
        if (m.label) map[m.label] = m.value
      })
    }
    return map
  }

  const prevMetrics = metricsMap(prevAn)
  const currMetrics = metricsMap(currentAn)

  const labels = ['Posture', 'Arm Movement', 'Leg / Knee Movement', 'Body Alignment', 'Running Technique', 'Movement Symmetry']
  const deltas = labels.map((lbl) => {
    const cur = currMetrics[lbl] || 0
    const prv = prevMetrics[lbl] || 0
    return {
      metric: lbl,
      prev: prv,
      current: cur,
      diff: cur - prv,
    }
  })

  const overallDiff = (currentAn?.overall_score || 0) - (prevAn?.overall_score || 0)

  return (
    <Layout nav={PLAYER_NAV} title="My Video Comparison" crumb="Video Comparison" portal="player" notifCount={0}>
      <SectionHead
        title="Compare My Progress"
        sub="Select any two of your previous AI assessments to compare biomechanical scores side-by-side"
        action={
          analyses.length >= 2 ? (
            <Pill color={overallDiff >= 0 ? 'pill-green' : 'pill-red'}>
              Overall Diff: {overallDiff >= 0 ? `+${overallDiff}` : overallDiff} pts
            </Pill>
          ) : undefined
        }
      />

      {loading ? (
        <Card pad><div className="empty">Loading your assessment history…</div></Card>
      ) : analyses.length < 2 ? (
        <Card glow pad>
          <div className="empty">
            <div className="empty-ic">📊</div>
            <h3>At least 2 assessments needed for side-by-side comparison</h3>
            <p>
              You currently have {analyses.length} assessment{analyses.length === 1 ? '' : 's'}. Upload another video to unlock side-by-side comparison between any of your past assessments!
            </p>
            <Link to="/player/upload" className="btn btn-primary"><Upload size={15} /> Upload Next Video</Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="cmp-grid mb-4">
            <Card pad>
              <SectionHead title="Previous Assessment" action={<Video size={15} color="#9aa8bd" />} />
              <div className="flex gap-2 mb-3 wrap">
                {analyses.map((an, i) => (
                  <button
                    key={an.id}
                    className={prevIdx === i ? 'pill pill-blue' : 'pill'}
                    onClick={() => setPrevIdx(i)}
                    disabled={currIdx === i}
                  >
                    Report #{an.id} ({an.overall_score} pts) {prevIdx === i ? '✓' : ''}
                  </button>
                ))}
              </div>
              <div className="scan-box" style={{ background: 'linear-gradient(135deg,#1e3a8a,#334155)', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#93c5fd' }}>{prevAn?.overall_score} / 100</div>
                <div className="tiny dim mt-1">Previous Overall Score</div>
                <div className="tiny dim mt-1">{prevAn?.created_at ? new Date(prevAn.created_at).toLocaleDateString() : ''}</div>
              </div>
            </Card>

            <Card pad>
              <SectionHead title="Target / Latest Assessment" action={<span className="pill pill-green">✓ Selected</span>} />
              <div className="flex gap-2 mb-3 wrap">
                {analyses.map((an, i) => (
                  <button
                    key={an.id}
                    className={currIdx === i ? 'pill pill-blue' : 'pill'}
                    onClick={() => setCurrIdx(i)}
                    disabled={prevIdx === i}
                  >
                    Report #{an.id} ({an.overall_score} pts) {currIdx === i ? '✓' : ''}
                  </button>
                ))}
              </div>
              <div className="scan-box" style={{ background: 'linear-gradient(135deg,#6d28d9,#3d8bff)', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#c4b5fd' }}>{currentAn?.overall_score} / 100</div>
                <div className="tiny dim mt-1">Target Overall Score</div>
                <div className="tiny dim mt-1">{currentAn?.created_at ? new Date(currentAn.created_at).toLocaleDateString() : ''}</div>
              </div>
            </Card>
          </div>

          <Card pad>
            <SectionHead title="Biomechanical Score Comparison" sub="Metric scores calculated by AI pose estimation" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="cmp-metric" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, padding: '8px 12px' }}>
                <span>Metric</span>
                <span>Previous</span>
                <span>Target</span>
                <span style={{ textAlign: 'right' }}>Difference</span>
              </div>
              {deltas.map((d) => (
                <div key={d.metric} className="cmp-metric card" style={{ padding: '10px 12px' }}>
                  <span className="m-label" style={{ fontWeight: 600 }}>{d.metric}</span>
                  <span className="cmp-val prev" style={{ color: '#9aa8bd' }}>{d.prev}</span>
                  <span className="cmp-val cur" style={{ fontWeight: 700 }}>{d.current}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: d.diff > 0 ? '#4ade80' : d.diff < 0 ? '#f87171' : '#9aa8bd' }}>
                    {d.diff > 0 ? <><ArrowUpRight size={14} style={{ display: 'inline' }} /> +{d.diff}</> : d.diff < 0 ? <><ArrowDownRight size={14} style={{ display: 'inline' }} /> {d.diff}</> : '0'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="ai-insight" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)', borderRadius: 12, padding: 12 }}>
                <Sparkles size={20} color="#a78bfa" style={{ flexShrink: 0 }} />
                <span>
                  Comparing <b>Report #{prevAn?.id}</b> vs <b>Report #{currentAn?.id}</b>: Overall score changed by <b>{overallDiff >= 0 ? `+${overallDiff}` : overallDiff} points</b>.
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
    </Layout>
  )
}

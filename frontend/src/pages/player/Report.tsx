import { Link } from 'react-router-dom'
import { Check, AlertTriangle, ArrowRight, Download, Sparkles, LineChart, Upload, GitCompare } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill, Ring, Progress } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { SPORT_META } from '../../data/mock'

export default function PerformanceReport() {
  const { sport, athlete, stats } = useAthlete()
  const meta = SPORT_META[sport]
  const hasAssessment = stats.overall > 0
  const metrics = stats.metrics
  const video = stats.latestVideo

  return (
    <Layout nav={PLAYER_NAV} title="My AI Analysis" crumb="My Analysis" portal="player" notifCount={0}>
      <SectionHead
        title="My AI Performance Report"
        sub={`${meta.icon} ${meta.label} performance · based on my latest assessment`}
        action={
          hasAssessment ? (
            <Link to="/player/compare" className="btn btn-outline btn-sm">
              Compare with past <ArrowRight size={14} />
            </Link>
          ) : undefined
        }
      />

      {!hasAssessment ? (
        <Card glow pad>
          <div className="empty">
            <div className="empty-ic">📊</div>
            <h3>No assessment available yet</h3>
            <p>
              Your AI report is generated after you upload a running video. Once analyzed, your overall score,
              posture and movement analysis, strengths, weaknesses and recommendations will appear here.
            </p>
            <Link to="/player/upload" className="btn btn-primary"><Upload size={15} /> Upload My Video</Link>
          </div>
        </Card>
      ) : (
        <>
          <Card glow pad style={{ marginBottom: 18 }}>
            <div className="flex between wrap gap-4">
              <div className="flex" style={{ gap: 22 }}>
                <Ring value={stats.overall} size={150} stroke={12} label={`${stats.overall}/100`} sub="Overall Score" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  <div className="flex gap-1">
                    <Pill color="pill-green">✓ {meta.label} Analysis</Pill>
                  </div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 20 }}>{athlete.name || 'Registered Athlete'}</div>
                  <div className="tiny dim">{athlete.position || 'Sprinter'} · {athlete.location || '—'}</div>
                  <div className="tiny dim">Report generated from {video?.name || 'latest video'} · {video?.date || ''}</div>
                  <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
              {metrics.length > 0 && (
                <div className="chart-box" style={{ width: 320, height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={metrics} outerRadius="72%">
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="label" tick={{ fill: '#9aa8bd', fontSize: 10.5 }} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.32} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>

          {/* ── Previous Assessment Comparison Section ── */}
          <Card pad style={{ marginBottom: 18 }}>
            <SectionHead
              title="Previous Assessment Comparison"
              sub="Comparing your current AI assessment against your previous saved report"
              action={
                stats.comparison?.has_previous ? (
                  <Pill color={stats.comparison.score_difference >= 0 ? 'pill-green' : 'pill-red'}>
                    Overall: {stats.comparison.score_difference >= 0 ? '+' : ''}{stats.comparison.score_difference} pts
                  </Pill>
                ) : (
                  <Pill color="pill-blue">First Assessment</Pill>
                )
              }
            />

            {!stats.comparison || !stats.comparison.has_previous ? (
              <div className="card card-pad" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <div className="flex gap-2">
                  <GitCompare size={20} color="#3b82f6" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>First Running Assessment</div>
                    <div className="tiny dim">This is your first running assessment. Previous comparison is not available yet. Upload your next video to track improvement over time!</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-3 mb-3 gap-3">
                  <div className="card card-pad" style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                    <div className="tiny dim">Previous Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#9aa8bd' }}>{stats.comparison.previous_score} / 100</div>
                  </div>
                  <div className="card card-pad" style={{ background: 'rgba(139,92,246,0.08)', borderColor: '#8b5cf6', textAlign: 'center' }}>
                    <div className="tiny dim">Current Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>{stats.comparison.current_score} / 100</div>
                  </div>
                  <div className="card card-pad" style={{ background: stats.comparison.score_difference >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', borderColor: stats.comparison.score_difference >= 0 ? '#22c55e' : '#ef4444', textAlign: 'center' }}>
                    <div className="tiny dim">Score Difference</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: stats.comparison.score_difference >= 0 ? '#4ade80' : '#f87171' }}>
                      {stats.comparison.score_difference >= 0 ? `+${stats.comparison.score_difference}` : stats.comparison.score_difference} pts
                    </div>
                  </div>
                </div>

                <div className="cmp-table mb-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12 }}>
                  <div className="cmp-metric" style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, marginBottom: 8 }}>
                    <span>Metric</span>
                    <span>Previous</span>
                    <span>Current</span>
                    <span style={{ textAlign: 'right' }}>Difference</span>
                  </div>
                  {stats.comparison.metrics_comparison?.map((m) => (
                    <div key={m.metric} className="cmp-metric" style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span className="m-label" style={{ fontWeight: 600 }}>{m.metric}</span>
                      <span className="cmp-val prev" style={{ color: '#9aa8bd' }}>{m.previous}/100</span>
                      <span className="cmp-val cur" style={{ fontWeight: 700 }}>{m.current}/100</span>
                      <span style={{ textAlign: 'right', fontWeight: 700, color: m.difference > 0 ? '#4ade80' : m.difference < 0 ? '#f87171' : '#9aa8bd' }}>
                        {m.difference > 0 ? `+${m.difference}` : m.difference}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 wrap mb-3">
                  {stats.comparison.improvements?.map((imp) => (
                    <Pill key={imp} color="pill-green">✓ Improved: {imp}</Pill>
                  ))}
                  {stats.comparison.areas_that_became_weaker?.map((weak) => (
                    <Pill key={weak} color="pill-red">⚠ Area to work on: {weak}</Pill>
                  ))}
                </div>

                <div className="ai-insight" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)', borderRadius: 12, padding: 12 }}>
                  <Sparkles size={18} color="#a78bfa" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#e2e8f0' }}>{stats.comparison.progress_summary}</span>
                </div>
              </div>
            )}
          </Card>

          <SectionHead title={`${meta.label} Performance Metrics`} sub="Running / Sprinting metrics scored by the AI" />
          <div className="grid grid-3 mb-4">
            {metrics.map((m) => (
              <Card key={m.label} hover pad>
                <div className="metric-top">
                  <span className="metric-name">{m.label}</span>
                  <span className="metric-val text-grad">{m.value}</span>
                </div>
                <Progress value={m.value} h={9} />
                <div className="tiny dim">{m.value >= 85 ? 'Excellent' : m.value >= 75 ? 'Good' : 'Needs work'}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-2">
            <Card pad>
              <SectionHead title="My Strengths" action={<Pill color="pill-green">AI Verified</Pill>} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.strengths.map((s) => (
                  <div key={s} className="strength-item">
                    <div className="check-icon"><Check /></div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card pad>
              <SectionHead title="My Areas to Improve" action={<Pill color="pill-red">Training focus</Pill>} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.weaknesses.map((w) => (
                  <div key={w.name} className="weak-item">
                    <div className="warn-icon"><AlertTriangle /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                      <div className="tiny dim">{w.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-2 mt-4">
            <Card pad>
              <SectionHead title="My Injury Risk" action={<Link to="/player/injury" className="link small">Full dashboard</Link>} />
              <div className="flex between wrap gap-3">
                <div>
                  <div className="tiny dim">Current Risk Level</div>
                  <div className={`risk-pill ${stats.injury?.risk === 'Moderate' ? 'risk-mid' : 'risk-low'} mt-1`}>{stats.injury?.risk || '—'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  {(stats.injury?.areas || []).map((a) => (
                    <div key={a.name} className="flex between" style={{ padding: '7px 0' }}>
                      <span className="tiny muted">{a.name}</span>
                      <span className="flex" style={{ gap: 8 }}>
                        <span className="area-dot" style={{ background: a.dot, alignSelf: 'center' }} />
                        <span className="tiny" style={{ fontWeight: 600 }}>{a.level}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card pad>
              <SectionHead title="My Improvement Suggestions" action={<Pill color="pill-blue">AI Generated</Pill>} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.weaknesses.map((w, i) => (
                  <div key={w.name} className="flex" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <div className="step-num" style={{ width: 26, height: 26, margin: 0, flexShrink: 0, fontSize: 11 }}>{i + 1}</div>
                    <span className="tiny muted">Improve {w.name.toLowerCase()} — {w.impact.toLowerCase()}.</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card glow pad className="mt-4">
            <div className="flex between wrap gap-2">
              <div className="flex" style={{ gap: 10 }}>
                <div className="stat-icon"><Sparkles /></div>
                <div>
                  <div style={{ fontWeight: 700 }}>Next AI Insight</div>
                  <div className="tiny dim">
                    {stats.weaknesses[0] ? `Prioritize ${stats.weaknesses[0].name.toLowerCase()} to raise your overall score.` : 'Keep training consistently and upload your next video for a fresh insight.'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/player/compare" className="btn btn-primary btn-sm">Compare My Videos <ArrowRight size={14} /></Link>
              </div>
            </div>
          </Card>
        </>
      )}
    </Layout>
  )
}
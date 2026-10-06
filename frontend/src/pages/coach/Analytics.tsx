import { ChevronDown } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { Layout } from '../../components/Layout'
import { COACH_NAV } from '../nav'
import { Card, SectionHead, Pill, Ring } from '../../components/ui'
import { ANALYTICS } from '../../data/mock'

const PIE_COLORS = ['#3d8bff', '#8b5cf6', '#22d3ee', '#f59e0b', '#34d399']

export default function Analytics() {
  return (
    <Layout nav={COACH_NAV} title="Recruitment Analytics" crumb="Recruitment Analytics" portal="coach" notifCount={3}>
      <SectionHead
        title="Recruitment Analytics"
        sub="From profile views to final selections — your full recruitment funnel"
        action={<Pill color="pill-green">Success rate {ANALYTICS.successRate}%</Pill>}
      />

      <div className="grid grid-2">
        <Card glow pad>
          <SectionHead title="Recruitment Funnel" />
          <div className="funnel">
            {ANALYTICS.funnel.map((s, i) => (
              <div key={s.stage}>
                <div className={`funnel-stage s${i + 1}`}>
                  <div className="fs-name">{s.stage}</div>
                  <div className="fs-val">{s.value}</div>
                </div>
                {i < ANALYTICS.funnel.length - 1 && (
                  <div className="funnel-arrow center"><ChevronDown /></div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <SectionHead title="Sport-wise Recruitment" />
            <div className="chart-h" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ANALYTICS.sportWise} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={4}>
                    {ANALYTICS.sportWise.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)', color: '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 wrap">
              {ANALYTICS.sportWise.map((s, i) => (
                <span key={s.name} className="pill" style={{ gap: 6 }}>
                  <span className="area-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /> {s.name} {s.value}
                </span>
              ))}
            </div>
          </Card>

          <Card pad>
            <div className="flex between wrap gap-2">
              <SectionHead title="Recruitment Success Rate" />
              <Ring value={ANALYTICS.successRate} size={100} stroke={9} label={`${ANALYTICS.successRate}%`} />
            </div>
          </Card>
        </div>

        <Card pad>
          <SectionHead title="Monthly Recruitment Activity" sub="Players viewed vs selected" />
          <div className="chart-h">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)', color: '#0f172a' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="viewed" stroke="#3d8bff" strokeWidth={3} name="Viewed" />
                <Line type="monotone" dataKey="selected" stroke="#34d399" strokeWidth={3} name="Selected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card pad>
          <SectionHead title="Player Performance Distribution" sub="AI score buckets" />
          <div className="chart-h">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)', color: '#0f172a' }} />
                <Bar dataKey="value" name="Players" fill="#3d8bff" radius={[6, 6, 0, 0]}>
                  {ANALYTICS.distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tiny dim mt-2">Most of your pipeline sits in the 80-100 AI score band — ideal for state-level trials.</div>
        </Card>
      </div>
    </Layout>
  )
}

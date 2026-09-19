import { useState } from 'react'
import { Bell, Lock, User, Palette, Smartphone } from 'lucide-react'
import { Layout } from '../components/Layout'
import { PLAYER_NAV, COACH_NAV } from './nav'
import { Card, SectionHead, Pill } from '../components/ui'
import { useAthlete } from '../context/AthleteContext'
import { SPORT_META, Sport } from '../data/mock'

export default function Settings({ portal }: { portal: 'player' | 'coach' }) {
  const { sport, setSport } = useAthlete()
  const [saved, setSaved] = useState(false)
  const nav = portal === 'player' ? PLAYER_NAV : COACH_NAV

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <Layout
      nav={nav}
      title="Settings"
      crumb="Settings"
      portal={portal}
      notifCount={0}
    >
      <SectionHead title="Settings" sub={portal === 'player' ? 'Manage your athlete profile & preferences' : 'Manage your coach account & preferences'} />

      <div className="grid grid-2">
        <Card pad>
          <div className="flex gap-2 mb-3">
            <User size={18} color="#3d8bff" />
            <h3 className="card-title">Profile</h3>
          </div>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Your full name" />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" placeholder="you@example.com" />
            </div>
            {portal === 'player' ? (
              <div className="field-row">
                <div className="field">
                  <label className="label">Location</label>
                  <input className="input" placeholder="City, State" />
                </div>
                <div className="field">
                  <label className="label">Sport</label>
                  <div className="select" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
                    {SPORT_META[sport].icon} {SPORT_META[sport].label}
                  </div>
                </div>
              </div>
            ) : (
              <div className="field">
                <label className="label">Academy / Club</label>
                <input className="input" placeholder="Academy / club name" />
              </div>
            )}
            <button type="submit" className="btn btn-primary">{saved ? '✓ Saved' : 'Save Changes'}</button>
          </form>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card pad>
            <div className="flex gap-2 mb-3">
              <Bell size={18} color="#a855f7" />
              <h3 className="card-title">Notifications</h3>
            </div>
            {[
              { t: 'AI report ready', d: 'Get notified when analysis finishes', on: true },
              { t: 'New trials in my sport', d: portal === 'player' ? 'Only for your selected sport' : 'New applications', on: true },
              { t: 'Learning recommendations', d: 'New videos matched to your weaknesses', on: false },
              { t: 'Coach activity', d: portal === 'player' ? 'When coaches view your profile' : 'When players respond', on: true },
            ].map((n) => (
              <div key={n.t} className="flex between wrap gap-2" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.t}</div>
                  <div className="tiny dim">{n.d}</div>
                </div>
                <ToggleSwitch on={n.on} />
              </div>
            ))}
          </Card>

          <Card pad>
            <div className="flex gap-2 mb-3">
              <Lock size={18} color="#f59e0b" />
              <h3 className="card-title">Security</h3>
            </div>
            <button className="btn btn-outline btn-sm btn-block">Change Password</button>
            <button className="btn btn-outline btn-sm btn-block mt-2">Two-Factor Authentication</button>
          </Card>
        </div>
      </div>

      {portal === 'player' && (
        <Card pad className="mt-4">
          <div className="flex between wrap gap-2">
            <div className="flex" style={{ gap: 10 }}>
              <div className="stat-icon"><Palette /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Personalization active</div>
                <div className="tiny dim">Your entire app now shows {SPORT_META[sport].icon} {SPORT_META[sport].label} content only</div>
              </div>
            </div>
            <Pill color="pill-blue">{SPORT_META[sport].icon} Sport-locked to {SPORT_META[sport].label}</Pill>
          </div>
        </Card>
      )}

      <Card pad className="mt-4">
        <div className="flex between wrap gap-2">
          <div className="flex" style={{ gap: 10 }}>
            <div className="stat-icon"><Smartphone /></div>
            <div>
              <div style={{ fontWeight: 700 }}>App experience</div>
              <div className="tiny dim">Responsive layout · works on desktop, tablet and mobile</div>
            </div>
          </div>
          <span className="pill pill-green">✓ Synced</span>
        </div>
      </Card>
    </Layout>
  )
}

function ToggleSwitch({ on }: { on: boolean }) {
  const [state, setState] = useState(on)
  return (
    <button
      type="button"
      onClick={() => setState(!state)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', position: 'relative',
        background: state ? 'var(--grad)' : 'rgba(255,255,255,0.14)', transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 99, background: '#fff',
          left: state ? 23 : 3, transition: 'left 0.2s',
        }}
      />
    </button>
  )
}

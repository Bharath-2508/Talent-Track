import { FormEvent, ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, Calendar, MapPin, Target, BarChart3, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Building } from 'lucide-react'
import { Card } from '../components/ui'
import { cx } from '../components/ui'

import { API_BASE } from '../lib/api'

function AuthShell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="auth">
      <div className="bg-orb" />
      <div className="auth-side">
        <Link to="/" className="auth-brand">
          <div className="brand-logo">
            <Zap size={20} />
          </div>
          <div>
            <div className="brand-name">TalentTrack AI</div>
            <div className="brand-sub">Athlete Intelligence</div>
          </div>
        </Link>
        <Card pad className="auth-card">
          {children}
        </Card>
        <div className="auth-foot">
          {aside}
        </div>
      </div>
      <div className="auth-aside">
        <div className="auth-quote">
          Your practice footage already holds the answers.{' '}
          <span className="grad-text">We let the AI read it for you.</span>
        </div>
        <div className="auth-points">
          <div className="auth-point">
            <div className="ap-ic"><BarChart3 /></div>
            Running / Sprinting AI performance reports
          </div>
          <div className="auth-point">
            <div className="ap-ic"><Target /></div>
            Personalized training & learning plans
          </div>
          <div className="auth-point">
            <div className="ap-ic"><CheckCircle2 /></div>
            Discovered by coaches & academies
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className="input"
        placeholder={placeholder}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

export function PlayerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'PLAYER' }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.')
      }

      localStorage.setItem('tt_user', JSON.stringify(data.user))
      localStorage.setItem('tt_token', data.user.token)
      navigate('/player/dashboard')
    } catch (err: any) {
      setError(err.message || 'Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      aside={
        <>
          Don&apos;t have an account? <Link to="/player/register">Create Account</Link>
        </>
      }
    >
      <div className="flex" style={{ gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 30 }}>🏃</span>
        <div>
          <div className="auth-title">Player Login</div>
          <div className="auth-sub" style={{ marginBottom: 0 }}>Welcome back, athlete</div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: 13, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        <div className="field">
          <label className="label">Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <Mail size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="Enter your password" />
        </div>
        <div className="flex between">
          <label className="flex" style={{ gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: '#3d8bff' }} /> Remember me
          </label>
          <Link to="/player/login" className="link tiny">Forgot Password?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'} <ArrowRight size={17} />
        </button>
      </form>
      <div className="divider">OR</div>
      <Link to="/coach/login" className="btn btn-outline btn-block btn-sm">
        Login as Coach
      </Link>
    </AuthShell>
  )
}

export function PlayerRegister() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [location, setLocation] = useState('')
  const [primarySport] = useState('Running / Sprinting')
  const [experience, setExperience] = useState('Intermediate')
  const [position, setPosition] = useState('Sprinter')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PLAYER',
          full_name: fullName,
          email,
          password,
          dob,
          gender,
          location,
          primary_sport: primarySport,
          experience,
          position,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.')
      }

      localStorage.setItem('tt_user', JSON.stringify(data.user))
      localStorage.setItem('tt_token', data.user.token)
      navigate('/player/dashboard')
    } catch (err: any) {
      setError(err.message || 'Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      aside={
        <>
          Already have an account? <Link to="/player/login">Login</Link>
        </>
      }
    >
      <div className="flex" style={{ gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 30 }}>🚀</span>
        <div>
          <div className="auth-title">Create Athlete Profile</div>
          <div className="auth-sub" style={{ marginBottom: 0 }}>Join TalentTrack AI (Saved to Excel)</div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: 13, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }} className="auth-form">
        <div className="field">
          <label className="label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="e.g. Arjun Sharma"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <User size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>
        <div className="field">
          <label className="label">Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <Mail size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="Create a strong password" />
        </div>
        <div className="field-row">
          <div className="field">
            <label className="label">Date of Birth</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="input"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
              <Calendar size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>
          <div className="field">
            <label className="label">Gender</label>
            <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label">Location</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="City, State"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <MapPin size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="label">Primary Sport</label>
            <div className="select" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
              🏃 Running / Sprinting
            </div>
          </div>
          <div className="field">
            <label className="label">Experience Level</label>
            <select className="select" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label">Event / Position</label>
          <input
            className="input"
            placeholder="e.g. Sprinter / 100m & 200m"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Athlete Profile'} <ArrowRight size={17} />
        </button>
      </form>
    </AuthShell>
  )
}

export function CoachLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [primarySport] = useState('Running / Sprinting')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const targetUrl = mode === 'register' ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`
    const bodyData = mode === 'register'
      ? {
          role: 'COACH',
          full_name: fullName,
          email,
          password,
          location,
          primary_sport: primarySport,
        }
      : {
          role: 'COACH',
          email,
          password,
        }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || `${mode === 'register' ? 'Registration' : 'Login'} failed.`)
      }

      localStorage.setItem('tt_user', JSON.stringify(data.user))
      localStorage.setItem('tt_token', data.user.token)
      navigate('/coach/dashboard')
    } catch (err: any) {
      setError(err.message || 'Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      aside={
        <>
          Are you an athlete? <Link to="/player/login">Player Login</Link>
        </>
      }
    >
      <div className="flex" style={{ gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 30 }}>🛡️</span>
        <div>
          <div className="auth-title">{mode === 'login' ? 'Coach Login' : 'Register Coach'}</div>
          <div className="auth-sub" style={{ marginBottom: 0 }}>Recruit your next star athlete</div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: 13, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
        {mode === 'register' && (
          <div className="field">
            <label className="label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                placeholder="Coach Ravi Kumar"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
              <User size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>
        )}

        <div className="field">
          <label className="label">Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="input"
              placeholder="coach@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <Mail size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="Enter your password" />
        </div>

        {mode === 'register' && (
          <div className="field-row">
            <div className="field">
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Sport Focus</label>
              <div className="select" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
                🏃 Running / Sprinting
              </div>
            </div>
          </div>
        )}

        <div className="flex between">
          <span className="tiny dim">Signing in as: <b style={{ color: 'var(--text)' }}>Coach</b></span>
          <button
            type="button"
            className="link tiny"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Processing...' : `${mode === 'login' ? 'Login' : 'Register'} as Coach`} <ArrowRight size={17} />
        </button>
      </form>
    </AuthShell>
  )
}

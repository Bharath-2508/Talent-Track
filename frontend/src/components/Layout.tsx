import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Bell,
  Search,
  Zap,
  LayoutDashboard,
  Upload,
  FileText,
  GraduationCap,
  Calendar,
  TrendingUp,
  GitCompare,
  User,
  Award,
  MapPin,
  Wallet,
  ScrollText,
  Activity,
  Users,
  Compass,
  Settings,
  Home,
  Star,
  Cpu,
  ClipboardList,
  BarChart,
  Send,
} from 'lucide-react'
import { Avatar, cx } from './ui'
import { useAthlete } from '../context/AthleteContext'
import { SPORT_META } from '../data/mock'
import { CelebrationPopupModal, RealPlayerInvitation } from './CelebrationPopupModal'

export type NavItem = { to: string; label: string; icon: string; badge?: string }

export function Layout({
  nav,
  title,
  crumb,
  portal,
  notifCount,
  children,
}: {
  nav: NavItem[]
  title: string
  crumb: string
  portal: 'player' | 'coach'
  notifCount: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sport, athlete, pendingInvitations, refreshStats } = useAthlete()
  const [activePopupInv, setActivePopupInv] = useState<RealPlayerInvitation | null>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (portal === 'player' && pendingInvitations && pendingInvitations.length > 0) {
      const target = pendingInvitations.find((inv) => !sessionStorage.getItem(`ack_inv_${inv.id}`))
      if (target) {
        setActivePopupInv(target)
      } else {
        setActivePopupInv(null)
      }
    } else {
      setActivePopupInv(null)
    }
  }, [portal, pendingInvitations])

  const handleClosePopup = (id: number) => {
    sessionStorage.setItem(`ack_inv_${id}`, 'true')
    setActivePopupInv(null)
  }

  const handleRespondedPopup = async (id: number) => {
    sessionStorage.setItem(`ack_inv_${id}`, 'true')
    setActivePopupInv(null)
    await refreshStats()
  }

  const meta = SPORT_META[sport]
  const home = portal === 'player' ? '/player/dashboard' : '/coach/dashboard'

  const icons = {
    LayoutDashboard: <LayoutDashboard className="nav-icon" />,
    Upload: <Upload className="nav-icon" />,
    FileText: <FileText className="nav-icon" />,
    GraduationCap: <GraduationCap className="nav-icon" />,
    Calendar: <Calendar className="nav-icon" />,
    TrendingUp: <TrendingUp className="nav-icon" />,
    GitCompare: <GitCompare className="nav-icon" />,
    User: <User className="nav-icon" />,
    Award: <Award className="nav-icon" />,
    MapPin: <MapPin className="nav-icon" />,
    Wallet: <Wallet className="nav-icon" />,
    ScrollText: <ScrollText className="nav-icon" />,
    Activity: <Activity className="nav-icon" />,
    Users: <Users className="nav-icon" />,
    Compass: <Compass className="nav-icon" />,
    Settings: <Settings className="nav-icon" />,
    Home: <Home className="nav-icon" />,
    Bell: <Bell className="nav-icon" />,
    Search: <Search className="nav-icon" />,
    Star: <Star className="nav-icon" />,
    Cpu: <Cpu className="nav-icon" />,
    ClipboardList: <ClipboardList className="nav-icon" />,
    BarChart: <BarChart className="nav-icon" />,
    Send: <Send className="nav-icon" />,
  }

  const mobNav = [nav[0], nav[1], nav[2], nav[3], nav[4]].filter(Boolean)

  return (
    <div className="app">
      {/* Real-time Coach Invitation Celebration Popup Modal */}
      {portal === 'player' && activePopupInv && (
        <CelebrationPopupModal
          invitation={activePopupInv}
          onResponded={handleRespondedPopup}
          onClose={handleClosePopup}
        />
      )}

      <div className={cx('bg-orb')} />
      <aside className={cx('sidebar', open && 'open')}>
        <div className="brand">
          <Link to={home} className="brand-logo">
            <Zap size={22} />
          </Link>
          <div>
            <div className="brand-name">TalentTrack AI</div>
            <div className="brand-sub">{portal === 'player' ? 'Athlete Portal' : 'Coach Portal'}</div>
          </div>
          <button className="icon-btn hamburger" onClick={() => setOpen(false)} style={{ marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '4px 8px 2px' }}>
          {portal === 'player' ? (
            <span className="side-chip">
              {meta.icon} {meta.label} Athlete
            </span>
          ) : (
            <span className="side-chip">🛡️ Recruiter</span>
          )}
        </div>
        <div className="side-tag">
          {portal === 'player'
            ? 'Understand and improve your own performance.'
            : 'Discover, evaluate, and recruit talented athletes.'}
        </div>

        <div className="side-label">Menu</div>
        <nav className="side-nav">
          {nav.map((n, i) => {
            const Icon = icons[n.icon as keyof typeof icons]
            const active = pathname === n.to || pathname.startsWith(n.to + '/')
            return (
              <Link key={n.to} to={n.to} className={cx('nav-item', active && 'active')}>
                {Icon}
                {n.label}
                {n.badge && <span className="nav-pill">{n.badge}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="side-user">
          <Avatar index={portal === 'player' ? 1 : 3} size={40} name={athlete.name || JSON.parse(localStorage.getItem('tt_user') || '{}')?.full_name || (portal === 'player' ? 'Athlete' : 'Coach')} />
          <div className="side-user-info">
            <div className="side-user-name">{athlete.name || JSON.parse(localStorage.getItem('tt_user') || '{}')?.full_name || (portal === 'player' ? 'Registered Athlete' : 'Registered Coach')}</div>
            <div className="side-user-role">{portal === 'player' ? 'Sprinter · Running / Sprinting' : 'Recruitment Scout'}</div>
          </div>
        </div>
      </aside>

      <div className={cx('scrim', open && 'show')} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn hamburger" onClick={() => setOpen(true)}>
            <Menu size={19} />
          </button>
          <div>
            <div className="top-title">{title}</div>
            <div className="top-crumb">Home / {crumb}</div>
          </div>
          <div className="top-actions">
            <button className="icon-btn" title="Search">
              <Search />
            </button>
            <button className="icon-btn" title="Profile" onClick={() => navigate(portal === 'player' ? '/player/portfolio' : '/coach/profile')}>
              <User />
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <nav className="mobile-nav">
        {mobNav.map((n, i) => {
          const Icon = icons[n.icon as keyof typeof icons]
          const active = pathname === n.to
          return (
            <Link key={n.to} to={n.to} className={cx('mn-item', active && 'active')}>
              {Icon}
              {n.label.split(' ')[0]}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

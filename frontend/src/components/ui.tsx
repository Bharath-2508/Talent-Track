import { ReactNode } from 'react'

export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ')

export function Card({
  children,
  className,
  hover,
  glow,
  pad,
  style,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  pad?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div className={cx('card', hover && 'card-hover', glow && 'card-glow', pad && 'card-pad', className)} style={style}>
      {children}
    </div>
  )
}

export function SectionHead({
  title,
  sub,
  action,
}: {
  title: ReactNode
  sub?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="sec-title">{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      {action && <div className="sec-action">{action}</div>}
    </div>
  )
}

export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return <span className={cx('pill', color)}>{children}</span>
}

export function Progress({ value, color, h }: { value: number; color?: string; h?: number }) {
  return (
    <div className="bar" style={h ? { height: h } : undefined}>
      <div
        className="bar-fill"
        style={{
          width: `${value}%`,
          ...(color && color !== 'grad' ? { background: color } : {}),
          animationDelay: `${Math.random() * 0.4}s`,
        }}
      />
    </div>
  )
}

export function Ring({
  value,
  size = 150,
  stroke = 11,
  label,
  sub,
  color,
  delay,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sub?: string
  color?: string
  delay?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const id = `g${Math.round(value)}${size}${color || ''}`.replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color || '#3d8bff'} />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.2,0.7,0.3,1)', animationDelay: delay }}
        >
          <animate attributeName="stroke-dashoffset" from={c} to={c * (1 - value / 100)} dur="1.2s" fill="freeze" />
        </circle>
      </svg>
      <div className="ring-label">
        {label && <div className="val text-grad">{label}</div>}
        {sub && <div className="cap">{sub}</div>}
      </div>
    </div>
  )
}

export function Avatar({ name, size = 52, index = 0, style }: { name: string; size?: number; index?: number; style?: React.CSSProperties }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className={cx('ath-avatar', `avatar-grad-${(index % 6) + 1}`)}
      style={{ width: size, height: size, fontSize: size * 0.34, borderRadius: size * 0.3, ...style }}
    >
      {initials}
    </div>
  )
}

export function SportIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  return (
    <span role="img" aria-label="sport" style={{ fontSize: size, lineHeight: 1 }}>
      {icon}
    </span>
  )
}

export function StatCard({
  icon,
  value,
  label,
  sub,
  subClass,
  emoji,
}: {
  icon?: ReactNode
  emoji?: string
  value: ReactNode
  label: string
  sub?: ReactNode
  subClass?: string
}) {
  return (
    <Card hover pad className="stat">
      <div className="stat-icon">{emoji ? <span style={{ fontSize: 22 }}>{emoji}</span> : icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className={cx('stat-sub', subClass)}>{sub}</div>}
      </div>
    </Card>
  )
}

export function ScoreChip({ value }: { value: number }) {
  return <span className="score-chip">✦ {value}</span>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="skill-chip">{children}</span>
}

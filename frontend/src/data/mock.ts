export type Sport = 'running'

export const SPORT_META: Record<Sport, { label: string; icon: string; color: string }> = {
  running: { label: 'Running / Sprinting', icon: '🏃', color: '#3d8bff' },
}

export const SPORTS: Sport[] = ['running']

/** Baseline metric labels used when (re)building an assessment. */
export type Metric = { label: string; value: number }

/* ============ GLOBAL LEARNING CATALOG (not athlete-specific) ============ */

export type LearnVideo = {
  id: number
  sport: Sport
  title: string
  skill: string
  difficulty: string
  duration: string
  why: string
  emoji: string
  gradient: string
  coach: string
}

export const LEARNING_VIDEOS: LearnVideo[] = [
  { id: 1, sport: 'running', title: 'Sprinting Front-Side Mechanics', skill: 'Technique', difficulty: 'Advanced', duration: '12:40', why: 'Covers rail-to-front-side mechanics for stride and knee drive.', emoji: '🏃', gradient: 'linear-gradient(135deg,#1e3a8a,#7c3aed)', coach: 'World Athletics' },
  { id: 2, sport: 'running', title: 'Arm Drive & Posture Masterclass', skill: 'Posture', difficulty: 'Intermediate', duration: '08:15', why: 'Improves arm swing and torso posture for a stable sprint.', emoji: '💪', gradient: 'linear-gradient(135deg,#0e7490,#3d8bff)', coach: 'USATF Coaches' },
  { id: 3, sport: 'running', title: 'Explosive Sprint Start', skill: 'Start', difficulty: 'Advanced', duration: '15:22', why: 'Builds block technique and 0-30m acceleration.', emoji: '⚡', gradient: 'linear-gradient(135deg,#4f46e5,#a855f7)', coach: 'Bolt Club' },
  { id: 4, sport: 'running', title: 'Cadence & Stride Length Drills', skill: 'Cadence', difficulty: 'Beginner', duration: '06:50', why: 'Increases step rate and optimal stride length.', emoji: '🏃', gradient: 'linear-gradient(135deg,#059669,#22d3ee)', coach: 'TalentTrack AI' },
  { id: 5, sport: 'running', title: 'Knee Drive & Leg Recovery', skill: 'Leg / Knee', difficulty: 'Intermediate', duration: '11:30', why: 'Strengthens knee drive for longer, safer strides.', emoji: '🦵', gradient: 'linear-gradient(135deg,#065f46,#34d399)', coach: 'Pro Sprint Club' },
  { id: 6, sport: 'running', title: 'Movement Symmetry & Form Correction', skill: 'Symmetry', difficulty: 'Intermediate', duration: '10:05', why: 'Improves left-right balance and reduces overstriding.', emoji: '⚖️', gradient: 'linear-gradient(135deg,#b45309,#f59e0b)', coach: 'Biomechanics Lab' },
]

/* ============ GLOBAL OPPORTUNITY CATALOGS (not athlete-specific) ============ */

export type Scholarship = {
  id: number
  sport: Sport
  name: string
  org: string
  type: string
  amount: string
  eligibility: string
  deadline: string
}

export const SCHOLARSHIPS: Scholarship[] = [
  { id: 1, sport: 'running', name: 'State Athletics Excellence Scholarship', org: 'Sports Authority of India', type: 'Government', amount: '₹50,000 / year', eligibility: 'U-19, District level or above', deadline: 'Aug 30, 2026' },
  { id: 2, sport: 'running', name: 'AFI Sprint Talent Fund', org: 'Athletics Federation of India', type: 'Private', amount: '₹1,20,000 / year', eligibility: 'Top 10% AI score in State', deadline: 'Sep 15, 2026' },
  { id: 3, sport: 'running', name: 'Club Scholarship – Sprinters', org: 'National Sprint Club', type: 'Club', amount: 'Full fee waiver', eligibility: 'AI technique score above 85', deadline: 'Oct 01, 2026' },
  { id: 4, sport: 'running', name: 'University Sports Quota', org: 'Anna University', type: 'Sports Quota', amount: 'Admission quota + stipend', eligibility: 'State-level participation', deadline: 'Nov 10, 2026' },
  { id: 5, sport: 'running', name: 'Run India Athlete Fund', org: 'Run India / AFI', type: 'Government', amount: '₹75,000 / year', eligibility: 'Under 20, sprint events', deadline: 'Sep 28, 2026' },
]

export type Trial = {
  id: number
  sport: Sport
  name: string
  ageGroup: string
  location: string
  date: string
  org: string
  eligibility: string
  positions: number
}

export const TRIALS: Trial[] = [
  { id: 1, sport: 'running', name: 'District 100m Sprinter Trials', ageGroup: 'U-19', location: 'Chennai', date: 'Aug 22, 2026', org: 'SDAT', eligibility: 'District level, AI score 75+', positions: 12 },
  { id: 2, sport: 'running', name: 'State Sprint Camp – U-19', ageGroup: 'U-19', location: 'Coimbatore', date: 'Sep 05, 2026', org: 'Sports Development Authority', eligibility: 'Any district, AI score 70+', positions: 20 },
  { id: 3, sport: 'running', name: 'U-20 Sprint Combine', ageGroup: 'U-20', location: 'Patiala', date: 'Oct 20, 2026', org: 'AFI', eligibility: '100m under 11.2s', positions: 30 },
  { id: 4, sport: 'running', name: 'Club Track & Field Selection', ageGroup: 'Open', location: 'Delhi', date: 'Oct 02, 2026', org: 'Delhi Athletics Club', eligibility: 'District level', positions: 15 },
]

/* ============ GLOBAL BADGE DEFINITIONS (criteria only, not earned state) ============ */

export const BADGE_CATALOG = [
  { icon: '🏆', name: 'Rising Star', desc: 'Crossed AI score 80' },
  { icon: '⚡', name: 'Speed Master', desc: 'Speed metric above 85' },
  { icon: '🎯', name: 'Precision Expert', desc: 'Technique above 85' },
  { icon: '💪', name: 'Balance Expert', desc: 'Balance score above 80' },
  { icon: '🔥', name: 'Consistency Champion', desc: '5 stable reports in a row' },
  { icon: '🚀', name: 'Level Pro', desc: 'Reach State level' },
]

/* ============ EMPTY / NEUTRAL DATA (no fake athlete data - pages render empty states) ============ */

export type Player = {
  id: number
  name: string
  sport: Sport
  position: string
  age: number
  gender: string
  location: string
  experience: string
  match?: number
  aiScore?: number
  improvement?: number
  speed?: number
  balance?: number
  technique?: number
  trend?: number[]
  skills?: string[]
  shortlisted?: boolean
}

export type Application = {
  id: number
  playerId: number
  status: string
  position: string
  date: string
  sport: Sport
  aiScore?: number
}

export type Coach = {
  name: string
  role: string
  organization: string
  email: string
  phone: string
  region: string
  stats: { label: string; icon: string; value: string | number }[]
}

export type Analytics = {
  successRate: number
  playersTracked: number
  trialsHosted: number
  avgMatch: number
  distribution: { sport: string; count: number }[]
  funnel: { stage: string; value: number }[]
  sportWise: { name: string; value: number }[]
  monthly: { month: string; viewed: number; selected: number }[]
}

export type CoachNotification = {
  id: number
  icon: string
  title: string
  desc: string
  time: string
  read: boolean
  category: string
}

export type SportMetrics = Record<Sport, Metric[]>

export type Badge = {
  icon: string
  name: string
  desc: string
  earned: boolean
  date?: string
}

export type AthleteProfile = {
  name: string
  email: string
  position: string
  sport: Sport
  age: number
  location: string
  experience: string
  overallScore: number
  gender: string
  improvement: number
}

export const STRENGTHS: string[] = []
export const WEAKNESSES: { name: string }[] = []

export type CompareMetric = { metric: string; current: number; prev: number; avg: number; diff: number }
export type CompareData = { metrics: CompareMetric[]; videos: { id: number; title: string; date: string; score: number }[] }

export type Notification = {
  id: number
  icon: string
  title: string
  desc: string
  time: string
  read: boolean
  category: string
}

export type TrainingPlanDay = {
  day: string
  type: string
  title: string
  duration: string
  focus: string
  emoji: string
  intensity: 'Low' | 'Medium' | 'High'
}

/** Empty/neutral exports - pages render empty states when no data */
export const PLAYERS: Player[] = []
export const APPLICATIONS: Application[] = []
export const COACH: Coach = { name: '', role: '', organization: '', email: '', phone: '', region: '', stats: [] }
export const ANALYTICS: Analytics = { successRate: 0, playersTracked: 0, trialsHosted: 0, avgMatch: 0, distribution: [], funnel: [], sportWise: [], monthly: [] }
export const COACH_NOTIFICATIONS: CoachNotification[] = []
export const SPORT_METRICS: SportMetrics = { running: [] }
export const BADGES: Badge[] = []
export const ATHLETE: AthleteProfile = { name: '', email: '', position: '', sport: 'running', age: 0, location: '', experience: '', overallScore: 0, gender: '', improvement: 0 }
export const COMPARE: CompareData = { metrics: [], videos: [] }
export const NOTIFICATIONS: Notification[] = []
export const TRAINING_PLAN: TrainingPlanDay[] = []
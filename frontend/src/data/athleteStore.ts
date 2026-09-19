import type { Sport } from './mock'

export type MetricValue = { label: string; value: number }

export type Weakness = { name: string; impact: string }

export type AthleteRec = { id: number; title: string; desc: string; tag: string; icon: string; cta: string }

export type PlanDay = { day: string; focus: string; type: string; emoji: string; intensity: string }

export type AthleteBadge = { icon: string; name: string; desc: string; earned: boolean; date?: string }

export type TimelineItem = { month: string; score: number; skills: string[]; badge?: string; milestone: string }

export type GrowthPoint = { month: string; score: number }

export type Injury = { risk: string; areas: { name: string; level: string; dot: string }[]; tips: string[] }

export type CareerLevel = { level: string; value: number; color: string }

export type AthleteNotif = {
  id: number
  category: string
  title: string
  desc: string
  time: string
  icon: string
  read: boolean
}

export type VideoRec = {
  id: string
  name: string
  date: string
  size: string
  status: 'Pending' | 'Analyzed'
}

export type Assessment = {
  id: string
  videoId: string
  videoName: string
  date: string
  score: number
  metrics: MetricValue[]
  strengths: string[]
  weaknesses: Weakness[]
  recommendations: AthleteRec[]
  trainingPlan: PlanDay[]
  badges: AthleteBadge[]
  timeline: TimelineItem[]
  growth: GrowthPoint[]
  injury: Injury | null
  careerPotential: CareerLevel[]
}

export type AthleteData = {
  videos: VideoRec[]
  assessments: Assessment[]
  notifications: AthleteNotif[]
}

export function emptyAthleteData(): AthleteData {
  return { videos: [], assessments: [], notifications: [] }
}

const storageKey = (userId: string) => `tt_athlete_data_${userId}`

export function loadAthleteData(userId: string): AthleteData {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return emptyAthleteData()
    const parsed = JSON.parse(raw)
    return {
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
      assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    }
  } catch (e) {
    console.error(e)
    return emptyAthleteData()
  }
}

export function saveAthleteData(userId: string, data: AthleteData) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data))
  } catch (e) {
    console.error(e)
  }
}

export const metricLabels = (sport: Sport) =>
  sport === 'running'
    ? ['Posture', 'Arm Movement', 'Leg / Knee Movement', 'Body Alignment', 'Running Technique', 'Movement Symmetry']
    : []
import { createContext, useContext, useState, ReactNode } from 'react'
import type { Sport } from '../data/mock'
import {
  type AthleteData,
  type AthleteNotif,
  type VideoRec,
  type Assessment,
  type MetricValue,
  type Weakness,
  type AthleteRec,
  type PlanDay,
  type AthleteBadge,
  type TimelineItem,
  type GrowthPoint,
  type Injury,
  type CareerLevel,
  emptyAthleteData,
  loadAthleteData,
  saveAthleteData,
} from '../data/athleteStore'

export type AthleteProfile = {
  id: string
  name: string
  email: string
  dob: string
  gender: string
  location: string
  sport: Sport
  position: string
  experience: string
  level: string
  overallScore: number
  improvement: number
  age?: number
}

export type AthleteStats = {
  latestVideo: VideoRec | null
  overall: number
  improvement: number
  metrics: MetricValue[]
  strengths: string[]
  weaknesses: Weakness[]
  recommendations: AthleteRec[]
  trainingPlan: PlanDay[]
  badges: AthleteBadge[]
  growth: GrowthPoint[]
  timeline: TimelineItem[]
  injury: Injury | null
  careerPotential: CareerLevel[]
}

type AthleteCtx = {
  sport: Sport
  setSport: (s: Sport) => void
  athlete: AthleteProfile
  data: AthleteData
  stats: AthleteStats
  videos: VideoRec[]
  notifications: AthleteNotif[]
  unreadNotifications: number
  addVideo: (name: string, size: string) => VideoRec | null
  addAssessment: (assessment: Assessment) => void
  saveData: (data: AthleteData) => void
  markAllRead: () => void
  logout: () => void
}

const EMPTY_PROFILE: AthleteProfile = {
  id: '',
  name: '',
  email: '',
  dob: '',
  gender: '',
  location: '',
  sport: 'running',
  position: '',
  experience: '',
  level: '',
  overallScore: 0,
  improvement: 0,
}

const EMPTY_STATS: AthleteStats = {
  latestVideo: null,
  overall: 0,
  improvement: 0,
  metrics: [],
  strengths: [],
  weaknesses: [],
  recommendations: [],
  trainingPlan: [],
  badges: [],
  growth: [],
  timeline: [],
  injury: null,
  careerPotential: [],
}

const Ctx = createContext<AthleteCtx>({
  sport: 'running',
  setSport: () => {},
  athlete: EMPTY_PROFILE,
  data: emptyAthleteData(),
  stats: EMPTY_STATS,
  videos: [],
  notifications: [],
  unreadNotifications: 0,
  addVideo: () => null,
  addAssessment: () => {},
  saveData: () => {},
  markAllRead: () => {},
  logout: () => {},
})

function buildProfile(stored: any): AthleteProfile {
  const sport: Sport = 'running'
  const latestScore = 0
  return {
    id: String(stored?.id ?? stored?.email ?? ''),
    name: stored?.full_name || stored?.name || '',
    email: stored?.email || '',
    dob: stored?.dob || '',
    gender: stored?.gender || '',
    location: stored?.location || '',
    sport,
    position: stored?.position || '',
    experience: stored?.experience || '',
    level: stored?.level || '',
    overallScore: latestScore,
    improvement: 0,
  }
}

function readStoredUser(): any {
  try {
    const stored = localStorage.getItem('tt_user')
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.error(e)
    return null
  }
}

export function AthleteProvider({ children }: { children: ReactNode }) {
  const stored = readStoredUser()
  const [user, setUser] = useState<any>(stored)
  const profile = buildProfile(user)
  const userId = profile.id || profile.email

  const [sport, setSport] = useState<Sport>(profile.sport)
  const [data, setData] = useState<AthleteData>(() => (userId ? loadAthleteData(userId) : emptyAthleteData()))

  const latest = data.assessments.length ? data.assessments[data.assessments.length - 1] : null
  const stats: AthleteStats = latest
    ? {
        latestVideo: data.videos.find((v) => v.id === latest.videoId) || data.videos[data.videos.length - 1] || null,
        overall: latest.score,
        improvement: data.assessments.length > 1 ? Math.max(0, latest.score - data.assessments[data.assessments.length - 2].score) : 0,
        metrics: latest.metrics || [],
        strengths: latest.strengths || [],
        weaknesses: latest.weaknesses || [],
        recommendations: latest.recommendations || [],
        trainingPlan: latest.trainingPlan || [],
        badges: latest.badges || [],
        growth: latest.growth || [],
        timeline: latest.timeline || [],
        injury: latest.injury || null,
        careerPotential: latest.careerPotential || [],
      }
    : EMPTY_STATS

  // Keep the exposed profile's overall score in sync with real analysis data.
  const athlete: AthleteProfile = { ...profile, overallScore: stats.overall }

  const persist = (next: AthleteData) => {
    setData(next)
    if (userId) saveAthleteData(userId, next)
  }

  const addVideo = (name: string, size: string): VideoRec | null => {
    if (!userId) return null
    const rec: VideoRec = {
      id: String(Date.now()),
      name,
      date: new Date().toISOString().slice(0, 10),
      size,
      status: 'Pending',
    }
    persist({ ...data, videos: [rec, ...data.videos] })
    return rec
  }

  const addAssessment = (assessment: Assessment) => {
    persist({
      ...data,
      assessments: [...data.assessments, assessment],
      videos: data.videos.map((v) => (v.id === assessment.videoId ? { ...v, status: 'Analyzed' as const } : v)),
    })
  }

  const markAllRead = () => {
    persist({
      ...data,
      notifications: data.notifications.map((n) => ({ ...n, read: true })),
    })
  }

  const logout = () => {
    localStorage.removeItem('tt_user')
    localStorage.removeItem('tt_token')
    setUser(null)
  }

  return (
    <Ctx.Provider
      value={{
        sport,
        setSport,
        athlete,
        data,
        stats,
        videos: data.videos,
        notifications: data.notifications,
        unreadNotifications: data.notifications.filter((n) => !n.read).length,
        addVideo,
        addAssessment,
        saveData: persist,
        markAllRead,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useAthlete = () => useContext(Ctx)
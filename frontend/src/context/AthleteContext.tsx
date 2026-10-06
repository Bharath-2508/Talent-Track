import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import type { Sport } from '../data/mock'
import type {
  AthleteData,
  AthleteNotif,
  VideoRec,
  Assessment,
  MetricValue,
  Weakness,
  AthleteRec,
  PlanDay,
  AthleteBadge,
  TimelineItem,
  GrowthPoint,
  Injury,
  CareerLevel,
} from '../data/athleteStore'
import { emptyAthleteData } from '../data/athleteStore'
import { api } from '../lib/api'

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
  comparison?: {
    has_previous: boolean
    message?: string
    previous_score: number | null
    current_score: number
    score_difference: number
    metrics_comparison: Array<{
      metric: string
      previous: number
      current: number
      difference: number
      status: string
    }>
    improvements: string[]
    areas_that_became_weaker: string[]
    progress_summary: string
  } | null
}

import type { RealPlayerInvitation } from '../components/CelebrationPopupModal'

type AthleteCtx = {
  sport: Sport
  setSport: (s: Sport) => void
  athlete: AthleteProfile
  data: AthleteData
  stats: AthleteStats
  videos: VideoRec[]
  notifications: AthleteNotif[]
  pendingInvitations: RealPlayerInvitation[]
  unreadNotifications: number
  addVideo: (name: string, size: string) => VideoRec | null
  addAssessment: (assessment: Assessment) => void
  saveData: (data: AthleteData) => void
  markAllRead: () => void
  logout: () => void
  refreshStats: () => Promise<void>
}

const EMPTY_PROFILE: AthleteProfile = {
  id: '', name: '', email: '', dob: '', gender: '', location: '',
  sport: 'running', position: '', experience: '', level: '', overallScore: 0, improvement: 0,
}

const EMPTY_STATS: AthleteStats = {
  latestVideo: null, overall: 0, improvement: 0, metrics: [], strengths: [],
  weaknesses: [], recommendations: [], trainingPlan: [], badges: [],
  growth: [], timeline: [], injury: null, careerPotential: [], comparison: null,
}

const Ctx = createContext<AthleteCtx>({
  sport: 'running', setSport: () => {}, athlete: EMPTY_PROFILE,
  data: emptyAthleteData(), stats: EMPTY_STATS, videos: [], notifications: [],
  pendingInvitations: [], unreadNotifications: 0, addVideo: () => null, addAssessment: () => {},
  saveData: () => {}, markAllRead: () => {}, logout: () => {}, refreshStats: async () => {},
})

function readStoredUser(): any {
  try {
    const stored = localStorage.getItem('tt_user')
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function buildProfileFromStored(stored: any): AthleteProfile {
  return {
    id: String(stored?.id ?? ''),
    name: stored?.full_name || stored?.name || '',
    email: stored?.email || '',
    dob: stored?.dob || '',
    gender: stored?.gender || '',
    location: stored?.location || '',
    sport: 'running',
    position: stored?.position || '',
    experience: stored?.experience || '',
    level: '',
    overallScore: 0,
    improvement: 0,
  }
}

export function AthleteProvider({ children }: { children: ReactNode }) {
  const storedUser = readStoredUser()
  const isLoggedIn = !!storedUser && !!localStorage.getItem('tt_token')

  const [profile, setProfile] = useState<AthleteProfile>(
    storedUser ? buildProfileFromStored(storedUser) : EMPTY_PROFILE
  )
  const [stats, setStats] = useState<AthleteStats>(EMPTY_STATS)
  const [videos, setVideos] = useState<VideoRec[]>([])
  const [notifications, setNotifications] = useState<AthleteNotif[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<RealPlayerInvitation[]>([])
  const [data] = useState<AthleteData>(emptyAthleteData())

  const fetchStats = useCallback(async () => {
    const currentUser = readStoredUser()
    const token = localStorage.getItem('tt_token')
    if (!token || !currentUser || currentUser.role !== 'PLAYER') {
      setProfile(EMPTY_PROFILE)
      setStats(EMPTY_STATS)
      setVideos([])
      setNotifications([])
      setPendingInvitations([])
      return
    }

    try {
      const [profileRes, latestRes, growthRes, notifsRes, videosRes, invsRes] = await Promise.allSettled([
        api.get<any>('/player/profile'),
        api.get<any>('/player/analysis/latest'),
        api.get<GrowthPoint[]>('/player/growth'),
        api.get<any[]>('/player/notifications'),
        api.get<any[]>('/player/videos'),
        api.get<RealPlayerInvitation[]>('/player/invitations'),
      ])

      // Profile
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value
        setProfile({
          id: String(p.id),
          name: p.full_name || '',
          email: p.email || '',
          dob: '',
          gender: p.gender || '',
          location: p.location || '',
          sport: 'running',
          position: p.position || '',
          experience: p.experience_years ? `${p.experience_years} yrs` : '',
          level: 'State Athlete',
          overallScore: p.overall_score || 0,
          improvement: 0,
          age: p.age,
        })
      }

      // Analysis
      if (latestRes.status === 'fulfilled') {
        if (latestRes.value?.has_analysis) {
          const an = latestRes.value
          const growth = growthRes.status === 'fulfilled' ? growthRes.value : []
          const prevScore = growth.length > 1 ? growth[growth.length - 2]?.score ?? 0 : 0
          setStats({
            latestVideo: null,
            overall: an.overall_score,
            improvement: Math.max(0, an.overall_score - prevScore),
            metrics: an.metrics || [],
            strengths: an.strengths || [],
            weaknesses: an.weaknesses || [],
            recommendations: an.recommendations || [],
            trainingPlan: an.training_plan || [],
            badges: an.badges || [],
            growth: growth,
            timeline: an.timeline || [],
            injury: an.injury || null,
            careerPotential: an.career_potential || [],
            comparison: an.comparison || null,
          })
          setProfile(prev => ({ ...prev, overallScore: an.overall_score }))
        } else {
          // New player has no video analysis yet — clear previous stats!
          setStats(EMPTY_STATS)
          setProfile(prev => ({ ...prev, overallScore: 0 }))
        }
      } else {
        setStats(EMPTY_STATS)
      }

      // Notifications
      if (notifsRes.status === 'fulfilled') {
        setNotifications(notifsRes.value.map((n: any) => ({
          id: n.id, category: n.category, title: n.title,
          desc: n.desc, time: n.time, icon: n.icon, read: n.read,
        })))
      } else {
        setNotifications([])
      }

      // Videos
      if (videosRes.status === 'fulfilled') {
        setVideos(videosRes.value.map((v: any) => ({
          id: String(v.id), name: v.name, date: v.date, size: v.size, status: v.status === 'done' ? 'Analyzed' : 'Pending',
        })))
      } else {
        setVideos([])
      }

      // Real Invitations
      if (invsRes.status === 'fulfilled' && invsRes.value) {
        const pending = invsRes.value.filter((i) => (i.status || '').toLowerCase() === 'pending')
        setPendingInvitations(pending)
      } else {
        setPendingInvitations([])
      }
    } catch (e) {
      console.warn('fetchStats error:', e)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const addVideo = (name: string, size: string): VideoRec | null => {
    const rec: VideoRec = {
      id: String(Date.now()), name,
      date: new Date().toISOString().slice(0, 10), size, status: 'Pending',
    }
    setVideos(prev => [rec, ...prev])
    return rec
  }

  const addAssessment = (_: Assessment) => {
    // After a real analysis completes, refresh all stats from API
    setTimeout(() => fetchStats(), 1000)
  }

  const markAllRead = async () => {
    if (isLoggedIn && storedUser?.role === 'PLAYER') {
      try {
        await api.put('/player/notifications/read')
      } catch { /* ignore */ }
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const logout = () => {
    localStorage.removeItem('tt_user')
    localStorage.removeItem('tt_token')
    setProfile(EMPTY_PROFILE)
    setStats(EMPTY_STATS)
    setVideos([])
    setNotifications([])
  }

  const athlete: AthleteProfile = { ...profile, overallScore: stats.overall }

  return (
    <Ctx.Provider value={{
      sport: 'running',
      setSport: () => {},
      athlete,
      data,
      stats,
      videos,
      notifications,
      pendingInvitations,
      unreadNotifications: notifications.filter(n => !n.read).length,
      addVideo,
      addAssessment,
      saveData: () => {},
      markAllRead,
      logout,
      refreshStats: fetchStats,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAthlete = () => useContext(Ctx)
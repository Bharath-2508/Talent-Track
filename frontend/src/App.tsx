import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AthleteProvider } from './context/AthleteContext'
import Landing from './pages/Landing'
import { PlayerLogin, PlayerRegister, CoachLogin } from './pages/Auth'

import PlayerDashboard from './pages/player/Dashboard'
import UploadVideo from './pages/player/Upload'
import AiDetection from './pages/player/Detection'
import PerformanceReport from './pages/player/Report'
import TrainingPlan from './pages/player/Training'
import LearningHub from './pages/player/Learn'
import Portfolio from './pages/player/Portfolio'
import GrowthTimeline from './pages/player/Timeline'
import VideoComparison from './pages/player/Compare'
import Achievements from './pages/player/Achievements'
import CareerPotential from './pages/player/Career'
import InjuryRisk from './pages/player/Injury'
import Scholarships from './pages/player/Scholarships'
import Trials from './pages/player/Trials'
import Notifications from './pages/player/Notifications'
import Resume from './pages/player/Resume'

import CoachDashboard from './pages/coach/Dashboard'
import AllPlayers from './pages/coach/AllPlayers'
import TalentSearch from './pages/coach/Search'
import Recommendations from './pages/coach/Recommendations'
import ComparePlayers from './pages/coach/ComparePlayers'
import PlayerProfile from './pages/coach/PlayerProfile'
import Shortlisted from './pages/coach/Shortlisted'
import Invitations from './pages/coach/Invitations'
import CoachTrials from './pages/coach/Trials'
import Applications from './pages/coach/Applications'
import Analytics from './pages/coach/Analytics'
import CoachNotifications from './pages/coach/Notifications'
import CoachProfile from './pages/coach/Profile'

import Settings from './pages/Settings'

export default function App() {
  return (
    <AthleteProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/player/login" element={<PlayerLogin />} />
          <Route path="/player/register" element={<PlayerRegister />} />

          <Route path="/player/dashboard" element={<PlayerDashboard />} />
          <Route path="/player/upload" element={<UploadVideo />} />
          <Route path="/player/analyze" element={<AiDetection />} />
          <Route path="/player/report" element={<PerformanceReport />} />
          <Route path="/player/training" element={<TrainingPlan />} />
          <Route path="/player/learn" element={<LearningHub />} />
          <Route path="/player/portfolio" element={<Portfolio />} />
          <Route path="/player/timeline" element={<GrowthTimeline />} />
          <Route path="/player/compare" element={<VideoComparison />} />
          <Route path="/player/achievements" element={<Achievements />} />
          <Route path="/player/career" element={<CareerPotential />} />
          <Route path="/player/injury" element={<InjuryRisk />} />
          <Route path="/player/scholarships" element={<Scholarships />} />
          <Route path="/player/trials" element={<Trials />} />
          <Route path="/player/notifications" element={<Notifications />} />
          <Route path="/player/resume" element={<Resume />} />
          <Route path="/player/settings" element={<Settings portal="player" />} />

          <Route path="/coach/login" element={<CoachLogin />} />
          <Route path="/coach/dashboard" element={<CoachDashboard />} />
          <Route path="/coach/players" element={<AllPlayers />} />
          <Route path="/coach/search" element={<TalentSearch />} />
          <Route path="/coach/recommendations" element={<Recommendations />} />
          <Route path="/coach/compare" element={<ComparePlayers />} />
          <Route path="/coach/player/:id" element={<PlayerProfile />} />
          <Route path="/coach/shortlisted" element={<Shortlisted />} />
          <Route path="/coach/invitations" element={<Invitations />} />
          <Route path="/coach/trials" element={<CoachTrials />} />
          <Route path="/coach/applications" element={<Applications />} />
          <Route path="/coach/analytics" element={<Analytics />} />
          <Route path="/coach/notifications" element={<CoachNotifications />} />
          <Route path="/coach/profile" element={<CoachProfile />} />
          <Route path="/coach/settings" element={<Settings portal="coach" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AthleteProvider>
  )
}

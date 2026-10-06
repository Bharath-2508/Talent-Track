import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, Building, MapPin, Calendar, X, Sparkles } from 'lucide-react'
import { Pill } from './ui'
import { api } from '../lib/api'

export type RealPlayerInvitation = {
  id: number
  coach_id: number
  coach_name: string
  coach_organization: string
  coach_speciality: string
  coach_location: string
  trial_id: number | null
  trial_name: string
  trial_location: string
  trial_date: string
  message: string
  status: string
  created_at: string
}

type Props = {
  invitation: RealPlayerInvitation
  onResponded: (invitationId: number, newStatus: string) => void
  onClose: (invitationId: number) => void
}

export function CelebrationPopupModal({ invitation, onResponded, onClose }: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null)

  const handleAction = async (action: 'accepted' | 'declined') => {
    setSubmitting(action)
    try {
      await api.post(`/player/invitations/${invitation.id}/respond`, { action })
      onResponded(invitation.id, action)
    } catch (e) {
      console.error('Failed to respond to invitation:', e)
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 99999,
        background: 'rgba(5, 10, 25, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* CSS Confetti & Celebration Animations */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
        @keyframes popup-pop {
          0% { transform: scale(0.85) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes trophy-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.9)); }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 14px;
          top: -20px;
          border-radius: 3px;
          animation: confetti-fall 3.5s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Floating Confetti Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { left: '10%', bg: '#fbbf24', delay: '0s' },
          { left: '25%', bg: '#38bdf8', delay: '0.4s' },
          { left: '40%', bg: '#34d399', delay: '1.2s' },
          { left: '55%', bg: '#a78bfa', delay: '0.8s' },
          { left: '70%', bg: '#f43f5e', delay: '0.2s' },
          { left: '85%', bg: '#fbbf24', delay: '1.6s' },
        ].map((c, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{ left: c.left, backgroundColor: c.bg, animationDelay: c.delay }}
          />
        ))}
      </div>

      <div
        className="modal-content"
        style={{
          maxWidth: 520,
          width: '100%',
          background: '#ffffff',
          border: '2px solid #6366f1',
          boxShadow: '0 20px 50px -10px rgba(99, 102, 241, 0.25)',
          padding: '28px 24px',
          borderRadius: 24,
          position: 'relative',
          animation: 'popup-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          color: '#0f172a',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose(invitation.id)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Header Badge & Animated Trophy */}
        <div className="text-center mb-3">
          <div style={{ fontSize: 52, animation: 'trophy-pulse 2.5s infinite ease-in-out', display: 'inline-block' }}>
            🏆
          </div>
          <div className="mt-2">
            <Pill color="pill-purple">
              <Sparkles size={12} /> OFFICIAL TRIAL INVITATION
            </Pill>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 10, marginBottom: 4 }}>
            Congratulations! You Have a New Trial Invitation
          </h2>
          <p style={{ color: '#818cf8', fontWeight: 600, fontSize: 15 }}>
            Coach {invitation.coach_name} has invited you for a trial.
          </p>
        </div>

        {/* Real Backend Coach & Trial Info Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: 10 }}>
            Scouting Coach Details
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>
            {invitation.coach_name}
          </div>
          {invitation.coach_organization && (
            <div className="tiny dim flex" style={{ gap: 6, alignItems: 'center', marginTop: 4 }}>
              <Building size={13} color="#818cf8" /> {invitation.coach_organization}
            </div>
          )}
          {invitation.coach_location && (
            <div className="tiny dim flex" style={{ gap: 6, alignItems: 'center', marginTop: 4 }}>
              <MapPin size={13} color="#34d399" /> {invitation.coach_location}
            </div>
          )}

          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '12px 0' }} />

          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
            Trial Opportunity
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8' }}>
            {invitation.trial_name}
          </div>
          {invitation.trial_date && (
            <div className="tiny dim flex" style={{ gap: 6, alignItems: 'center', marginTop: 4 }}>
              <Calendar size={13} /> {invitation.trial_date}
            </div>
          )}

          {invitation.message && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                fontSize: 13,
                color: '#cbd5e1',
                fontStyle: 'italic',
                borderLeft: '3px solid #818cf8',
              }}
            >
              "{invitation.message}"
            </div>
          )}
        </div>

        {/* Real Action Buttons */}
        <div className="flex gap-2 wrap">
          <button
            className="btn btn-primary"
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#10b981',
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 700,
            }}
            onClick={() => handleAction('accepted')}
            disabled={submitting !== null}
          >
            <CheckCircle2 size={16} /> {submitting === 'accepted' ? 'Accepting...' : 'Accept Invitation'}
          </button>
          <button
            className="btn btn-outline"
            style={{
              flex: 1,
              borderColor: '#f43f5e',
              color: '#f43f5e',
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 700,
            }}
            onClick={() => handleAction('declined')}
            disabled={submitting !== null}
          >
            <XCircle size={16} /> {submitting === 'declined' ? 'Declining...' : 'Decline Invitation'}
          </button>
        </div>
      </div>
    </div>
  )
}

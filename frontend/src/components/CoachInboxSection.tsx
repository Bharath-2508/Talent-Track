import React, { useEffect, useState, useCallback } from 'react'
import {
  Mail,
  MailOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building,
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Phone,
  User,
  History,
  Inbox,
} from 'lucide-react'
import { Card, SectionHead, Pill, Avatar } from './ui'
import { api } from '../lib/api'
import { useAthlete } from '../context/AthleteContext'

export type InvitationResponse = {
  id: number
  athlete_name: string
  athlete_email: string
  athlete_phone: string
  response_type: string
  message: string
  created_at: string
}

export type PlayerInvitation = {
  id: number
  coach_id: number
  coach_name: string
  coach_organization: string
  coach_speciality: string
  coach_location: string
  coach_email: string
  subject: string
  message: string
  status: string // 'pending' | 'read' | 'interested' | 'declined'
  read_at: string | null
  created_at: string
  trial_id: number | null
  trial_name: string
  trial_location: string
  trial_date: string
  trial_org: string
  response: InvitationResponse | null
}

const STATUS_CONFIG: Record<
  string,
  { label: string; pill: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Unread',
    pill: 'pill-blue',
    icon: <Mail size={12} />,
  },
  read: {
    label: 'Read',
    pill: 'pill-amber',
    icon: <MailOpen size={12} />,
  },
  interested: {
    label: 'Accepted',
    pill: 'pill-green',
    icon: <CheckCircle2 size={12} />,
  },
  accepted: {
    label: 'Accepted',
    pill: 'pill-green',
    icon: <CheckCircle2 size={12} />,
  },
  declined: {
    label: 'Rejected',
    pill: 'pill-red',
    icon: <XCircle size={12} />,
  },
}

export function CoachInboxSection() {
  const { athlete } = useAthlete()
  const [invitations, setInvitations] = useState<PlayerInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInv, setSelectedInv] = useState<PlayerInvitation | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // Contact form state
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddr, setEmailAddr] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')

  const fetchInvitations = useCallback(async () => {
    try {
      const data = await api.get<PlayerInvitation[]>('/player/invitations')
      setInvitations(data || [])
    } catch (e) {
      console.error('Failed to load invitations:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  // Active invitations (Pending / Read - waiting for response)
  const activeInvitations = invitations.filter(
    (i) => i.status === 'pending' || i.status === 'read'
  )

  // Responded invitations (Accepted / Declined)
  const respondedInvitations = invitations.filter(
    (i) => i.status === 'interested' || i.status === 'accepted' || i.status === 'declined'
  )

  const unreadCount = activeInvitations.filter(
    (i) => i.status === 'pending' || !i.read_at
  ).length

  // Open invitation modal & mark read in backend DB
  const handleOpenInvitation = async (inv: PlayerInvitation) => {
    setSelectedInv(inv)
    setValidationError('')
    setSuccessToast('')

    // If unread, mark read in backend DB
    if (inv.status === 'pending' || !inv.read_at) {
      try {
        const updated = await api.get<PlayerInvitation>(`/player/invitations/${inv.id}`)
        if (updated) {
          setSelectedInv(updated)
          fetchInvitations()
        }
      } catch (e) {
        console.error('Error marking invitation as read:', e)
      }
    }
  }

  // Open "I'm Interested" contact modal
  const handleStartInterested = () => {
    setFullName(athlete.name || '')
    setEmailAddr(athlete.email || '')
    setPhoneNumber('')
    setValidationError('')
    setShowContactModal(true)
  }

  // Submit contact form to coach backend
  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInv) return

    setValidationError('')

    // Phone validation: required & at least 7 digits
    const cleanPhone = phoneNumber.trim()
    const digitsOnly = cleanPhone.replace(/[^\d]/g, '')
    if (!cleanPhone || digitsOnly.length < 7) {
      setValidationError('Please enter a valid phone number (at least 7 digits).')
      return
    }

    // Email validation
    const cleanEmail = emailAddr.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)

    try {
      const res = await api.post<{
        success: boolean
        already_responded?: boolean
        message?: string
        response?: InvitationResponse
      }>(`/player/invitations/${selectedInv.id}/interested`, {
        athlete_name: fullName.trim() || athlete.name || 'Athlete',
        athlete_phone: cleanPhone,
        athlete_email: cleanEmail,
        message: `${fullName.trim()} is interested in attending the trial.`,
      })

      if (res && (res.success || res.already_responded)) {
        setSuccessToast('Response sent to coach! Invitation accepted and moved to history.')
        setShowContactModal(false)

        await fetchInvitations()

        // Close detail modal after brief toast so it disappears from active inbox
        setTimeout(() => {
          setSelectedInv(null)
          setSuccessToast('')
        }, 1500)
      } else {
        setValidationError(res?.message || 'Failed to submit response. Please try again.')
      }
    } catch (err: any) {
      console.error('Submit contact error:', err)
      setValidationError(err?.response?.data?.detail || err.message || 'Failed to send response.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Decline (Reject)
  const handleDecline = async () => {
    if (!selectedInv) return
    setSubmitting(true)
    try {
      await api.post(`/player/invitations/${selectedInv.id}/decline`, {})
      setSuccessToast('Invitation declined and moved to history.')
      await fetchInvitations()

      // Close detail modal after brief toast so it disappears from active inbox
      setTimeout(() => {
        setSelectedInv(null)
        setSuccessToast('')
      }, 1500)
    } catch (err: any) {
      console.error('Decline error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const listToRender = activeTab === 'active' ? activeInvitations : respondedInvitations

  return (
    <div className="mt-4 mb-4">
      {/* Permanent Header & Box in My Growth */}
      <Card glow pad>
        <SectionHead
          title="Coach Invitations & Direct Messages"
          sub="Official trial invitations and messages sent to you by verified coaches"
          action={
            <div className="flex gap-2">
              <Pill color="pill-blue">
                <Mail size={12} /> {activeInvitations.length} Active
              </Pill>
              {unreadCount > 0 && (
                <Pill color="pill-green">
                  <Clock size={12} /> {unreadCount} Unread
                </Pill>
              )}
            </div>
          }
        />

        {/* Tab Switcher: Active Inbox vs Responded History */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <button
            className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('active')}
            style={{ fontWeight: 700 }}
          >
            <Inbox size={14} /> Active Messages ({activeInvitations.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('history')}
            style={{ fontWeight: 700 }}
          >
            <History size={14} /> Responded / History ({respondedInvitations.length})
          </button>
        </div>

        {loading ? (
          <div className="empty" style={{ minHeight: 120 }}>
            <div className="empty-ic">⏳</div>
            <h4>Loading coach messages...</h4>
          </div>
        ) : listToRender.length === 0 ? (
          <div className="empty" style={{ minHeight: 140 }}>
            <div className="empty-ic">📬</div>
            <h3>
              {activeTab === 'active'
                ? activeInvitations.length === 0 && respondedInvitations.length > 0
                  ? 'All invitations responded to!'
                  : 'No active coach invitations'
                : 'No responded invitations history yet'}
            </h3>
            <p>
              {activeTab === 'active'
                ? activeInvitations.length === 0 && respondedInvitations.length > 0
                  ? 'You have responded to all received invitations. Switch to "Responded / History" to view past responses.'
                  : 'Verified coaches review top talent on TalentTrack. Keep uploading and improving your score to receive direct trial invitations.'
                : 'Invitations you accept or decline will be archived here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listToRender.map((inv) => {
              const isUnread = inv.status === 'pending' || !inv.read_at
              const st = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending

              return (
                <div
                  key={inv.id}
                  onClick={() => handleOpenInvitation(inv)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: isUnread
                      ? 'rgba(59, 130, 246, 0.08)'
                      : 'var(--panel)',
                    border: isUnread
                      ? '1px solid rgba(59, 130, 246, 0.35)'
                      : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                  className="hover-card"
                >
                  <div className="flex between wrap gap-2" style={{ alignItems: 'center' }}>
                    <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
                      <Avatar name={inv.coach_name} index={inv.coach_id} size={42} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: isUnread ? 800 : 600, fontSize: 15 }}>
                            {inv.coach_name}
                          </span>
                          {isUnread && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: 'var(--blue)',
                                display: 'inline-block',
                              }}
                            />
                          )}
                        </div>
                        <div className="tiny dim flex gap-2" style={{ alignItems: 'center' }}>
                          <Building size={12} /> {inv.coach_organization} · {inv.coach_speciality}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                      <span className="tiny dim">{inv.created_at || 'Recent'}</span>
                      <span className={`pill ${st.pill}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Preview */}
                  <div style={{ marginTop: 4 }}>
                    <div
                      style={{
                        fontWeight: isUnread ? 700 : 500,
                        fontSize: 14,
                        color: isUnread ? 'var(--text-bright)' : 'var(--text)',
                      }}
                    >
                      {inv.subject}
                    </div>
                    <div
                      className="tiny dim"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '90%',
                        marginTop: 2,
                      }}
                    >
                      {inv.message}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* GMAIL-LIKE INDIVIDUAL MESSAGE MODAL */}
      {selectedInv && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedInv(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              color: '#0f172a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <Mail className="text-blue" size={20} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  Coach Invitation & Message
                </h3>
              </div>
              <button
                onClick={() => setSelectedInv(null)}
                className="btn btn-sm btn-outline"
                style={{ borderRadius: '50%', padding: 6, minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Success Toast */}
              {successToast && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{successToast}</span>
                </div>
              )}

              {/* Coach details header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: 14,
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div className="flex gap-3" style={{ alignItems: 'center' }}>
                  <Avatar name={selectedInv.coach_name} index={selectedInv.coach_id} size={48} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedInv.coach_name}</div>
                    <div className="tiny dim">
                      {selectedInv.coach_organization} · {selectedInv.coach_speciality}
                    </div>
                    <div className="tiny dim flex gap-1 mt-1" style={{ alignItems: 'center' }}>
                      <MapPin size={11} /> {selectedInv.coach_location}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tiny dim">{selectedInv.created_at}</div>
                  <span className={`pill ${STATUS_CONFIG[selectedInv.status]?.pill || 'pill-blue'} mt-1`}>
                    {STATUS_CONFIG[selectedInv.status]?.icon} {STATUS_CONFIG[selectedInv.status]?.label}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="tiny dim uppercase" style={{ letterSpacing: 0.5, fontWeight: 700 }}>
                  SUBJECT
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>
                  {selectedInv.subject}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="tiny dim uppercase" style={{ letterSpacing: 0.5, fontWeight: 700 }}>
                  MESSAGE FROM COACH
                </div>
                <div
                  style={{
                    marginTop: 6,
                    padding: 14,
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    lineHeight: 1.6,
                    fontSize: 14,
                    color: '#334155',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {selectedInv.message}
                </div>
              </div>

              {/* Trial details if available */}
              {selectedInv.trial_name && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div className="tiny text-blue uppercase" style={{ fontWeight: 700 }}>
                    🏆 TRIAL EVALUATION DETAILS
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                    {selectedInv.trial_name}
                  </div>
                  <div className="tiny dim flex wrap gap-3 mt-2">
                    <span className="flex gap-1" style={{ alignItems: 'center' }}>
                      <Calendar size={12} /> {selectedInv.trial_date}
                    </span>
                    <span className="flex gap-1" style={{ alignItems: 'center' }}>
                      <MapPin size={12} /> {selectedInv.trial_location}
                    </span>
                    <span className="flex gap-1" style={{ alignItems: 'center' }}>
                      <Building size={12} /> {selectedInv.trial_org}
                    </span>
                  </div>
                </div>
              )}

              {/* If already responded: Display response details */}
              {selectedInv.response || selectedInv.status === 'interested' || selectedInv.status === 'accepted' || selectedInv.status === 'declined' ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background:
                      selectedInv.status === 'declined'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(52, 211, 153, 0.08)',
                    border:
                      selectedInv.status === 'declined'
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(52, 211, 153, 0.3)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color:
                        selectedInv.status === 'declined'
                          ? '#f87171'
                          : '#34d399',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {selectedInv.status === 'declined' ? (
                      <XCircle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <span>
                      Response Status:{' '}
                      {selectedInv.status === 'declined'
                        ? 'Rejected / Declined'
                        : "Accepted / Interested"}
                    </span>
                  </div>

                  {selectedInv.response && selectedInv.status !== 'declined' && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#e2e8f0' }}>
                      <div className="tiny dim" style={{ marginBottom: 4 }}>
                        Contact Details Submitted to Coach {selectedInv.coach_name}:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <strong>Name:</strong> {selectedInv.response.athlete_name}
                        </div>
                        <div>
                          <strong>Phone:</strong> {selectedInv.response.athlete_phone}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <strong>Email:</strong> {selectedInv.response.athlete_email}
                        </div>
                        <div className="tiny dim" style={{ gridColumn: 'span 2' }}>
                          Submitted on {selectedInv.response.created_at}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="tiny dim mt-2" style={{ fontStyle: 'italic' }}>
                    This invitation has been responded to and moved to your Responded History.
                  </div>
                </div>
              ) : (
                /* Action buttons if not yet responded */
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 16,
                  }}
                >
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleStartInterested}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderColor: '#10b981',
                      fontWeight: 700,
                      padding: '10px 16px',
                    }}
                  >
                    <CheckCircle2 size={16} /> I'm Interested
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={handleDecline}
                    disabled={submitting}
                    style={{
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                    }}
                  >
                    <XCircle size={16} /> Decline
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedInv(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTACT FORM CONFIRMATION MODAL */}
      {showContactModal && selectedInv && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#ffffff',
              border: '1px solid #10b981',
              borderRadius: 16,
              boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)',
              padding: 24,
              color: '#0f172a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex between" style={{ alignItems: 'center', marginBottom: 16 }}>
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <Send className="text-green" size={20} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  Send Contact Details to Coach
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="btn btn-sm btn-outline"
                style={{ borderRadius: '50%', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <p className="tiny dim mb-3" style={{ lineHeight: 1.5 }}>
              Coach <strong>{selectedInv.coach_name}</strong> ({selectedInv.coach_organization}) will receive your confirmed phone number and email address to arrange your trial.
            </p>

            {/* Validation Error Alert */}
            {validationError && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitContactForm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full Name */}
              <div>
                <label className="tiny dim uppercase" style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }}
                  />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: 36, width: '100%' }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="tiny dim uppercase" style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Personal Phone Number <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }}
                  />
                  <input
                    type="tel"
                    className="input"
                    style={{ paddingLeft: 36, width: '100%' }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    required
                  />
                </div>
                <div className="tiny dim mt-1">Must be a valid phone number (at least 7 digits)</div>
              </div>

              {/* Email Address */}
              <div>
                <label className="tiny dim uppercase" style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Email Address <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }}
                  />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: 36, width: '100%' }}
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    placeholder="e.g. athlete@example.com"
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 8,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: 16,
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#10b981',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? 'Sending...' : 'Submit Contact Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

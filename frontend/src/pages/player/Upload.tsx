import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Video, CheckCircle2, ArrowRight, Film, CloudUpload, AlertCircle } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { SPORT_META } from '../../data/mock'
import { api } from '../../lib/api'

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function UploadVideo() {
  const navigate = useNavigate()
  const { sport, addVideo, refreshStats } = useAthlete()
  const meta = SPORT_META[sport]
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<number | null>(null)
  const [filename, setFilename] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file || stage === 'uploading' || stage === 'processing') return
    setError(null)
    setFilename(file.name)
    setStage('uploading')
    setProgress(10)

    try {
      // 1. Upload video to backend
      const uploadRes = await api.upload<{ video_id: number; filename: string }>('/player/upload', file)
      setProgress(50)
      const vid = uploadRes.video_id
      setVideoId(vid)
      addVideo(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`)

      // 2. Trigger AI analysis
      await api.post(`/analyze/${vid}`)
      setProgress(70)
      setStage('processing')

      // 3. Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.get<{ status: string; error?: string }>(`/analyze/status/${vid}`)
          if (status.status === 'done') {
            clearInterval(pollInterval)
            await refreshStats()
            setProgress(100)
            setStage('done')
          } else if (status.status === 'error') {
            clearInterval(pollInterval)
            setError(status.error || 'Analysis failed. Please try again.')
            setStage('error')
          } else {
            setProgress((p) => Math.min(p + 5, 90))
          }
        } catch {
          clearInterval(pollInterval)
          setError('Lost connection to server. Please refresh.')
          setStage('error')
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
      setStage('error')
    }
  }

  const startUpload = () => {
    if (inputRef.current?.files?.[0]) handleFile(inputRef.current.files[0])
  }

  const statusLabel = () => {
    if (stage === 'uploading') {
      if (progress < 50) return 'Uploading video to secure storage…'
      return 'Starting AI analysis pipeline…'
    }
    if (stage === 'processing') {
      if (progress < 80) return 'Extracting frames & estimating pose…'
      return 'Scoring running metrics…'
    }
    return ''
  }

  return (
    <Layout nav={PLAYER_NAV} title="Upload Running / Sprinting Video" crumb="Upload Video" portal="player" notifCount={2}>
      <SectionHead
        title="Upload Running / Sprinting Video"
        sub={`Our AI will analyze your ${meta.label.toLowerCase()} performance automatically.`}
      />

      <div className="grid grid-2">
        <Card pad>
          <div
            className={drag ? 'upload-zone drag' : 'upload-zone'}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]) }}
            onClick={() => stage === 'idle' && inputRef.current?.click()}
          >
            <div className="uz-ic"><CloudUpload /></div>
            <div className="uz-title">Drop your practice video here</div>
            <div className="uz-sub">MP4, MOV, WEBM · Up to 2 minutes · Max 500 MB</div>
            <div className="flex center" style={{ justifyContent: 'center', gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                disabled={stage !== 'idle' && stage !== 'error'}
              >
                <Upload size={16} /> Upload Video
              </button>
            </div>
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {(stage === 'uploading' || stage === 'processing') && (
            <div className="mt-4">
              <div className="flex between mb-1">
                <span className="tiny" style={{ fontWeight: 600 }}>{filename}</span>
                <span className="tiny dim">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="fill" style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div className="mt-2 tiny dim">{statusLabel()}</div>
            </div>
          )}

          {stage === 'error' && (
            <div className="mt-4 card card-pad" style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#ef4444' }}>
              <div className="flex gap-2">
                <AlertCircle size={20} color="#ef4444" />
                <div>
                  <div style={{ fontWeight: 700 }}>Upload failed</div>
                  <div className="tiny dim">{error}</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm mt-3" onClick={() => { setStage('idle'); setProgress(0); setError(null) }}>
                Try again
              </button>
            </div>
          )}

          {stage === 'done' && (
            <div className="mt-4 card card-pad" style={{ background: 'var(--grad-soft)', borderColor: 'var(--grad-border)' }}>
              <div className="flex gap-2">
                <CheckCircle2 size={22} color="#34d399" />
                <div>
                  <div style={{ fontWeight: 700 }}>Analysis complete!</div>
                  <div className="tiny dim">{filename} · AI score ready</div>
                </div>
              </div>
              <button className="btn btn-primary btn-block mt-3" onClick={() => navigate('/player/report')}>
                View My AI Report <ArrowRight size={16} />
              </button>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card glow pad>
            <SectionHead title="How AI Analysis Works" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '01', t: 'Upload video', d: 'Record your running session in good lighting, full body in frame.' },
                { n: '02', t: 'Frame extraction', d: 'OpenCV extracts frames every 3rd frame from your video.' },
                { n: '03', t: 'Pose estimation', d: 'MediaPipe Pose computes 33 body landmarks per frame.' },
                { n: '04', t: 'Metric scoring', d: '6 biomechanical metrics scored against benchmark ranges.' },
                { n: '05', t: 'Personalized plan', d: 'Training plan, recommendations & badges generated from your weaknesses.' },
              ].map((s) => (
                <div key={s.n} className="flex" style={{ gap: 14, alignItems: 'flex-start' }}>
                  <div className="step-num" style={{ width: 30, height: 30, margin: 0, flexShrink: 0, fontSize: 12 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.t}</div>
                    <div className="tiny dim">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card pad>
            <div className="flex gap-2">
              <Film size={20} color="#3d8bff" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Pro tips for best analysis</div>
                <div className="tiny dim mt-1">Use a tripod · Side-on camera angle · Full body visible · Good lighting</div>
              </div>
            </div>
            <div className="mt-3">
              <Pill color="pill-blue">{meta.icon} Analysis locked to {meta.label}</Pill>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

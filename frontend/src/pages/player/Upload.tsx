import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Video, CheckCircle2, ArrowRight, Film, CloudUpload } from 'lucide-react'
import { Layout } from '../../components/Layout'
import { PLAYER_NAV } from '../nav'
import { Card, SectionHead, Pill } from '../../components/ui'
import { useAthlete } from '../../context/AthleteContext'
import { SPORT_META } from '../../data/mock'

type Stage = 'idle' | 'uploading' | 'done'

export default function UploadVideo() {
  const navigate = useNavigate()
  const { sport } = useAthlete()
  const meta = SPORT_META[sport]
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const simulate = () => {
    setStage('uploading')
    setProgress(0)
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer)
          setStage('done')
          return 100
        }
        return p + 7
      })
    }, 160)
  }

  const startUpload = () => {
    if (stage === 'uploading') return
    simulate()
  }

  return (
    <Layout nav={PLAYER_NAV} title="Upload Running / Sprinting Video" crumb="Upload Video" portal="player" notifCount={2}>
      <SectionHead
        title="Upload Running / Sprinting Video"
        sub={`Our AI will analyze my ${meta.label.toLowerCase()} performance automatically.`}
      />

      <div className="grid grid-2">
        <Card pad>
          <div
            className={drag ? 'upload-zone drag' : 'upload-zone'}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); startUpload() }}
            onClick={() => !stage && inputRef.current?.click()}
          >
            <div className="uz-ic">
              <CloudUpload />
            </div>
            <div className="uz-title">Drop your practice video here</div>
            <div className="uz-sub">MP4, MOV, WEBM · Up to 2 minutes · Max 200 MB</div>
            <div className="flex center" style={{ justifyContent: 'center', gap: 10 }}>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); startUpload() }} disabled={stage === 'uploading'}>
                <Upload size={16} /> Upload Video
              </button>
              <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); startUpload() }}>
                <Video size={16} /> Record Video
              </button>
            </div>
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={() => startUpload()} />
          </div>

          {stage === 'uploading' && (
            <div className="mt-4">
              <div className="flex between mb-1">
                <span className="tiny" style={{ fontWeight: 600 }}>Uploading practice_session.mp4</span>
                <span className="tiny dim">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 tiny dim">
                {progress < 35 ? 'Compressing video…' : progress < 70 ? 'Uploading to secure storage…' : 'Preparing AI analysis…'}
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="mt-4 card card-pad" style={{ background: 'var(--grad-soft)', borderColor: 'var(--grad-border)' }}>
              <div className="flex gap-2">
                <CheckCircle2 size={22} color="#34d399" />
                <div>
                  <div style={{ fontWeight: 700 }}>Upload complete</div>
                  <div className="tiny dim">practice_session.mp4 · 1:24 · 18.4 MB</div>
                </div>
              </div>
              <button className="btn btn-primary btn-block mt-3" onClick={() => navigate('/player/analyze')}>
                Start AI Analysis <ArrowRight size={16} />
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
                { n: '02', t: 'AI locks analysis', d: `Your biomechanics are analyzed — ${meta.label} — with a confidence score.` },
                { n: '03', t: 'Pose analysis', d: '20+ biomechanical metrics are computed frame by frame.' },
                { n: '04', t: 'Personalized plan', d: 'Training, learning videos and insights tailored to your running form.' },
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

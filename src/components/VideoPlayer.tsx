import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './VideoPlayer.css'
import { VideoLoadingOverlay } from './VideoLoadingOverlay'

type VideoLoadMode = 'play' | 'prefetch' | 'idle'

type VideoPlayerProps = {
  dateLabel: string
  clipIndex: number
  clipTotal: number
  videoSrc: string
  posterSrc?: string
  loadMode?: VideoLoadMode
  isActive?: boolean
  onClose?: () => void
}

const SCRUB_HOLD_MS = 140
const PAUSE_FLASH_MS = 200
const PREVIEW_WIDTH = 104
const PREVIEW_HEIGHT = 68

type PlaybackIconMode = 'hidden' | 'pause' | 'play'

function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  dateLabel,
  clipIndex,
  clipTotal,
  videoSrc,
  posterSrc,
  loadMode = 'play',
  isActive = true,
  onClose,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrubHitRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const holdTimerRef = useRef<number | null>(null)
  const pendingSeekRef = useRef<number | null>(null)
  const seekFrameRef = useRef<number | null>(null)
  const wasPlayingRef = useRef(false)
  const userPausedRef = useRef(false)
  const iconTimerRef = useRef<number | null>(null)
  const tapStartRef = useRef<{ x: number; y: number } | null>(null)

  const [progress, setProgress] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [iconMode, setIconMode] = useState<PlaybackIconMode>('hidden')
  const [scrubRatio, setScrubRatio] = useState(0)
  const [scrubPointer, setScrubPointer] = useState({ x: 0, y: 0 })
  const [duration, setDuration] = useState(0)
  const [isFrameVisible, setIsFrameVisible] = useState(false)

  const displayProgress = isScrubbing ? scrubRatio : progress

  const updateProgress = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration || Number.isNaN(video.duration)) return
    setProgress(video.currentTime / video.duration)
    setDuration(video.duration)
  }, [])

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const clearIconTimer = useCallback(() => {
    if (iconTimerRef.current !== null) {
      window.clearTimeout(iconTimerRef.current)
      iconTimerRef.current = null
    }
  }, [])

  const showPauseThenPlayIcon = useCallback(() => {
    clearIconTimer()
    setIconMode('pause')
    iconTimerRef.current = window.setTimeout(() => {
      iconTimerRef.current = null
      setIconMode('play')
    }, PAUSE_FLASH_MS)
  }, [clearIconTimer])

  const showPauseThenHideIcon = useCallback(() => {
    clearIconTimer()
    setIconMode('pause')
    iconTimerRef.current = window.setTimeout(() => {
      iconTimerRef.current = null
      setIconMode('hidden')
    }, PAUSE_FLASH_MS)
  }, [clearIconTimer])

  const drawPreviewFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
  }, [])

  const ratioFromClientX = useCallback((clientX: number) => {
    const track = scrubHitRef.current
    if (!track) return 0

    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return 0

    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const seekToRatio = useCallback(
    (ratio: number) => {
      const video = videoRef.current
      if (!video || !video.duration || Number.isNaN(video.duration)) return

      pendingSeekRef.current = ratio

      if (seekFrameRef.current !== null) return

      seekFrameRef.current = window.requestAnimationFrame(() => {
        seekFrameRef.current = null
        const nextRatio = pendingSeekRef.current
        pendingSeekRef.current = null

        if (nextRatio === null || !video.duration) return

        video.currentTime = nextRatio * video.duration
      })
    },
    [],
  )

  const beginScrubbing = useCallback(
    (clientX: number, clientY: number) => {
      const video = videoRef.current
      if (!video || !isActive) return

      clearHoldTimer()
      wasPlayingRef.current = !video.paused
      video.pause()

      const ratio = ratioFromClientX(clientX)
      setIsScrubbing(true)
      setScrubRatio(ratio)
      setScrubPointer({ x: clientX, y: clientY })
      seekToRatio(ratio)
    },
    [clearHoldTimer, isActive, ratioFromClientX, seekToRatio],
  )

  const finishScrubbing = useCallback(
    (clientX: number) => {
      if (!isScrubbing) return

      const video = videoRef.current
      const ratio = ratioFromClientX(clientX)

      setIsScrubbing(false)
      setScrubRatio(ratio)
      setProgress(ratio)

      if (video && video.duration && !Number.isNaN(video.duration)) {
        video.currentTime = ratio * video.duration
        if (wasPlayingRef.current && isActive) {
          userPausedRef.current = false
          void video.play().catch(() => {})
        } else {
          userPausedRef.current = true
          video.pause()
        }
      }
    },
    [isActive, isScrubbing, ratioFromClientX],
  )

  const togglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || !isActive || isScrubbing) return

    if (video.paused) {
      userPausedRef.current = false
      showPauseThenHideIcon()
      void video.play().catch(() => {})
      return
    }

    userPausedRef.current = true
    video.pause()
    showPauseThenPlayIcon()
  }, [isActive, isScrubbing, showPauseThenHideIcon, showPauseThenPlayIcon])

  const syncPausedState = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setIsPaused(video.paused)
  }, [])

  const handlePlaying = useCallback(() => {
    syncPausedState()
    setIsFrameVisible(true)
  }, [syncPausedState])

  const handleScrubPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isActive) return

    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    const { clientX, clientY } = event
    clearHoldTimer()

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null
      beginScrubbing(clientX, clientY)
    }, SCRUB_HOLD_MS)
  }

  const handleScrubPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()

    const { clientX, clientY } = event

    if (isScrubbing) {
      event.preventDefault()
      const ratio = ratioFromClientX(clientX)
      setScrubRatio(ratio)
      setScrubPointer({ x: clientX, y: clientY })
      seekToRatio(ratio)
      return
    }

    if (holdTimerRef.current !== null) {
      clearHoldTimer()
      beginScrubbing(clientX, clientY)
    }
  }

  const handleScrubPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (isScrubbing) {
      finishScrubbing(event.clientX)
      return
    }

    clearHoldTimer()
  }

  const handleScrubPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()

    if (isScrubbing) {
      finishScrubbing(event.clientX)
      return
    }

    clearHoldTimer()
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onSeeked = () => {
      if (isScrubbing) {
        drawPreviewFrame()
      }
    }

    video.addEventListener('seeked', onSeeked)
    return () => video.removeEventListener('seeked', onSeeked)
  }, [drawPreviewFrame, isScrubbing])

  useEffect(() => {
    if (!isScrubbing) return
    drawPreviewFrame()
  }, [drawPreviewFrame, isScrubbing, scrubRatio])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isActive || loadMode !== 'play') {
      clearHoldTimer()
      clearIconTimer()
      setIsScrubbing(false)
      userPausedRef.current = false
      video.pause()
      video.currentTime = 0
      video.loop = false
      setProgress(0)
      setIsPaused(false)
      setIconMode('hidden')
      setIsFrameVisible(false)
      return
    }

    video.loop = true
    userPausedRef.current = false
    setIconMode('hidden')
    setIsFrameVisible(false)

    const playWhenReady = () => {
      video.currentTime = 0
      setIsPaused(false)
      video.play().catch(() => {
        setIsPaused(true)
        setIconMode('play')
        /* autoplay may be blocked until user interaction */
      })
    }

    if (video.readyState >= 2) {
      playWhenReady()
      return
    }

    video.addEventListener('loadeddata', playWhenReady, { once: true })
    return () => video.removeEventListener('loadeddata', playWhenReady)
  }, [clearHoldTimer, clearIconTimer, videoSrc, isActive, loadMode])

  useEffect(
    () => () => {
      clearHoldTimer()
      clearIconTimer()
      if (seekFrameRef.current !== null) {
        window.cancelAnimationFrame(seekFrameRef.current)
      }
    },
    [clearHoldTimer, clearIconTimer],
  )

  const handlePlayerPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element
    if (
      target.closest('.video-player__close') ||
      target.closest('.video-player__progress-scrub-hit')
    ) {
      return
    }

    tapStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePlayerPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element
    if (
      target.closest('.video-player__close') ||
      target.closest('.video-player__progress-scrub-hit')
    ) {
      tapStartRef.current = null
      return
    }

    if (!tapStartRef.current || isScrubbing) {
      tapStartRef.current = null
      return
    }

    const dx = event.clientX - tapStartRef.current.x
    const dy = event.clientY - tapStartRef.current.y
    tapStartRef.current = null

    if (Math.hypot(dx, dy) < 12) {
      togglePlayback()
    }
  }

  const shouldLoadVideo = isActive && loadMode !== 'idle'
  const isPlayingClip = shouldLoadVideo && loadMode === 'play'
  const showLoading = isPlayingClip && !isFrameVisible

  return (
    <div
      className={`video-player ${isScrubbing ? 'video-player--scrubbing' : ''}`}
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-label={isPaused ? 'Play video' : 'Pause video'}
      onPointerDown={handlePlayerPointerDown}
      onPointerUp={handlePlayerPointerUp}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          togglePlayback()
        }
      }}
      onPointerCancel={() => {
        tapStartRef.current = null
      }}
    >
      <div className="video-player__media-slot">
        {posterSrc && !isFrameVisible && (
          <img
            className="video-player__poster"
            src={posterSrc}
            alt=""
            aria-hidden
          />
        )}

        <video
          ref={videoRef}
          className={[
            'video-player__media',
            isFrameVisible ? 'video-player__media--visible' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          src={shouldLoadVideo ? videoSrc : undefined}
          poster={posterSrc}
          playsInline
          muted
          preload={
            loadMode === 'play'
              ? 'auto'
              : loadMode === 'prefetch'
                ? 'metadata'
                : 'none'
          }
          onTimeUpdate={updateProgress}
          onLoadedMetadata={updateProgress}
          onPlay={syncPausedState}
          onPause={syncPausedState}
          onPlaying={handlePlaying}
        />

        {isPlayingClip && (
          <VideoLoadingOverlay visible={showLoading} />
        )}
      </div>

      {iconMode !== 'hidden' && !isScrubbing && (
        <div
          className={[
            'video-player__playback-icon',
            iconMode === 'play'
              ? 'video-player__playback-icon--play'
              : 'video-player__playback-icon--pause',
          ].join(' ')}
          aria-hidden
        >
          <div className="video-player__playback-icon-chip">
            <span className="video-player__playback-icon-glyph video-player__playback-icon-glyph--pause">
              <PauseIcon />
            </span>
            <span className="video-player__playback-icon-glyph video-player__playback-icon-glyph--play">
              <PlayIcon />
            </span>
          </div>
        </div>
      )}

      <div className="video-player__overlay">
        <span className="video-player__date">{dateLabel}</span>
        <button
          type="button"
          className="video-player__close"
          aria-label="Close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <span className="video-player__clip-counter">
          {clipIndex}/{clipTotal}
        </span>
      </div>

      {isScrubbing && (
        <div
          className="video-player__scrub-preview"
          style={{
            left: scrubPointer.x,
            top: scrubPointer.y,
          }}
        >
          <canvas
            ref={canvasRef}
            className="video-player__scrub-preview-canvas"
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
          />
          <span className="video-player__scrub-time">
            {formatPlaybackTime(scrubRatio * duration)}
          </span>
        </div>
      )}

      <div
        ref={scrubHitRef}
        className="video-player__progress-scrub-hit"
        onPointerDown={handleScrubPointerDown}
        onPointerMove={handleScrubPointerMove}
        onPointerUp={handleScrubPointerUp}
        onPointerCancel={handleScrubPointerCancel}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchMove={(event) => {
          event.stopPropagation()
          if (isScrubbing) {
            event.preventDefault()
          }
        }}
        onTouchEnd={(event) => event.stopPropagation()}
        aria-hidden
      >
        <div
          className={`video-player__progress-track ${isScrubbing ? 'video-player__progress-track--scrubbing' : ''}`}
        >
          <div
            className="video-player__progress-fill"
            style={{ width: `${displayProgress * 100}%` }}
          />
          {isScrubbing && (
            <span
              className="video-player__scrub-thumb"
              style={{ left: `${displayProgress * 100}%` }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function PauseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="8" y="6" width="4.5" height="16" rx="1" fill="currentColor" />
      <rect x="15.5" y="6" width="4.5" height="16" rx="1" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M10 7.5L21 14L10 20.5V7.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 1L13 13M13 1L1 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

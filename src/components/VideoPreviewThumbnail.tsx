import { forwardRef, useEffect, useImperativeHandle, useRef, type KeyboardEvent } from 'react'
import type { FeedMoment } from '../mockData'
import './VideoPreviewThumbnail.css'

const PREVIEW_DURATION_SEC = 5

export type VideoPreviewHandle = {
  play: () => void
}

type VideoPreviewThumbnailProps = {
  moment: FeedMoment
  onClick: () => void
}

export const VideoPreviewThumbnail = forwardRef<
  VideoPreviewHandle,
  VideoPreviewThumbnailProps
>(function VideoPreviewThumbnail({ moment, onClick }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useImperativeHandle(ref, () => ({
    play: () => {
      const video = videoRef.current
      if (!video) return
      video.currentTime = 0
      void video.play().catch(() => {})
    },
  }))

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true

    const playWhenReady = () => {
      video.currentTime = 0
      void video.play().catch(() => {})
    }

    const onTimeUpdate = () => {
      if (video.currentTime >= PREVIEW_DURATION_SEC) {
        video.currentTime = 0
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadeddata', playWhenReady)

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playWhenReady()
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadeddata', playWhenReady)
      video.pause()
    }
  }, [moment.videoSrc])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className="video-preview-thumb"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Open feed preview"
    >
      <video
        ref={videoRef}
        className="video-preview-thumb__video"
        src={moment.videoSrc}
        muted
        playsInline
        autoPlay
        preload="auto"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
})

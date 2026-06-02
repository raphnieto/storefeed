import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent } from 'react'
import type { FeedMoment } from '../mockData'
import { VideoLoadingOverlay } from './VideoLoadingOverlay'
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
  const [isFrameVisible, setIsFrameVisible] = useState(false)

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

    setIsFrameVisible(false)
    video.muted = true
    video.defaultMuted = true

    const playWhenReady = () => {
      video.currentTime = 0
      void video.play().catch(() => {})
    }

    const onPlaying = () => {
      setIsFrameVisible(true)
    }

    const onTimeUpdate = () => {
      if (video.currentTime >= PREVIEW_DURATION_SEC) {
        video.currentTime = 0
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadeddata', playWhenReady)
    video.addEventListener('playing', onPlaying)

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playWhenReady()
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadeddata', playWhenReady)
      video.removeEventListener('playing', onPlaying)
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
      {!isFrameVisible && (
        <img
          className="video-preview-thumb__poster"
          src={moment.posterSrc}
          alt=""
          aria-hidden
        />
      )}

      <video
        ref={videoRef}
        className={[
          'video-preview-thumb__video',
          isFrameVisible ? 'video-preview-thumb__video--visible' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        src={moment.videoSrc}
        poster={moment.posterSrc}
        muted
        playsInline
        autoPlay
        preload="auto"
        tabIndex={-1}
        aria-hidden
      />

      <VideoLoadingOverlay visible={!isFrameVisible} />
    </div>
  )
})

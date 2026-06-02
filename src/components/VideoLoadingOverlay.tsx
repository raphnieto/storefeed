import './VideoLoadingOverlay.css'

type VideoLoadingOverlayProps = {
  visible: boolean
}

export function VideoLoadingOverlay({ visible }: VideoLoadingOverlayProps) {
  return (
    <div
      className={[
        'video-loading-overlay',
        visible ? 'video-loading-overlay--visible' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
      aria-busy={visible}
      aria-label="Loading"
      aria-hidden={!visible}
    >
      <span className="video-loading-overlay__spinner" aria-hidden />
    </div>
  )
}

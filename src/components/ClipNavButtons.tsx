import './ClipNavButtons.css'

type ClipNavProps = {
  canGoNext: boolean
  canGoPrev: boolean
  onNext: () => void
  onPrev: () => void
}

export function ClipNavButtons({
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
}: ClipNavProps) {
  if (!canGoNext && !canGoPrev) return null

  return (
    <nav className="clip-nav" aria-label="Clip navigation">
      {canGoPrev && (
        <button
          type="button"
          className="clip-nav__btn"
          aria-label="Previous clip"
          onClick={onPrev}
        >
          <ChevronUpIcon />
        </button>
      )}
      {canGoNext && (
        <button
          type="button"
          className="clip-nav__btn"
          aria-label="Next clip"
          onClick={onNext}
        >
          <ChevronDownIcon />
        </button>
      )}
    </nav>
  )
}

function ChevronUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 14L12 8L18 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 10L12 16L18 10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

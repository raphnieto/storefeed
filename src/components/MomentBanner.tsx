import './MomentBanner.css'

type MomentBannerProps = {
  variant: 'sale' | 'no-sale'
}

export function MomentBanner({ variant }: MomentBannerProps) {
  const isSale = variant === 'sale'

  return (
    <div
      className={`moment-banner moment-banner--${variant}`}
      role="status"
    >
      {isSale ? <CheckIcon /> : <NoSaleIcon />}
      <span>{isSale ? 'Sale' : 'No sale'}</span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M3.5 9.5L7 13L14.5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NoSaleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 2L14 14M14 2L2 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

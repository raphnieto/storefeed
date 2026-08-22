import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NeuralNetBackground } from '../components/NeuralNetBackground'
import { LANDING_VIDEO_SRC } from '../landing/constants'
import './LandingPage.css'

const DISCOVER_ITEMS = [
  'Sale or no sale patterns',
  'Your most engaged employees',
  'Customer reactions',
  'Daily recaps of register moments',
] as const

export function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add('landing-active')
    document.title = 'StoreFeed — Turn store footage into more sales'
    return () => {
      document.documentElement.classList.remove('landing-active')
      document.title = 'StoreFeed'
    }
  }, [])

  return (
    <div className="landing-page">
      <NeuralNetBackground />

      <div className="landing-page__inner">
        <header className="landing-page__brand">StoreFeed</header>

        <div className="landing-page__main">
          <div className="landing-page__layout">
            <section className="landing-page__copy" aria-labelledby="landing-heading">
              <h1 id="landing-heading" className="landing-page__headline">
                Turn your store footage into more sales.
              </h1>
              <p className="landing-page__subhead">
                Swipe through sales and missed opportunities.
              </p>

              <div className="landing-page__cta">
                <Link to="/preview" className="landing-page__cta-button">
                  See it in action
                </Link>
              </div>

              <div className="landing-page__discover">
                <p className="landing-page__discover-label">Discover:</p>
                <ul>
                  {DISCOVER_ITEMS.map((item) => (
                    <li key={item}>
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="landing-page__device" aria-label="Product preview">
              <div className="landing-page__phone">
                <video
                  className="landing-page__video"
                  src={LANDING_VIDEO_SRC}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
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

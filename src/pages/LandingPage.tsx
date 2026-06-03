import { useEffect, useState, type FormEvent } from 'react'
import { LANDING_VIDEO_SRC } from '../landing/constants'
import { submitDemoEmail } from '../landing/submitDemoEmail'
import './LandingPage.css'

const DISCOVER_ITEMS = [
  'Sale or no sale patterns',
  'Your most engaged employees',
  'Customer reactions',
  'Daily recaps of register moments',
] as const

export function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    document.documentElement.classList.add('landing-active')
    document.title = 'StoreFeed — Turn store footage into more sales'
    return () => {
      document.documentElement.classList.remove('landing-active')
      document.title = 'StoreFeed'
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setErrorMessage('')

    const result = await submitDemoEmail(email)
    if (result.ok) {
      setStatus('success')
      setEmail('')
      return
    }

    setStatus('error')
    setErrorMessage(result.message)
  }

  return (
    <div className="landing-page">
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

            <form className="landing-page__cta" onSubmit={handleSubmit} noValidate>
              <label className="landing-page__cta-field">
                <span className="visually-hidden">Email for demo</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  disabled={status === 'submitting' || status === 'success'}
                  required
                />
              </label>
              <button
                type="submit"
                className="landing-page__cta-button"
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? 'Sending…' : 'Book a demo'}
              </button>
            </form>

            {status === 'success' ? (
              <p className="landing-page__form-message landing-page__form-message--success" role="status">
                Thanks — we&apos;ll be in touch soon.
              </p>
            ) : null}

            {status === 'error' && errorMessage ? (
              <p className="landing-page__form-message landing-page__form-message--error" role="alert">
                {errorMessage}
              </p>
            ) : null}

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

import { DEMO_SIGNUP_EMAIL } from './constants'

type SubmitResult =
  | { ok: true }
  | { ok: false; message: string }

export async function submitDemoEmail(email: string): Promise<SubmitResult> {
  const trimmed = email.trim()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: 'Enter a valid email address.' }
  }

  try {
    const response = await fetch('/api/book-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    })

    if (response.ok) return { ok: true }

    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    return {
      ok: false,
      message: payload?.error ?? 'Something went wrong. Please try again.',
    }
  } catch {
    return submitDemoEmailViaFormSubmit(trimmed)
  }
}

/** Fallback when running Vite dev without the Vercel API route. */
async function submitDemoEmailViaFormSubmit(email: string): Promise<SubmitResult> {
  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(DEMO_SIGNUP_EMAIL)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          _subject: 'StoreFeed — Book a demo',
          _template: 'table',
        }),
      },
    )

    if (!response.ok) {
      return { ok: false, message: 'Could not send your request. Please try again.' }
    }

    return { ok: true }
  } catch {
    return { ok: false, message: 'Could not send your request. Please try again.' }
  }
}

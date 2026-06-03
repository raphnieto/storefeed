import type { VercelRequest, VercelResponse } from '@vercel/node'

const FORWARD_TO = 'raphaelnietostjohn@gmail.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  try {
    const forward = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(FORWARD_TO)}`,
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

    if (!forward.ok) {
      return res.status(502).json({ error: 'Failed to forward signup' })
    }

    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to forward signup' })
  }
}

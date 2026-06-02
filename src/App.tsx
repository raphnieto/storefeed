import { useCallback, useEffect, useRef, useState } from 'react'
import type { FeedMoment } from './mockData'
import { CalendarScreen } from './components/CalendarScreen'
import { StoreFeedScreen } from './components/StoreFeedScreen'
import { clearVideoPrefetch } from './utils/videoPrefetch'
import './styles/screenTransition.css'

type AppPhase = 'calendar' | 'entering-feed' | 'feed'

type FeedPayload = {
  moments: FeedMoment[]
  startIndex: number
}

const FEED_ENTER_MS = 420

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('calendar')
  const [feedPayload, setFeedPayload] = useState<FeedPayload | null>(null)
  const enterTimerRef = useRef<number | null>(null)

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current)
      enterTimerRef.current = null
    }
  }, [])

  const openFeed = useCallback(
    (moments: FeedMoment[], startIndex: number) => {
      clearEnterTimer()
      setFeedPayload({ moments, startIndex })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setPhase('feed')
        return
      }

      setPhase('entering-feed')
      enterTimerRef.current = window.setTimeout(() => {
        enterTimerRef.current = null
        setPhase('feed')
      }, FEED_ENTER_MS)
    },
    [clearEnterTimer],
  )

  const closeFeed = useCallback(() => {
    clearEnterTimer()
    clearVideoPrefetch()
    setPhase('calendar')
    setFeedPayload(null)
  }, [clearEnterTimer])

  useEffect(() => () => clearEnterTimer(), [clearEnterTimer])

  if (phase === 'calendar') {
    return <CalendarScreen onOpenFeed={openFeed} />
  }

  if (!feedPayload) {
    return <CalendarScreen onOpenFeed={openFeed} />
  }

  const isTransitioning = phase === 'entering-feed'

  return (
    <div className={isTransitioning ? 'app-transition-root' : 'app-feed-root'}>
      <div
        className={
          isTransitioning
            ? 'app-transition-root__screen app-transition-root__screen--feed-entering'
            : 'app-feed-root__slot'
        }
      >
        <StoreFeedScreen
          moments={feedPayload.moments}
          initialActiveIndex={feedPayload.startIndex}
          onClose={closeFeed}
          showEntryProgress={isTransitioning}
        />
      </div>
    </div>
  )
}

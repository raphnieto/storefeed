import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react'
import { feedMoments as defaultFeedMoments, type FeedMoment } from '../mockData'
import { useClipNavigation } from '../hooks/useClipNavigation'
import {
  canGoToNextClip,
  isPointerOnReceipt,
  isReceiptAtBottom,
  receiptHasOverflow,
  shouldScrollReceiptOnDrag,
} from '../utils/clipNavigationRules'
import { MomentView } from './MomentView'
import { ClipNavButtons } from './ClipNavButtons'
import { AppShell } from './AppShell'
import './StoreFeedScreen.css'

const DRAG_COMMIT_PX = 80

type StoreFeedScreenProps = {
  moments?: FeedMoment[]
  initialActiveIndex?: number
  onClose?: () => void
  showEntryProgress?: boolean
}

export function StoreFeedScreen({
  moments = defaultFeedMoments,
  initialActiveIndex = 0,
  onClose,
  showEntryProgress = false,
}: StoreFeedScreenProps) {
  const clipCount = moments.length
  const panelShare = 100 / clipCount
  const clampedStart = Math.max(
    0,
    Math.min(initialActiveIndex, Math.max(clipCount - 1, 0)),
  )

  const [activeIndex, setActiveIndex] = useState(clampedStart)
  const [slideIndex, setSlideIndex] = useState(clampedStart)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffsetPx, setDragOffsetPx] = useState(0)

  useEffect(() => {
    const start = Math.max(
      0,
      Math.min(initialActiveIndex, Math.max(moments.length - 1, 0)),
    )
    setActiveIndex(start)
    setSlideIndex(start)
    setIsAnimating(false)
    setDragOffsetPx(0)
    scrollRefs.current = []
    scrollRef.current = null
  }, [moments, initialActiveIndex])

  const cardRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isTransitioningRef = useRef(false)
  const completedRef = useRef(false)
  const dragStartY = useRef(0)
  const lastDragY = useRef(0)
  const isDraggingRef = useRef(false)
  const dragOnReceiptRef = useRef(false)
  const dragModeRef = useRef<'clip' | 'receipt-scroll' | null>(null)
  const lastMoveYRef = useRef(0)
  const activeIndexRef = useRef(activeIndex)
  const canAdvanceNextRef = useRef(true)
  const canAdvancePrevRef = useRef(false)
  const receiptArmedRef = useRef(false)

  const canGoToNextClipFlag = activeIndex < clipCount - 1
  const canGoToPrevClipFlag = activeIndex > 0

  useEffect(() => {
    isTransitioningRef.current = isAnimating
  }, [isAnimating])

  useEffect(() => {
    activeIndexRef.current = activeIndex
    canAdvanceNextRef.current = canGoToNextClipFlag
    canAdvancePrevRef.current = canGoToPrevClipFlag
    receiptArmedRef.current = false
  }, [activeIndex, canGoToNextClipFlag, canGoToPrevClipFlag])

  const syncScrollRef = useCallback((index: number) => {
    scrollRef.current = scrollRefs.current[index] ?? null
  }, [])

  const setPanelScrollRef = useCallback(
    (panelIndex: number) => (element: HTMLDivElement | null) => {
      scrollRefs.current[panelIndex] = element
      if (panelIndex === activeIndex) {
        scrollRef.current = element
      }
    },
    [activeIndex],
  )

  useEffect(() => {
    syncScrollRef(activeIndex)
  }, [activeIndex, syncScrollRef])

  const finishTransition = useCallback(
    (nextIndex: number) => {
      if (completedRef.current) return
      completedRef.current = true

      setActiveIndex(nextIndex)
      setSlideIndex(nextIndex)
      setIsAnimating(false)
      setDragOffsetPx(0)
      receiptArmedRef.current = false
      syncScrollRef(nextIndex)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })

      requestAnimationFrame(() => {
        completedRef.current = false
      })
    },
    [syncScrollRef],
  )

  const animateToIndex = useCallback(
    (targetIndex: number) => {
      if (
        isAnimating ||
        targetIndex === activeIndex ||
        targetIndex < 0 ||
        targetIndex >= clipCount
      ) {
        return
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishTransition(targetIndex)
        return
      }

      completedRef.current = false
      setIsAnimating(true)
      setSlideIndex(targetIndex)
      setDragOffsetPx(0)
    },
    [activeIndex, finishTransition, isAnimating],
  )

  const goNext = useCallback(() => {
    if (isAnimating || !canGoToNextClipFlag) return
    animateToIndex(activeIndex + 1)
  }, [activeIndex, animateToIndex, canGoToNextClipFlag, isAnimating])

  const goPrev = useCallback(() => {
    if (isAnimating || !canGoToPrevClipFlag) return
    animateToIndex(activeIndex - 1)
  }, [activeIndex, animateToIndex, canGoToPrevClipFlag, isAnimating])

  const handleTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || !isAnimating) return
    if (event.target !== trackRef.current) return
    if (completedRef.current) return
    finishTransition(slideIndex)
  }

  useClipNavigation({
    onNext: goNext,
    onPrev: goPrev,
    containerRef: cardRef,
    options: {
      scrollRef,
      isEnabled: () => !isTransitioningRef.current && !isDraggingRef.current,
      canAdvanceNext: () => canAdvanceNextRef.current,
      canAdvancePrev: () => canAdvancePrevRef.current,
      receiptArmedRef,
    },
  })

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const clampDrag = (offset: number) => {
      const index = activeIndexRef.current
      if (index === 0 && offset > 0) return 0
      if (index === clipCount - 1 && offset < 0) return 0

      const max = viewport.clientHeight * 0.5
      return Math.max(-max, Math.min(max, offset))
    }

    const endDrag = () => {
      if (!isDraggingRef.current) return

      if (dragModeRef.current === 'receipt-scroll') {
        isDraggingRef.current = false
        dragModeRef.current = null
        return
      }

      const offset = lastDragY.current
      isDraggingRef.current = false
      dragModeRef.current = null
      setDragOffsetPx(0)

      const index = activeIndexRef.current
      const receiptEl = scrollRef.current
      const onReceipt = dragOnReceiptRef.current

      // Phone: swipe UP (finger up, offset < 0) → next
      if (
        offset < -DRAG_COMMIT_PX &&
        canAdvanceNextRef.current &&
        canGoToNextClip(receiptEl, onReceipt)
      ) {
        animateToIndex(index + 1)
        return
      }

      // Phone: swipe DOWN (finger down, offset > 0) → prev
      if (offset > DRAG_COMMIT_PX && canAdvancePrevRef.current) {
        animateToIndex(index - 1)
      }
    }

    const startDrag = (clientY: number, target: EventTarget | null) => {
      if (isAnimating) return

      const receiptEl = scrollRef.current
      dragOnReceiptRef.current = isPointerOnReceipt(receiptEl, target)
      dragModeRef.current = null

      if (
        shouldScrollReceiptOnDrag(receiptEl, dragOnReceiptRef.current)
      ) {
        dragModeRef.current = 'receipt-scroll'
        dragStartY.current = clientY
        lastMoveYRef.current = clientY
        lastDragY.current = 0
        isDraggingRef.current = true
        return
      }

      if (
        dragOnReceiptRef.current &&
        receiptEl &&
        receiptHasOverflow(receiptEl) &&
        !isReceiptAtBottom(receiptEl)
      ) {
        dragModeRef.current = 'receipt-scroll'
        dragStartY.current = clientY
        lastMoveYRef.current = clientY
        lastDragY.current = 0
        isDraggingRef.current = true
        return
      }

      if (
        dragOnReceiptRef.current &&
        receiptEl &&
        isReceiptAtBottom(receiptEl)
      ) {
        receiptArmedRef.current = true
      }

      dragModeRef.current = 'clip'
      dragStartY.current = clientY
      lastMoveYRef.current = clientY
      lastDragY.current = 0
      isDraggingRef.current = true
    }

    const moveDrag = (clientY: number, preventDefault: () => void) => {
      if (!isDraggingRef.current) return

      const receiptEl = scrollRef.current

      if (dragModeRef.current === 'receipt-scroll' && receiptEl) {
        const delta = clientY - lastMoveYRef.current
        lastMoveYRef.current = clientY
        receiptEl.scrollTop -= delta
        if (Math.abs(delta) > 2) {
          preventDefault()
        }
        return
      }

      const offset = clampDrag(clientY - dragStartY.current)
      lastDragY.current = offset
      setDragOffsetPx(offset)

      if (Math.abs(offset) > 8) {
        preventDefault()
      }
    }

    const onTouchStart = (e: TouchEvent) =>
      startDrag(e.touches[0].clientY, e.target)
    const onTouchMove = (e: TouchEvent) =>
      moveDrag(e.touches[0].clientY, () => e.preventDefault())
    const onTouchEnd = () => endDrag()
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      startDrag(e.clientY, e.target)
    }
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientY, () => {})
    const onMouseUp = () => endDrag()

    viewport.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    viewport.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    viewport.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true })
    viewport.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart, { capture: true })
      viewport.removeEventListener('touchmove', onTouchMove, { capture: true })
      viewport.removeEventListener('touchend', onTouchEnd, { capture: true })
      viewport.removeEventListener('touchcancel', onTouchEnd, { capture: true })
      viewport.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [animateToIndex, isAnimating])

  const displayIndex = isAnimating ? slideIndex : activeIndex
  const trackTransform =
    dragOffsetPx !== 0
      ? `translate3d(0, calc(${-displayIndex * panelShare}% + ${dragOffsetPx}px), 0)`
      : `translate3d(0, ${-displayIndex * panelShare}%, 0)`

  const playingIndex = isAnimating ? slideIndex : activeIndex

  return (
    <AppShell
      surfaceClassName="store-feed-screen__card"
      showEntryProgress={showEntryProgress}
      aside={
        <ClipNavButtons
          canGoNext={canGoToNextClipFlag}
          canGoPrev={canGoToPrevClipFlag}
          onNext={goNext}
          onPrev={goPrev}
        />
      }
    >
      <main
        ref={cardRef}
        className="store-feed-screen__main"
        tabIndex={0}
        aria-label="StoreFeed clips"
      >
        <div ref={viewportRef} className="clip-viewport">
            <div
              ref={trackRef}
              className={`clip-track ${isAnimating ? 'clip-track--animating' : ''}`}
              style={{
                ['--panel-count' as string]: clipCount,
                transform: trackTransform,
              }}
              onTransitionEnd={handleTrackTransitionEnd}
            >
              {moments.map((moment, index) => (
                <MomentView
                  key={`${moment.videoSrc}-${index}`}
                  ref={setPanelScrollRef(index)}
                  moment={moment}
                  clipIndex={index + 1}
                  clipTotal={clipCount}
                  isActive={index === playingIndex}
                  layout="slide"
                  onClose={index === playingIndex ? onClose : undefined}
                />
              ))}
            </div>
          </div>
      </main>
    </AppShell>
  )
}

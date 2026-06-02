import { useEffect, useRef, type RefObject } from 'react'
import {
  isPointerOnReceipt,
  isReceiptAtBottom,
  receiptHasOverflow,
} from '../utils/clipNavigationRules'

const WHEEL_THRESHOLD = 70
const NAV_COOLDOWN_MS = 400
const RECEIPT_ARM_DELAY_MS = 180

export type ClipNavigationOptions = {
  scrollRef: RefObject<HTMLElement | null>
  isEnabled: () => boolean
  canAdvanceNext: () => boolean
  canAdvancePrev: () => boolean
  /** Set true ~180ms after receipt rests at bottom (enables next swipe on receipt). */
  receiptArmedRef: RefObject<boolean>
}

type Params = {
  onNext: () => void
  onPrev: () => void
  containerRef: RefObject<HTMLElement | null>
  options: ClipNavigationOptions
}

export function useClipNavigation({
  onNext,
  onPrev,
  containerRef,
  options,
}: Params) {
  const onNextRef = useRef(onNext)
  const onPrevRef = useRef(onPrev)
  const optionsRef = useRef(options)
  const wheelAcc = useRef(0)
  const lastNavAt = useRef(0)
  const armTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onNextRef.current = onNext
    onPrevRef.current = onPrev
  }, [onNext, onPrev])

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const opts = () => optionsRef.current
    const receipt = () => opts().scrollRef.current

    const resetWheel = () => {
      wheelAcc.current = 0
    }

    const clearArmTimer = () => {
      if (armTimerRef.current !== null) {
        window.clearTimeout(armTimerRef.current)
        armTimerRef.current = null
      }
    }

    const scheduleReceiptArm = () => {
      clearArmTimer()
      opts().receiptArmedRef.current = false
      armTimerRef.current = window.setTimeout(() => {
        armTimerRef.current = null
        const el = receipt()
        if (el && isReceiptAtBottom(el)) {
          opts().receiptArmedRef.current = true
        }
      }, RECEIPT_ARM_DELAY_MS)
    }

    const enabled = () => opts().isEnabled()

    const fireNext = () => {
      const now = Date.now()
      if (!enabled()) return
      if (!opts().canAdvanceNext()) return
      if (now - lastNavAt.current < NAV_COOLDOWN_MS) return
      lastNavAt.current = now
      resetWheel()
      opts().receiptArmedRef.current = false
      onNextRef.current()
    }

    const firePrev = () => {
      const now = Date.now()
      if (!enabled()) return
      if (!opts().canAdvancePrev()) return
      if (now - lastNavAt.current < NAV_COOLDOWN_MS) return
      lastNavAt.current = now
      resetWheel()
      onPrevRef.current()
    }

    const handleWheel = (event: WheelEvent) => {
      if (!enabled()) return

      const el = receipt()
      const { deltaY } = event
      if (deltaY === 0) return

      const onReceipt = isPointerOnReceipt(el, event.target)
      const canNext = opts().canAdvanceNext()
      const canPrev = opts().canAdvancePrev()

      // macOS trackpad: swipe UP (next) → positive deltaY
      //                swipe DOWN (prev) → negative deltaY

      if (deltaY > 0 && canNext) {
        // --- NEXT ---

        if (onReceipt && el && receiptHasOverflow(el)) {
          if (!isReceiptAtBottom(el)) {
            el.scrollTop += deltaY
            event.preventDefault()
            resetWheel()
            return
          }

          if (!opts().receiptArmedRef.current) {
            resetWheel()
            return
          }
        }

        wheelAcc.current += deltaY
        if (wheelAcc.current >= WHEEL_THRESHOLD) {
          event.preventDefault()
          fireNext()
        }
        return
      }

      if (deltaY < 0 && canPrev) {
        // --- PREV (anywhere on 2/2) ---
        wheelAcc.current += Math.abs(deltaY)
        if (wheelAcc.current >= WHEEL_THRESHOLD) {
          event.preventDefault()
          firePrev()
        }
        return
      }

      resetWheel()
    }

    const handleReceiptScroll = () => {
      resetWheel()
      const el = receipt()
      if (!el) return

      if (!isReceiptAtBottom(el)) {
        opts().receiptArmedRef.current = false
        clearArmTimer()
        return
      }

      scheduleReceiptArm()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const el = receipt()

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!enabled() || !opts().canAdvanceNext()) return

        if (el && receiptHasOverflow(el) && !isReceiptAtBottom(el)) {
          el.scrollTop += el.clientHeight * 0.85
          return
        }
        if (el && receiptHasOverflow(el) && !opts().receiptArmedRef.current) {
          return
        }
        fireNext()
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!enabled() || !opts().canAdvancePrev()) return
        firePrev()
      }
    }

    const handleScroll = (event: Event) => {
      const el = receipt()
      if (!el || event.target !== el) return
      handleReceiptScroll()
    }

    container.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    })
    container.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true })
      container.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('keydown', handleKeyDown)
      clearArmTimer()
      resetWheel()
    }
  }, [containerRef])
}

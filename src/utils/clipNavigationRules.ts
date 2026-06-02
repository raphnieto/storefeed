const SCROLL_EDGE_PX = 8

export function receiptHasOverflow(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1
}

export function isReceiptAtTop(el: HTMLElement): boolean {
  return el.scrollTop <= SCROLL_EDGE_PX
}

export function isReceiptAtBottom(el: HTMLElement): boolean {
  return (
    el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EDGE_PX
  )
}

export function isPointerOnReceipt(
  receiptEl: HTMLElement | null,
  target: EventTarget | null,
): boolean {
  if (!receiptEl || !(target instanceof Node)) return false
  return receiptEl.contains(target)
}

/**
 * Can the user go to the NEXT clip from here?
 * - Video / banner / short receipt: always (if not last clip).
 * - Long receipt: only when scrolled to the bottom.
 */
export function canGoToNextClip(
  receiptEl: HTMLElement | null,
  onReceipt: boolean,
): boolean {
  if (!onReceipt || !receiptEl) return true
  if (!receiptHasOverflow(receiptEl)) return true
  return isReceiptAtBottom(receiptEl)
}

/** Can the user go to the PREVIOUS clip? Always yes when not on first clip. */
export function canGoToPrevClip(): boolean {
  return true
}

/**
 * Should a touch/drag gesture scroll the receipt instead of changing clips?
 */
export function shouldScrollReceiptOnDrag(
  receiptEl: HTMLElement | null,
  onReceipt: boolean,
): boolean {
  if (!onReceipt || !receiptEl) return false
  if (!receiptHasOverflow(receiptEl)) return false
  return !isReceiptAtTop(receiptEl) && !isReceiptAtBottom(receiptEl)
}

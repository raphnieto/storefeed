import { feedMoments, type FeedMoment } from './mockData'

export type PreviewSelection = {
  moment: FeedMoment
  index: number
}

function parseTimeFromMoment(moment: FeedMoment): number {
  const timeText =
    moment.kind === 'sale'
      ? moment.timestamp.replace(/^.* at /, '')
      : moment.time

  const match = timeText.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

export function sortMomentsChronologically(moments: FeedMoment[]): FeedMoment[] {
  return [...moments].sort(
    (a, b) => parseTimeFromMoment(a) - parseTimeFromMoment(b),
  )
}

export function getFeedStartIndex(moments: FeedMoment[]): number {
  if (moments.length === 0) return 0

  const firstSaleIndex = moments.findIndex((moment) => moment.kind === 'sale')
  return firstSaleIndex >= 0 ? firstSaleIndex : 0
}

export function getPreviewMoment(moments: FeedMoment[]): PreviewSelection | null {
  if (moments.length === 0) return null

  let bestIndex = -1
  let bestTotal = -1

  for (let index = 0; index < moments.length; index += 1) {
    const moment = moments[index]
    if (moment.kind === 'sale' && moment.total > bestTotal) {
      bestTotal = moment.total
      bestIndex = index
    }
  }

  const index = bestIndex >= 0 ? bestIndex : 0
  return { moment: moments[index], index }
}

export type DayFeedSummary = {
  grossSales: number
  saleCount: number
  noSaleCount: number
  momentCount: number
  thumbnailSrc: string
  moments: FeedMoment[]
}

export const TODAY = { year: 2026, month: 4, day: 31 }

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

export const YEAR_OPTIONS = [2024, 2025, 2026] as const

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function patchMoments(dateLabel: string, moments: FeedMoment[]): FeedMoment[] {
  return moments.map((moment) => ({
    ...moment,
    dateLabel,
  }))
}

function buildMoments(dateLabel: string, count: number): FeedMoment[] {
  return patchMoments(dateLabel, feedMoments.slice(0, count))
}

/** May 28 — full demo feed (4 sales, 2 no-sales, 6 moments) */
const may28Moments = patchMoments('May 28, 2026', feedMoments)

const calendarEntries: Array<{
  year: number
  month: number
  day: number
  summary: Omit<DayFeedSummary, 'moments'> & { momentSlice: number }
}> = [
  {
    year: 2026,
    month: 4,
    day: 3,
    summary: {
      grossSales: 412,
      saleCount: 2,
      noSaleCount: 1,
      momentCount: 3,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 3,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 7,
    summary: {
      grossSales: 890,
      saleCount: 3,
      noSaleCount: 1,
      momentCount: 4,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 4,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 12,
    summary: {
      grossSales: 556,
      saleCount: 2,
      noSaleCount: 2,
      momentCount: 4,
      thumbnailSrc: '/nosale-poster.png',
      momentSlice: 4,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 18,
    summary: {
      grossSales: 1284,
      saleCount: 4,
      noSaleCount: 2,
      momentCount: 6,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 6,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 22,
    summary: {
      grossSales: 324,
      saleCount: 1,
      noSaleCount: 2,
      momentCount: 3,
      thumbnailSrc: '/nosale-poster.png',
      momentSlice: 3,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 28,
    summary: {
      grossSales: 296,
      saleCount: 4,
      noSaleCount: 2,
      momentCount: 6,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 6,
    },
  },
  {
    year: 2026,
    month: 4,
    day: 29,
    summary: {
      grossSales: 1780,
      saleCount: 5,
      noSaleCount: 1,
      momentCount: 6,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 6,
    },
  },
  {
    year: 2026,
    month: 3,
    day: 14,
    summary: {
      grossSales: 645,
      saleCount: 3,
      noSaleCount: 1,
      momentCount: 4,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 4,
    },
  },
  {
    year: 2026,
    month: 3,
    day: 22,
    summary: {
      grossSales: 972,
      saleCount: 4,
      noSaleCount: 0,
      momentCount: 4,
      thumbnailSrc: '/sale-poster.jpg',
      momentSlice: 4,
    },
  },
]

const dayFeedMap = new Map<string, DayFeedSummary>()

for (const entry of calendarEntries) {
  const { year, month, day, summary } = entry
  const dateLabel = `${MONTH_NAMES[month]} ${day}, ${year}`
  const moments =
    year === 2026 && month === 4 && day === 28
      ? may28Moments
      : buildMoments(dateLabel, summary.momentSlice)

  dayFeedMap.set(dayKey(year, month, day), {
    grossSales: summary.grossSales,
    saleCount: summary.saleCount,
    noSaleCount: summary.noSaleCount,
    momentCount: summary.momentCount,
    thumbnailSrc: summary.thumbnailSrc,
    moments,
  })
}

export function getDayFeedSummary(
  year: number,
  month: number,
  day: number,
): DayFeedSummary | null {
  return dayFeedMap.get(dayKey(year, month, day)) ?? null
}

export function dayHasFeed(year: number, month: number, day: number): boolean {
  return dayFeedMap.has(dayKey(year, month, day))
}

export function formatGrossSales(amount: number): string {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function isToday(year: number, month: number, day: number): boolean {
  return (
    year === TODAY.year &&
    month === TODAY.month &&
    day === TODAY.day
  )
}

export function getCalendarCells(
  year: number,
  month: number,
): Array<number | null> {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = Array.from({ length: firstWeekday }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

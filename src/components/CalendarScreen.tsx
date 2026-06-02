import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FeedMoment } from '../mockData'
import {
  MONTH_NAMES,
  TODAY,
  WEEKDAY_LABELS,
  YEAR_OPTIONS,
  dayHasFeed,
  formatGrossSales,
  getCalendarCells,
  getDayFeedSummary,
  getFeedStartIndex,
  getPreviewMoment,
  sortMomentsChronologically,
  isToday,
} from '../calendarMockData'
import { AppShell } from './AppShell'
import { CalendarChevron, CalendarSelectField } from './CalendarChevron'
import { VideoPreviewThumbnail, type VideoPreviewHandle } from './VideoPreviewThumbnail'
import './CalendarScreen.css'

type CalendarScreenProps = {
  onOpenFeed: (moments: FeedMoment[], startIndex: number) => void
}

type SelectedDate = {
  year: number
  month: number
  day: number
}

const EMPTY_SUMMARY = {
  grossSales: 0,
  saleCount: 0,
  noSaleCount: 0,
  momentCount: 0,
  hasFeed: false,
  previewMoment: null as FeedMoment | null,
  feedStartIndex: 0,
  moments: [] as FeedMoment[],
}

export function CalendarScreen({ onOpenFeed }: CalendarScreenProps) {
  const [viewYear, setViewYear] = useState(TODAY.year)
  const [viewMonth, setViewMonth] = useState(TODAY.month)
  const [selected, setSelected] = useState<SelectedDate>({
    year: TODAY.year,
    month: TODAY.month,
    day: 18,
  })
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<VideoPreviewHandle>(null)

  const cells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const selectedSummary = useMemo(() => {
    const feed = getDayFeedSummary(selected.year, selected.month, selected.day)
    if (!feed) {
      return { ...EMPTY_SUMMARY }
    }

    const preview = getPreviewMoment(feed.moments)
    const sortedMoments = sortMomentsChronologically(feed.moments)

    return {
      grossSales: feed.grossSales,
      saleCount: feed.saleCount,
      noSaleCount: feed.noSaleCount,
      momentCount: feed.momentCount,
      hasFeed: true,
      previewMoment: preview?.moment ?? null,
      feedStartIndex: getFeedStartIndex(sortedMoments),
      moments: sortedMoments,
    }
  }, [selected])

  useEffect(() => {
    if (!pickerOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setPickerOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [pickerOpen])

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
      return
    }
    setViewMonth((m) => m - 1)
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
      return
    }
    setViewMonth((m) => m + 1)
  }

  const selectDay = (day: number) => {
    flushSync(() => {
      setSelected({ year: viewYear, month: viewMonth, day })
    })
    previewRef.current?.play()
  }

  useEffect(() => {
    previewRef.current?.play()
  }, [selectedSummary.previewMoment?.videoSrc])

  const openFeed = () => {
    if (selectedSummary.hasFeed) {
      onOpenFeed(selectedSummary.moments, selectedSummary.feedStartIndex)
    }
  }

  return (
    <AppShell surfaceClassName="calendar-screen__card">
      <header className="calendar-summary">
        <div className="calendar-summary__main">
          <p className="calendar-summary__label">Gross Sales</p>
          <p className="calendar-summary__amount">
            {formatGrossSales(selectedSummary.grossSales)}
          </p>
        </div>

        <div className="calendar-summary__preview-slot">
          {selectedSummary.previewMoment && (
            <VideoPreviewThumbnail
              key={selectedSummary.previewMoment.videoSrc}
              ref={previewRef}
              moment={selectedSummary.previewMoment}
              onClick={openFeed}
            />
          )}
        </div>

        <dl className="calendar-summary__stats">
          <div className="calendar-summary__stat">
            <dt>Sale</dt>
            <dd>{selectedSummary.saleCount}</dd>
          </div>
          <div className="calendar-summary__stat">
            <dt>No sale</dt>
            <dd>{selectedSummary.noSaleCount}</dd>
          </div>
          <div className="calendar-summary__stat">
            <dt>Events</dt>
            <dd>{selectedSummary.momentCount}</dd>
          </div>
        </dl>
      </header>

      <section className="calendar-panel" aria-label="Monthly calendar">
        <div className="calendar-panel__nav">
          <button
            type="button"
            className="calendar-panel__arrow"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <CalendarChevron direction="prev" />
          </button>

          <div className="calendar-panel__title-wrap" ref={pickerRef}>
            <button
              type="button"
              className="calendar-panel__title"
              onClick={() => setPickerOpen((open) => !open)}
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
            >
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <CalendarChevron direction="down" />
            </button>

            {pickerOpen && (
              <div className="calendar-picker" role="listbox">
                <CalendarSelectField label="Month">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                  >
                    {MONTH_NAMES.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </CalendarSelectField>
                <CalendarSelectField label="Year">
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </CalendarSelectField>
                <button
                  type="button"
                  className="calendar-picker__done"
                  onClick={() => setPickerOpen(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="calendar-panel__arrow"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <CalendarChevron direction="next" />
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="calendar-grid__weekday">
              {label}
            </div>
          ))}

          {cells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="calendar-grid__cell calendar-grid__cell--empty"
                />
              )
            }

            const isSelected =
              selected.year === viewYear &&
              selected.month === viewMonth &&
              selected.day === day
            const hasFeed = dayHasFeed(viewYear, viewMonth, day)
            const today = isToday(viewYear, viewMonth, day)
            const showDot = hasFeed && !isSelected

            return (
              <button
                key={`day-${day}`}
                type="button"
                className={[
                  'calendar-grid__cell',
                  'calendar-grid__day',
                  isSelected ? 'calendar-grid__day--selected' : '',
                  today && !isSelected ? 'calendar-grid__day--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectDay(day)}
                aria-label={`${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`}
                aria-pressed={isSelected}
              >
                <span className="calendar-grid__day-num">{day}</span>
                <span className="calendar-grid__dot-slot" aria-hidden>
                  {showDot && <span className="calendar-grid__feed-dot" />}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="calendar-screen__footer">
        <button
          type="button"
          className={`calendar-screen__cta ${selectedSummary.hasFeed ? 'calendar-screen__cta--enabled' : 'calendar-screen__cta--disabled'}`}
          disabled={!selectedSummary.hasFeed}
          onClick={openFeed}
        >
          View feed
        </button>
      </footer>
    </AppShell>
  )
}

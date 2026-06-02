import type { ReactNode } from 'react'

type CalendarChevronProps = {
  direction: 'prev' | 'next' | 'down'
  className?: string
}

export function CalendarChevron({ direction, className = '' }: CalendarChevronProps) {
  const glyph = direction === 'prev' ? '‹' : '›'

  return (
    <span
      className={[
        'calendar-chevron',
        direction === 'down' ? 'calendar-chevron--down' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {glyph}
    </span>
  )
}

export function CalendarSelectField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="calendar-picker__field">
      <span className="calendar-picker__field-label">{label}</span>
      <span className="calendar-picker__select-wrap">
        {children}
        <CalendarChevron direction="down" />
      </span>
    </label>
  )
}

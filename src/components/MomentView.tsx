import { forwardRef, type Ref } from 'react'
import type { FeedMoment } from '../mockData'
import { MomentBanner } from './MomentBanner'
import { NoSaleReceipt } from './NoSaleReceipt'
import { Receipt } from './Receipt'
import { VideoPlayer } from './VideoPlayer'
import './MomentView.css'

type VideoLoadMode = 'play' | 'prefetch' | 'idle'

type MomentViewProps = {
  moment: FeedMoment
  clipIndex: number
  clipTotal: number
  isActive?: boolean
  videoLoadMode?: VideoLoadMode
  layout?: 'slide'
  onClose?: () => void
}

export const MomentView = forwardRef(function MomentView(
  {
    moment,
    clipIndex,
    clipTotal,
    isActive = true,
    videoLoadMode = 'play',
    layout = 'slide',
    onClose,
  }: MomentViewProps,
  scrollRef: Ref<HTMLDivElement>,
) {
  return (
    <article
      className={`moment-view moment-view--${layout}`}
      aria-hidden={!isActive}
    >
      <div className="moment-view__fixed">
        <VideoPlayer
          dateLabel={moment.dateLabel}
          clipIndex={clipIndex}
          clipTotal={clipTotal}
          videoSrc={moment.videoSrc}
          posterSrc={moment.posterSrc}
          loadMode={videoLoadMode}
          isActive={isActive}
          onClose={onClose}
        />
        <MomentBanner variant={moment.kind === 'sale' ? 'sale' : 'no-sale'} />
      </div>
      <div ref={scrollRef} className="moment-view__scroll">
        <MomentScrollContent moment={moment} />
      </div>
    </article>
  )
})

function MomentScrollContent({ moment }: { moment: FeedMoment }) {
  if (moment.kind === 'sale') {
    return (
      <Receipt
        total={moment.total}
        lineItems={moment.lineItems}
        purchaseSubtotal={moment.purchaseSubtotal}
        gratuityLabel={moment.gratuityLabel}
        gratuity={moment.gratuity}
        taxLabel={moment.taxLabel}
        tax={moment.tax}
        paymentMethod={moment.paymentMethod}
        paymentType={moment.paymentType}
        timestamp={moment.timestamp}
        transactionId={moment.transactionId}
      />
    )
  }

  return (
    <NoSaleReceipt
      total={moment.total}
      fullDuration={moment.fullDuration}
      time={moment.time}
    />
  )
}

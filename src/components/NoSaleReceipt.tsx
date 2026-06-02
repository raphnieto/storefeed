import { formatCurrency } from '../mockData'
import './NoSaleReceipt.css'

type NoSaleReceiptProps = {
  total: number
  fullDuration: string
  time: string
}

export function NoSaleReceipt({ total, fullDuration, time }: NoSaleReceiptProps) {
  return (
    <section className="no-sale-receipt" aria-label="No sale details">
      <p className="no-sale-receipt__hero-amount">{formatCurrency(total)}</p>

      <div className="no-sale-receipt__details">
        <div className="no-sale-receipt__row">
          <span>Full Duration</span>
          <span>{fullDuration}</span>
        </div>
        <div className="no-sale-receipt__row">
          <span>Time</span>
          <span>{time}</span>
        </div>
      </div>
    </section>
  )
}

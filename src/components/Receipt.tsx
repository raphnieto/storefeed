import { formatCurrency, type SaleFeedMoment } from '../mockData'
import './Receipt.css'

type ReceiptProps = Pick<
  SaleFeedMoment,
  | 'total'
  | 'lineItems'
  | 'purchaseSubtotal'
  | 'gratuityLabel'
  | 'gratuity'
  | 'taxLabel'
  | 'tax'
  | 'paymentMethod'
  | 'paymentType'
  | 'timestamp'
  | 'transactionId'
>

export function Receipt({
  total,
  lineItems,
  purchaseSubtotal,
  gratuityLabel,
  gratuity,
  taxLabel,
  tax,
  paymentMethod,
  paymentType,
  timestamp,
  transactionId,
}: ReceiptProps) {
  return (
    <section className="receipt" aria-label="Transaction receipt">
      <p className="receipt__hero-amount">{formatCurrency(total)}</p>

      <ul className="receipt__items">
        {lineItems.map((item) => (
          <li key={item.name} className="receipt__row">
            <span>{item.name}</span>
            <span>{formatCurrency(item.price)}</span>
          </li>
        ))}
      </ul>

      <div className="receipt__breakdown">
        <div className="receipt__row">
          <span>Purchase Subtotal</span>
          <span>{formatCurrency(purchaseSubtotal)}</span>
        </div>
        <div className="receipt__row">
          <span>{gratuityLabel}</span>
          <span>{formatCurrency(gratuity)}</span>
        </div>
        <div className="receipt__row">
          <span>{taxLabel}</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="receipt__total-row receipt__row">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <footer className="receipt__footer">
        <div className="receipt__payment">
          <span>{paymentMethod}</span>
          {paymentType === 'credit' ? <CreditCardIcon /> : <CashIcon />}
        </div>
        <div className="receipt__meta">
          <span>{timestamp}</span>
          <span className="receipt__id">{transactionId}</span>
        </div>
      </footer>
    </section>
  )
}

function CashIcon() {
  return (
    <svg
      className="receipt__payment-icon"
      width="28"
      height="18"
      viewBox="0 0 28 18"
      fill="none"
      aria-hidden
    >
      <rect x="0.5" y="0.5" width="27" height="17" rx="2" stroke="#1a1a1a" />
      <circle cx="14" cy="9" r="4" stroke="#1a1a1a" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg
      className="receipt__payment-icon"
      width="32"
      height="20"
      viewBox="0 0 32 20"
      fill="none"
      aria-hidden
    >
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="#1a1a1a" />
      <rect x="0.5" y="4.5" width="31" height="4" fill="#1a1a1a" />
      <rect x="4" y="12" width="10" height="2" rx="1" fill="#1a1a1a" />
      <rect x="4" y="15.5" width="6" height="1.5" rx="0.75" fill="#1a1a1a" />
    </svg>
  )
}

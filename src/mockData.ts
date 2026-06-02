export type LineItem = {
  name: string
  price: number
}

type FeedMomentBase = {
  dateLabel: string
  videoSrc: string
  posterSrc: string
}

export type SaleFeedMoment = FeedMomentBase & {
  kind: 'sale'
  total: number
  lineItems: LineItem[]
  purchaseSubtotal: number
  gratuityLabel: string
  gratuity: number
  taxLabel: string
  tax: number
  paymentMethod: string
  paymentType: 'cash' | 'credit'
  timestamp: string
  transactionId: string
}

export type NoSaleFeedMoment = FeedMomentBase & {
  kind: 'no-sale'
  total: number
  fullDuration: string
  time: string
}

export type FeedMoment = SaleFeedMoment | NoSaleFeedMoment

export const feedMoments: FeedMoment[] = [
  {
    kind: 'sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video1.mp4',
    posterSrc: '/sale-poster.jpg',
    total: 31.76,
    lineItems: [
      { name: 'Yerba Mate', price: 16.45 },
      { name: 'Apricot Jam', price: 8.75 },
    ],
    purchaseSubtotal: 25.2,
    gratuityLabel: 'Gratuity (18%)',
    gratuity: 4.54,
    taxLabel: 'Colorado (8%)',
    tax: 2.02,
    paymentMethod: 'Cash',
    paymentType: 'cash',
    timestamp: 'May 28 2026 at 7:44 PM',
    transactionId: '#Z18T',
  },
  {
    kind: 'no-sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video3.mp4',
    posterSrc: '/nosale-poster.png',
    total: 0,
    fullDuration: '00:42',
    time: '8:04 PM',
  },
  {
    kind: 'sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video2.mp4',
    posterSrc: '/nosale-poster.png',
    total: 37.17,
    lineItems: [
      { name: 'Artisan Olive Oil', price: 18.0 },
      { name: 'Wildflower Honey', price: 11.5 },
    ],
    purchaseSubtotal: 29.5,
    gratuityLabel: 'Gratuity (18%)',
    gratuity: 5.31,
    taxLabel: 'Colorado (8%)',
    tax: 2.36,
    paymentMethod: 'Credit Card',
    paymentType: 'credit',
    timestamp: 'May 28 2026 at 8:12 PM',
    transactionId: '#K94M',
  },
  {
    kind: 'sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video4.mp4',
    posterSrc: '/sale-poster.jpg',
    total: 134.38,
    lineItems: [
      { name: 'Lavender Latte', price: 6.75 },
      { name: 'Pinot Noir Oregon', price: 23.0 },
      { name: 'Sourdough Loaf', price: 9.25 },
      { name: 'Matcha Powder', price: 14.5 },
      { name: 'Rosemary Sea Salt', price: 7.95 },
      { name: 'Local Goat Cheese', price: 12.5 },
      { name: 'Sparkling Water 4pk', price: 8.95 },
      { name: 'Baguette', price: 5.25 },
      { name: 'Smoked Salmon', price: 18.5 },
    ],
    purchaseSubtotal: 106.65,
    gratuityLabel: 'Gratuity (18%)',
    gratuity: 19.2,
    taxLabel: 'Colorado (8%)',
    tax: 8.53,
    paymentMethod: 'Credit Card',
    paymentType: 'credit',
    timestamp: 'May 28 2026 at 8:22 PM',
    transactionId: '#P73R',
  },
  {
    kind: 'no-sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video5.mp4',
    posterSrc: '/nosale-poster.png',
    total: 0,
    fullDuration: '00:38',
    time: '8:31 PM',
  },
  {
    kind: 'sale',
    dateLabel: 'May 28, 2026',
    videoSrc: '/video6.mp4',
    posterSrc: '/sale-poster.jpg',
    total: 92.87,
    lineItems: [
      { name: 'Cold Brew', price: 5.5 },
      { name: 'Granola Bowl', price: 12.0 },
      { name: 'Avocado Toast', price: 13.5 },
      { name: 'Fresh Orange Juice', price: 6.25 },
      { name: 'Dark Chocolate Bar', price: 8.0 },
      { name: 'Almond Croissant', price: 4.75 },
      { name: 'Iced Matcha', price: 7.25 },
      { name: 'Banana Bread', price: 6.5 },
      { name: 'Greek Yogurt Parfait', price: 9.95 },
    ],
    purchaseSubtotal: 73.7,
    gratuityLabel: 'Gratuity (18%)',
    gratuity: 13.27,
    taxLabel: 'Colorado (8%)',
    tax: 5.9,
    paymentMethod: 'Cash',
    paymentType: 'cash',
    timestamp: 'May 28 2026 at 8:47 PM',
    transactionId: '#M02L',
  },
]

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

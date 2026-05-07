export const STRIPE_PRODUCTS = [
  {
    label: '1:1 Session',
    priceId: 'price_1TUPk11E30KPiu7XBdToSwxk',
  },
  {
    label: 'Class Pass',
    priceId: 'price_1TUPlA1E30KPiu7XxfkxLC4r',
  },
  {
    label: 'Monthly Class Pass (Unlimited)',
    priceId: 'price_1TUPly1E30KPiu7XaEHoVIQQ',
  },
  {
    label: '5 PT 1:1 Session Package',
    priceId: 'price_1TUPnv1E30KPiu7XAP0rqulA',
  },
  {
    label: '10 PT 1:1 Session Package',
    priceId: 'price_1TUPpe1E30KPiu7XMuY1cTuk',
  },
  {
    label: 'Custom Amount',
    priceId: null,
  },
] as const

export type StripeProduct = typeof STRIPE_PRODUCTS[number]

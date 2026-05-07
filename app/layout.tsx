import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "L'Estrange Fitness"

export const metadata: Metadata = {
  title: {
    default: brandName,
    template: `%s — ${brandName}`,
  },
  description: 'Personal Training Client Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#222222',
              border: '1px solid #333333',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  )
}

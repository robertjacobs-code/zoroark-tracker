'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Zoroark Card Tracker</title>
        <meta name="description" content="Tracking every Zoroark card ever printed" />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f0f0f', color: '#f0f0f0' }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

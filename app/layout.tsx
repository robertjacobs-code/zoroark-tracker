'use client'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Zoroark Collection</title>
        <meta name="description" content="Tracking every Zoroark card ever printed" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", background: '#f5f3f0', color: '#1a1a1a' }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

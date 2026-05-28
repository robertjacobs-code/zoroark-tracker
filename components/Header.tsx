'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

const ALLOWED_ID = process.env.NEXT_PUBLIC_ALLOWED_DISCORD_USER_ID

export default function Header() {
  const { data: session } = useSession()
  const isAdmin = session && (session as any).discordId === process.env.NEXT_PUBLIC_ALLOWED_DISCORD_USER_ID

  return (
    <header style={{
      background: '#0d0d1a',
      borderBottom: '1px solid #1e1e3a',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: '#9f97ed', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          🦊 Zoroark Tracker
        </Link>
        <Link href="/binder" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none' }}>
          Binder View
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{ color: '#ef9f27', fontSize: 14, textDecoration: 'none' }}>
            Admin
          </Link>
        )}
      </div>
      <div>
        {session ? (
          <button
            onClick={() => signOut()}
            style={{ background: 'none', border: '1px solid #333', borderRadius: 6, color: '#aaa', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => signIn('discord')}
            style={{ background: '#5865f2', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            Sign in with Discord
          </button>
        )}
      </div>
    </header>
  )
}

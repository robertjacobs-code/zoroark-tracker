'use client'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  const isAdmin = session && (session as any).discordId === '387368293268324362'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(245,243,240,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '0 32px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#1a1a1a', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          ZOROARK
        </Link>
        <nav style={{ display: 'flex', gap: 24 }}>
          <Link href="/" style={{ color: '#666', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Collection</Link>
          <Link href="/binder" style={{ color: '#666', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Binder</Link>
          {isAdmin && <Link href="/admin" style={{ color: '#7f77dd', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Admin</Link>}
        </nav>
      </div>
      <div>
        {session ? (
          <button onClick={() => signOut()} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 6, color: '#666', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
            Sign out
          </button>
        ) : (
          <button onClick={() => signIn('discord')} style={{ background: '#5865f2', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}

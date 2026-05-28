import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session) return false
  const userId = (session as any)?.discordId
  return userId === process.env.ALLOWED_DISCORD_USER_ID
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')
}

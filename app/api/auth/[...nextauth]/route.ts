import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        token.discordId = (profile as any).id
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).discordId = token.discordId
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}) as any

export { handler as GET, handler as POST }

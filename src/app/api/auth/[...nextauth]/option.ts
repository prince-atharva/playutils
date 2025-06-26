import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { env } from '../../../../../server/config/env'
import connectDB from '../../../../../server/config/database'
import User, { Provider } from '../../../../../server/model/User.model'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      profile(profile) {
        return {
          id: profile.id?.toString?.() ?? profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url || profile.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB()
        console.log(user, account)
        const existingUser = await User.findOne({ email: user?.email, provider: account?.provider })
        console.log(existingUser)
        if (!existingUser) {
          let provider: Provider
          if (account?.provider === 'google') {
            provider = Provider.GOOGLE
          } else if (account?.provider === 'github') {
            provider = Provider.GITHUB
          } else {
            throw new Error('Unknown provider')
          }
          await User.create({
            name: user?.name,
            email: user?.email,
            image: user?.image,
            provider,
          })
        }
        return true
      } catch (err) {
        console.error('Error storing user in DB:', err)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        await connectDB()
        const dbUser = await User.findOne({ email: user.email, provider: account?.provider }) as typeof User.prototype
        if (dbUser) {
          token.id = dbUser._id.toString()
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user = { id: token.id as string }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === 'development',
}

// Google callback URL
// http://localhost:3000/api/auth/callback/google

// Github callback URL
// http://localhost:3000/api/auth/callback/github-
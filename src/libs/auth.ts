// src/libs/auth.ts

import CredentialProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { login, password } = credentials as { login: string; password: string }

        try {
          const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password })
          })

          const data = await res.json()

          if (!res.ok) {
            const errorMessage = data.message || 'An error occurred during login.'

            throw new Error(errorMessage)
          }

          if (data.status === 'success' && data.data) {
            const apiUserData = data.data

            const user = {
              id: String(apiUserData.userId),
              userId: apiUserData.userId,
              name: apiUserData.name,
              userName: apiUserData.userName,
              email: apiUserData.email,
              role: apiUserData.roleName,
              roleId: apiUserData.roleId,
              restaurantId: apiUserData.restaurantId,
              permissions: apiUserData.permissions,
              accessToken: apiUserData.accessToken,
              refreshToken: apiUserData.refreshToken,
              accessTokenExpiresAt: apiUserData.accessTokenExpiresAt
            }


return user
          } else {
            throw new Error(data.message || 'Login failed. Please try again.')
          }
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 Days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // CORRECTED: Assign to token.userId
        token.userId = user.userId
        token.name = user.name
        token.userName = user.userName
        token.email = user.email
        token.role = user.role
        token.roleId = user.roleId
        token.restaurantId = user.restaurantId
        token.permissions = user.permissions
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpiresAt = user.accessTokenExpiresAt
      }


return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.userId = token.userId
        session.user.name = token.name
        session.user.userName = token.userName
        session.user.email = token.email
        session.user.role = token.role
        session.user.roleId = token.roleId
        session.user.restaurantId = token.restaurantId
        session.user.permissions = token.permissions
        session.user.accessToken = token.accessToken
      }


return session
    }
  }
}

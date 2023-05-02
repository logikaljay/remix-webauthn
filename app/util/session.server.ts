import { createCookieSessionStorage, redirect } from "@remix-run/node"
import bcryptjs from "bcryptjs"
import { User } from "~/db/schema/users"

const cookieName = process.env.COOKIE_NAME ?? 'remix-webauthn'
const sessionSecret = process.env.COOKIE_SECRET
if (!sessionSecret) {
  throw new Error("COOKIE_SECRET must be set")
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: cookieName,
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
})

export async function getSession(request: Request) {
  let session = await storage.getSession(request.headers.get('cookie'))
  return session
}
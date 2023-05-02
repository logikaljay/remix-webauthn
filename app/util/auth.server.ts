import crypto from "node:crypto"
import { getSession, storage } from "./session.server";
import { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse
} from "@simplewebauthn/server"
import { 
  verifyAuthenticationResponse, 
  verifyRegistrationResponse 
} from "@simplewebauthn/server";
import { db } from "./db.server";
import { Users } from "~/db/schema/users";
import { Credentials } from "~/db/schema/credentials";
import { redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

export async function isLoggedIn(request: Request) {
  let session = await storage.getSession(request.headers.get('cookie'))
  return session.has('userId')
}


const HOST_SETTINGS = {
  expectedOrigin: process.env.APP_URL ?? 'http://localhost:3000',
  expectedRPID: process.env.RPID ?? 'localhost'
}

function binaryToBase64URL(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64url')
}

export async function register(request: Request) {
  let data = await request.json()
  const session = await storage.getSession(request.headers.get('cookie'))
  const challenge = session.get('challenge')
  const credential = data.credential as PublicKeyCredentialWithAttestationJSON
  const { email, username } = data
  let verification: VerifiedRegistrationResponse

  if (credential == null) {
    throw new Error("Invalid Credentials")
  }

  try {
    verification = await verifyRegistrationResponse({
      // @ts-ignore
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS
    })
  } catch (err) {
    console.error(err)
    throw err;
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed")
  }

  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed")
  }

  const user = db.insert(Users).values({
    email,
    username,
  }).returning().all()

  db.insert(Credentials).values({
    externalId: clean(binaryToBase64URL(credentialID)),
    publicKey: Buffer.from(credentialPublicKey),
    userId: user[0].id
  }).run()

  return {
    user: user[0]
  }
}

export async function login(request: Request) {
  const data = await request.json()
  const session = await getSession(request);
  const challenge = session.get('challenge')
  const email = data.email
  const credential = data.credential

  if (credential?.id == null) {
    return new Error("Invalid credentials")
  }

  const user = db.select({
    user: Users,
    credential: Credentials
  })
  .from(Users)
  .innerJoin(Credentials, eq(Users.id, Credentials.userId))
  .where(eq(Credentials.externalId, credential.id))
  .get()

  console.log(`user from db`, user, credential.id)

  if (!user) {
    throw new Error("Unknown user")
  }

  if (!user.credential) {
    throw new Error("Unknown user")
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: Uint8Array.from(user.credential.externalId as any),
        credentialPublicKey: Uint8Array.from(user.credential.publicKey as Buffer),
        counter: user.credential.signCount as number
      },
      ...HOST_SETTINGS
    })

    db.update(Credentials).set({
      signCount: verification.authenticationInfo.newCounter
    }).where(
      eq(Credentials.id, user.credential.id)
    )
  }
  catch (err) {
    console.error(err)
    throw err
  }

  if (!verification.verified || email !== user.user.email) {
    throw new Error("Login verification failed")
  }

  return user.user
}

export async function requireUser(request: Request) {
  const session = await getSession(request)
  return session.get('user')
}
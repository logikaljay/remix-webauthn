import { FormEvent, useEffect, useState } from "react"
import { supported, create, get } from "@github/webauthn-json"
import { generateChallenge, login } from "~/util/auth.server"
import { ActionArgs, LoaderArgs, json } from "@remix-run/node"
import { getSession, storage } from "~/util/session.server"
import { useLoaderData, useNavigate } from "@remix-run/react"
import LoginForm from "./login-form"
import Continue from "./continue"

export async function loader({ request }: LoaderArgs) {
  const challenge = generateChallenge()
  const session = await getSession(request)
  const rpId = process.env.RPID
  session.set('challenge', challenge)
  const user = session.get('user')
  return json({ rpId, challenge, user }, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}
export type Loader = typeof loader

export default function LoginPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const { rpId, challenge, user } = useLoaderData<typeof loader>()

  useEffect(() => {
    async function checkAvailability() {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsAvailable(available && supported())
    }

    checkAvailability()
  }, [])

  
  return (
    <div className="flex flex-col justify-between w-full h-full max-w-[500px] px-[80px] py-[40px] bg-slate-900">
      <div className="logo flex flex-row">
        <div className="w-14 h-14 bg-slate-400 mr-4 rounded" />
        <div>
          <p className="text-xl mt-1 text-normal-alt">webauthn</p>
          <p className="text-sm text-subdued">app</p>
        </div>
      </div>
      
      {user 
        ? <Continue />
        : <LoginForm />
      }

      <div className="status flex flex-row text-subdued">
        {!user
          ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="ml-2 font-medium">Not authenticated</p>
            </>
          )
          : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="ml-2 font-medium">Authenticated</p>
            </>
          )
        }
      </div>
    </div>
  )
}
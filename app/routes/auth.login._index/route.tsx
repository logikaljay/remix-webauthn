import { FormEvent, useEffect, useState } from "react"
import { supported, create, get } from "@github/webauthn-json"
import { generateChallenge, login } from "~/util/auth.server"
import { ActionArgs, LoaderArgs, json } from "@remix-run/node"
import { getSession, storage } from "~/util/session.server"
import { useLoaderData, useNavigate } from "@remix-run/react"

export async function loader({ request }: LoaderArgs) {
  const challenge = generateChallenge()
  const session = await getSession(request)
  const rpId = process.env.RPID
  session.set('challenge', challenge)
  return json({ rpId, challenge }, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}

export default function LoginPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const { rpId, challenge } = useLoaderData<typeof loader>()

  useEffect(() => {
    async function checkAvailability() {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsAvailable(available && supported())
    }

    checkAvailability()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const credential = await get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId
      }
    })

    const result = await fetch('/auth/login/callback', {
      method: 'POST',
      body: JSON.stringify({ email, credential }),
      headers: {
        'content-type': 'application/json'
      }
    })

    console.log(result)

    if (result.ok) {
      navigate('/admin')
    }
    else {
      const { message } = await result.json()
      setError(message)
    }
  }

  return (
    <>
      <h1>Login</h1>

      {isAvailable === null && (
        <p>Loading...</p>
      )}

      {isAvailable !== null && !isAvailable && (
        <p>Sorry, WebAuthn is not available in your browser.</p>
      )}

      {isAvailable && (
        <form method="POST" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <button type="submit">Login</button>
          {error != null ? <pre>{error}</pre> : null}
        </form>
      )}
    </>
  )
}
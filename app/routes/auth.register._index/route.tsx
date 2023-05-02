import { FormEvent, Fragment, useEffect, useState } from "react";
import { create, supported } from "@github/webauthn-json";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { generateChallenge, register } from "~/util/auth.server";
import { storage } from "~/util/session.server";
import { useLoaderData, useNavigate } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  console.log(`Loader running`)
  const challenge = generateChallenge()
  let session = await storage.getSession(request.headers.get('cookie'))
  session.set('challenge', challenge)
  return json({
    challenge
  }, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}

export async function action({ request }: ActionArgs) {
  const user = await register(request)
  let session = await storage.getSession(request.headers.get('cookie'))
  session.set('user', user)
  
  return redirect('/admin', {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState(null)

  const { challenge } = useLoaderData<typeof loader>()

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
    };
    checkAvailability();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const credential = await create({
      publicKey: {
        challenge,
        rp: {
          // change these
          name: 'next-webauthn',
          id: 'localhost'
        },
        user: {
          id: window.crypto.randomUUID(),
          name: email,
          displayName: username
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: 60000,
        attestation: 'direct',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required'
        }
      }
    })

    let result = await fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username,
        credential
      }),
      headers: {
        'content-type': 'application/json'
      }
    })

    if (result.ok) {
      navigate('/admin')
    }
    else {
      const { message } = await result.json()
      setError(message)
    }
  }

  return (
    <Fragment>
      <h1>Register Account</h1>
      {isAvailable && (
        <form method="POST" onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input type="submit" value="Register" />
          {error ? <pre>{error}</pre> : <></>}
        </form>
      )}

      {isAvailable !== null && !isAvailable && (
        <p>Sorry, WebAuthn is not available in your browser.</p>
      )} 

      {isAvailable === null && (
        <p>Loading..</p>
      )}
    </Fragment>
  );
}

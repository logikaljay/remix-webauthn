import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { FormEvent, useEffect, useState } from "react";
import { generateChallenge } from "~/util/auth.server";
import { storage } from "~/util/session.server";
import { Loader } from "./route";
import { create, supported } from "@github/webauthn-json";
import { Loading } from "~/components/loading";

export default function RegisterForm() {

  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { rpId, challenge } = useLoaderData<Loader>()

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
          name: rpId!.split('.')[0],
          id: rpId!
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
    <form name="loginForm" onSubmit={handleSubmit} method="POST">

      <h1 className="text-normal-alt text-5xl font-bold">Register</h1>

      <div className="mt-6 space-y-6">
        <input
          id="username"
          type="text"
          name="username"
          autoComplete="off"
          className="p-4 text-base placeholder:text-subdued text-normal w-full ring-2 ring-subdued focus:ring-brand rounded bg-transparent outline-none"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          id="email"
          type="text"
          name="email"
          autoComplete="off"
          className="p-4 text-base placeholder:text-subdued text-normal w-full ring-2 ring-subdued focus:ring-brand rounded bg-transparent outline-none"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        
        <input type="hidden" name="redirect" value="/admin" />

        {error && (
          <div className="validation w-full bg-slate-800 rounded-lg border-l-4 border-l-yellow-600">
            <div className="flex flex-row py-4 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-normal ml-4">
                {error}
              </span>
            </div>
          </div>
        )}

        <div className="actions flex">
          <button type="submit" className="bg-brand text-inherit py-3.5 px-12 rounded-lg hover:brightness-125 transform-color duration-300">
            {loading ? <Loading className="w-6 h-6 text-normal" /> : "Create account"}
          </button>

          <a href={`/auth/login`} className="ml-auto my-auto text-subdued hover:text-normal">Login</a>

        </div>
      </div>

    </form>
  )
}
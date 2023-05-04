import { useActionData, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { FormEvent, useState } from "react";

import { Loading } from "~/components/loading";
import type { Loader } from "./route"
import { get } from "@github/webauthn-json";

function LoginForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { rpId, challenge } = useLoaderData<Loader>()

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


  const actionData = useActionData()

  console.log(actionData)

  return (
    <form name="loginForm" onSubmit={handleSubmit} method="POST">

      <h1 className="text-normal-alt text-5xl font-bold">Sign In</h1>

      <div className="mt-6 space-y-6">
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
            {loading ? <Loading className="w-6 h-6 text-normal" /> : "Sign In"}
          </button>

          <a href={`/auth/register?email=${email}`} className="ml-auto my-auto text-subdued hover:text-normal">Create account</a>

        </div>
      </div>

    </form>
  )
}

export default LoginForm


import { FormEvent, Fragment, useEffect, useState } from "react";
import { create, supported } from "@github/webauthn-json";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { generateChallenge, register } from "~/util/auth.server";
import { storage } from "~/util/session.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import RegisterForm from "./register-form";
import Logout from "./logout";

export async function loader({ request }: LoaderArgs) {
  const challenge = generateChallenge()
  const rpId = process.env.RPID
  let session = await storage.getSession(request.headers.get('cookie'))
  const user = session.get('user')
  session.set('challenge', challenge)
  return json({
    rpId,
    challenge,
    user
  }, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}
export type Loader = typeof loader


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

  const { rpId, challenge, user } = useLoaderData<typeof loader>()

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
    <div className="flex flex-col justify-between w-full h-full max-w-[500px] px-[80px] py-[40px] bg-slate-900">
    <div className="logo flex flex-row">
      <div className="w-14 h-14 bg-slate-400 mr-4 rounded" />
      <div>
        <p className="text-xl mt-1 text-normal-alt">webauthn</p>
        <p className="text-sm text-subdued">app</p>
      </div>
    </div>
    
    {!user 
      ? <RegisterForm />
      : <Logout />
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

  );
}

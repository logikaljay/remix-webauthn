import { useLoaderData } from "@remix-run/react"
import { Loader } from "./route"

export default function Logout() {

  const { user } = useLoaderData<Loader>()

  function handleContinue() {}

  return (
    <div>
      <h1 className="text-normal-alt text-5xl font-bold">Register</h1>
      <div className="mt-6 space-y-6">
        <p className="text-normal">{user.email} is currently logged in. If this is you press continue. Otherwise please sign out.</p>

        <div className="actions flex">
          <a href="/admin/logout" className="my-auto text-subdued hover:text-normal">Sign out</a>
          
          <button onClick={handleContinue} type="button" className="ml-auto bg-brand text-inherit py-3.5 px-12 rounded-lg hover:brightness-125 transform-color duration-300">
            Continue
          </button>
        </div>
      </div>

    </div>
  )
}
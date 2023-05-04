import { LoaderArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/util/auth.server";
import { getSession } from "~/util/session.server";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request)
  let user = session.get('user')
  console.log('user', user)

  if (!user) {
    return redirect('/')
  }

  return json({ user })
}

export default function AdminPage() {
  let { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col m-auto max-w-lg">

      <h1 className="text-6xl font-medium pb-10">Welcome </h1>
      <pre className="bg-slate-900 text-white p-3 rounded-lg">{JSON.stringify(user ?? {}, null, 2)}</pre>
      <form action="/admin/logout">
        <button className="mt-10 ml-auto bg-brand text-inherit py-3.5 px-12 rounded-lg hover:brightness-125 transform-color duration-300">
          Log out
        </button>
      </form>
    </div>
  )
}
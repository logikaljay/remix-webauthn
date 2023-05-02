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
    <>
      <p>Admin page</p>
      <pre>{JSON.stringify(user ?? {}, null, 2)}</pre>
      <form method="post" action="/admin/logout">
        <button>Log out</button>
      </form>
    </>
  )
}
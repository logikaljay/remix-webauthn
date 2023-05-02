import { ActionArgs, json } from "@remix-run/node"
import { login } from "~/util/auth.server"
import { getSession, storage } from "~/util/session.server"

export async function action({ request }: ActionArgs) {
  try {
    const user = await login(request)
    const session = await getSession(request)
    session.set('user', user)
    return json({
      user
    }, {
      headers: {
        'Set-Cookie': await storage.commitSession(session)
      }
    })
  } catch (err) {
    return json({ message: (err as Error).message }, {
      status: 500
    })
  }
}
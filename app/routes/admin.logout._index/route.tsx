import { ActionArgs, redirect } from "@remix-run/node";
import { storage } from "~/util/session.server";

export async function loader({ request }: ActionArgs) {
  let session = await storage.getSession(request.headers.get('cookie'))
  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}
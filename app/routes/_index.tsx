import { LoaderArgs, redirect } from "@remix-run/node";

export async function loader() {
  return redirect('/auth/login')
}

export default function Page() {
  return (
    <p>!!!</p>
  )
}
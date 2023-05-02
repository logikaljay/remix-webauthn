import { LoaderArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { Credentials } from "~/db/schema/credentials";
import { Users } from "~/db/schema/users";
import { db } from "~/util/db.server";

export async function loader({ request }: LoaderArgs) {
   let user = db.select({
    user: Users,
    credential: Credentials
   })
   .from(Users)
   .innerJoin(Credentials, eq(Credentials.userId, Users.id))
   .where(eq(Credentials.externalId, "cdzXS08v20WxAfBA5i0ZejU9T_E"))
   .get()

   return json(user)
}
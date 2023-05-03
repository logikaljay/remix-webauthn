import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { db } from "./db"

async function main() {
  migrate(db, { migrationsFolder: "./app/db/migrations" })

  console.log(`✅ database has been migrated to latest version.`)
}

main()
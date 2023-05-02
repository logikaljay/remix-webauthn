import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"

type Database = ReturnType<typeof drizzle>

let db: Database

declare global {
  var __db: Database
}

if (process.env.NODE_ENV === 'production') {
  const sqlite = new Database('./dev.db')
  db = drizzle(sqlite)
}
else {
  if (!global.__db) {
    const sqlite = new Database('./dev.db')
    global.__db = drizzle(sqlite)
  }
  db = global.__db
}


export { db }
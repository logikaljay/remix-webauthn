import { InferModel } from "drizzle-orm"
import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const Users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email'),
  username: text('username'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
}, (users) => ({
  userIdx: uniqueIndex('idx_email').on(users.email),
  usernameIdx: uniqueIndex('idx_username').on(users.username)
}))

export type User = InferModel<typeof Users>
export type InsertUser = InferModel<typeof Users, 'insert'>
import { InferModel } from "drizzle-orm"
import { sqliteTable, integer, text, uniqueIndex, blob } from "drizzle-orm/sqlite-core"
import { Users } from "./users"

export const Credentials = sqliteTable('credentials', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => Users.id),

  name: text('name'),
  externalId: text('external_id'),
  publicKey: blob('public_key', { mode: 'buffer' }),
  signCount: integer('sign_count').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, (credentials) => ({
  externalIdIdx: uniqueIndex('idx_external_id').on(credentials.externalId),
  publicKeyIdx: uniqueIndex('idx_public_key').on(credentials.publicKey)
}))

export type Credential = InferModel<typeof Credentials>
export type InsertCredential = InferModel<typeof Credentials, 'insert'>
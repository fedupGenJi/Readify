## Scalable startup process (schema modules)

`src/db/init.js` runs on every server start and no longer contains the table
definitions itself - it just loops over `src/db/schema/index.js`: 

src/db/schema/
users.schema.js # { name: 'users', temporary: false, sql: [...] }
tempUsers.schema.js # { name: 'temp_users', temporary: true, sql: [...] }
index.js # registers all of the above, in order

- `temporary: false` tables → created with `CREATE TABLE IF NOT EXISTS` (data survives restarts)
- `temporary: true` tables → dropped and recreated every restart (always empty)

**To add a new table as the product grows** (e.g. `books`, `reviews`,
`bookmarks`): create `src/db/schema/books.schema.js` in the same shape, add
it to the array in `src/db/schema/index.js`, done - `init.js` itself never
needs to change. Once the schema gets complex enough that you want proper
up/down migrations and rollback history, this is also the natural place to
swap in a tool like `node-pg-migrate` without touching the rest of the app.

## Database design

**`users`** (permanent)
| column      | notes                                      |
|-------------|---------------------------------------------|
| user_id     | PK                                           |
| name        |                                               |
| username    | unique (case-insensitive)                    |
| gmail       | unique (case-insensitive)                    |
| password    | bcrypt hash, nullable (null for Google-only accounts) |
| google_id   | unique, nullable (null for local-only accounts) |

**`temp_users`** (wiped on every restart — a holding pen for unfinished flows)
| column          | used by                                    |
|-----------------|---------------------------------------------|
| name, username, gmail, password | local signup, pending OTP verification |
| password        | also used by password-reset (`signup_type = 'reset'`) — holds the *new* hashed password until OTP verification |
| otp, otp_expires_at | local signup OTP check, password-reset OTP check |
| google_id, pending_token | Google signup, pending username choice |
| signup_type     | `'local'`, `'google'`, or `'reset'`         |

> Note: for `'reset'` rows, `username` and `google_id` are left `NULL` — the
> partial unique index on `username` (`WHERE signup_type = 'local' AND
> username IS NOT NULL`) doesn't apply to these rows, so no schema change
> was needed to support password reset.
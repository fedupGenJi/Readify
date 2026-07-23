# Readify API Reference

Base URL: `http://localhost:5000/api` (or your deployed host)

All request/response bodies are JSON unless noted otherwise. Protected
routes require a header:
Authorization: Bearer <token>
---

## Auth

### `GET /auth/check-username?username=janedoe`
Live-check as the user types on a signup form (debounce ~300-500ms).

Checks, in order: format validity (3-20 chars, letters/numbers/underscore),
the permanent `users` table, and the `temp_users` table (catches a name
someone else has reserved mid-signup but hasn't OTP-verified yet).

**Response**
```json
{ "available": true }
```
```json
{ "available": false, "reason": "Username is already taken." }
```
> Convenience check only — the real guarantee is a DB-level unique index, so
> a race between two simultaneous signups still ends in one clean `409`.

---

### `POST /auth/signup`
```json
{ "name": "Jane Doe", "username": "janedoe", "gmail": "jane@example.com", "password": "secret123" }
```
Hashes the password, stores the signup in `temp_users` with a 6-digit OTP,
emails the OTP. Returns `201`. Nothing is written to `users` yet.

**Response**
```json
{ "message": "OTP sent to email. Verify to complete signup." }
```

---

### `POST /auth/verify-otp`
```json
{ "gmail": "jane@example.com", "otp": "123456" }
```
If the OTP matches and hasn't expired (10 min), creates the real `users` row,
deletes the temp row.

**Response**
```json
{ "token": "<jwt>", "user": { "userId": 1, "name": "Jane Doe", "username": "janedoe", "gmail": "jane@example.com" } }
```

---

### `POST /auth/resend-otp`
```json
{ "gmail": "jane@example.com" }
```
Generates a new OTP for an existing pending signup and re-sends it.

---

### `POST /auth/login`
```json
{ "gmail": "jane@example.com", "password": "secret123" }
```
**Response:** same shape as `verify-otp` — `{ token, user }`.

---

### Frontend integration notes — Google Sign-In

1. Set up [Google Identity Services](https://developers.google.com/identity/gsi/web)
   on the frontend using the **same** `GOOGLE_CLIENT_ID` as the backend `.env`.
2. Render the Google button/One Tap prompt. On successful sign-in, Google
   calls your callback with a `response.credential` — this is a signed JWT
   ID token, proving the user's Google identity (email, name, Google ID).
3. Send that token as-is to the backend:
```javascript
   const res = await fetch(`${API_BASE}/auth/google`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ idToken: response.credential }),
   });
   const data = await res.json();
```
4. Branch on the response:
   - Has `token` → user is fully logged in (covers both an existing Google
     account and an existing local account with a matching email). Store
     the token.
   - Has `needsUsername: true` → brand-new Google user. Show a "choose a
     username" screen, keeping `pendingToken` (and optionally `name`/`gmail`
     for display) around, then call:
```javascript
     const res = await fetch(`${API_BASE}/auth/google/complete-signup`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ pendingToken, username: chosenUsername }),
     });
```

**One-time setup checklist (Google Cloud Console):**
- OAuth consent screen configured (External user type, your test account
  added under "Test users" while unpublished).
- OAuth Client ID created as **Web application**, with every frontend origin
  (e.g. `http://localhost:3000`, your prod domain) listed under **Authorized
  JavaScript origins**. No redirect URIs needed — this flow doesn't use them.
- The same Client ID goes in the backend's `GOOGLE_CLIENT_ID` and the
  frontend's `initialize({ client_id })` / `data-client_id` — they must match
  exactly, or verification fails silently in the browser before your backend
  even sees a request.
  
### `POST /auth/google`
```json
{ "idToken": "<Google ID token from the frontend Sign-In button>" }
```
- Existing Google account/email → `{ token, user }` immediately (covers login
  and reusing an existing account).
- Brand new Google user → `{ needsUsername: true, pendingToken, name, gmail }`.
  Frontend should show a "choose a username" screen, then call the next endpoint.

---

### `POST /auth/google/complete-signup`
```json
{ "pendingToken": "<from the /auth/google response>", "username": "janedoe" }
```
Creates the real `users` row (name/email/Google ID come from the stashed temp
record; only the username is new).

**Response:** `{ token, user }`

---

### `GET /auth/me` 🔒 *protected*
Returns the logged-in user's public profile.

**Response**
```json
{ "user": { "userId": 1, "name": "Jane Doe", "username": "janedoe", "gmail": "jane@example.com" } }
```

---

## Password reset

Flow: check email exists → collect new password → send OTP → verify OTP → password is applied.

### `GET /auth/check-gmail?gmail=jane@example.com`
Frontend calls this on the "forgot password" form before showing the
new-password field.

**Response**
```json
{ "exists": true }
```
> Note: unlike signup/login errors, this endpoint does confirm whether an
> email is registered — that's a deliberate tradeoff for this UX. Don't reuse
> this pattern for anything more sensitive without discussing it first.

---

### `POST /auth/forgot-password`
```json
{ "gmail": "jane@example.com", "newPassword": "newSecret123" }
```
Hashes `newPassword` and stashes it alongside a fresh OTP in `temp_users`
(`signup_type = 'reset'`). Emails the OTP. **Nothing changes in `users` yet.**

**Response**
```json
{ "message": "OTP sent to email. Verify to complete password reset." }
```

---

### `POST /auth/verify-reset-otp`
```json
{ "gmail": "jane@example.com", "otp": "123456" }
```
Validates the OTP, then copies the already-hashed password from `temp_users`
into the real `users` row, and deletes the temp row.

**Response**
```json
{ "message": "Password updated successfully. Please log in." }
```

**Errors:** `404` no reset request found · `410` OTP expired · `400` incorrect OTP

## Profile

All three routes below work for logged-out visitors — they use optional
auth, not required auth. If a valid `Authorization: Bearer <token>` header
is sent, the response is tailored to who's asking; if not, the viewer is
treated as a stranger.

**Visibility rule** for `posts` and `quotes` (both have a `PUBLIC |
PRIVATE | JUST_ME` field), based on the viewer's relationship to the
profile owner:

| relationship | sees |
|---|---|
| `self` (own profile) | PUBLIC + PRIVATE + JUST_ME |
| `friend` (mutual follow — both users follow each other) | PUBLIC + PRIVATE |
| `stranger` (everyone else, incl. logged-out) | PUBLIC only |

`reviews` are not part of this system — a review is essentially a post
with a rating attached, and is always public regardless of relationship.

---

### `GET /users/:username`
Core profile info + counts. `relationship` tells the frontend which of the
three tiers above applies to this viewer.

**Response**
```json
{
  "user": {
    "userId": 1, "name": "Jane Doe", "username": "janedoe",
    "profilePicture": null, "bio": "..."
  },
  "isOwnProfile": true,
  "relationship": "self",
  "followersCount": 42,
  "followingCount": 17,
  "reviewsCount": 5
}
```
`gmail` and `isFirstLogin` are only included in `user` when `isOwnProfile`
is `true`.

---

### `GET /users/:username/quotes?limit=3`
Most recent quotes, newest first, filtered by the visibility rule above.

**Response**
```json
{
  "quotes": [
    {
      "quoteId": 12, "quote": "...", "visibility": "PUBLIC",
      "createdAt": "...", "book": { "bookId": 3, "title": "...", "author": "..." }
    }
  ]
}
```

---

### `GET /users/:username/posts?limit=3&offset=0`
Paginated, filtered by the visibility rule above. Each post includes its
like count (post likes only). No comments included.

Call once with `limit=3&offset=0` for a fast first paint, then again with a
larger `limit` and `offset=3` to load the rest.

**Response**
```json
{
  "posts": [
    {
      "postId": 8, "caption": "...", "visibility": "PUBLIC",
      "createdAt": "...", "likeCount": 4,
      "book": { "bookId": 3, "title": "...", "author": "..." }
    }
  ],
  "limit": 3,
  "offset": 0,
  "hasMore": true
}
```

---

### `GET /users/:username/reviews?limit=3&offset=0`
Paginated, always public — no relationship check applied. Same response
shape as `posts` above, with `reviewId`, `rating`, `review` instead of
`postId`/`caption`, and no `visibility` or `likeCount` fields.
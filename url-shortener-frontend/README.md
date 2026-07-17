# shortnr:// — frontend

A React + Tailwind CSS frontend for the URL Shortener Service backend, styled as a terminal.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Connecting to the backend

The API base URL is read from the `VITE_API_URL` environment variable (see `.env`).
By default it points at `http://localhost:8000`, which matches the backend's default port.

If your backend runs elsewhere, edit `.env`:

```
VITE_API_URL=http://localhost:8000
```

## What it does

- **Signup / Login** — `POST /user/signup`, `POST /user/login`. The JWT returned from login
  is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every
  authenticated request.
- **Shorten a URL** — `POST /shorten` with an optional custom code.
- **List your links** — `GET /codes`.
- **Delete a link** — `DELETE /codes/:id`.
- Clicking a shortened link hits `GET /:shortCode` on the backend, which 302-redirects
  to the original URL.

## Backend note

The backend (`index.js`) needs CORS headers to accept requests from this frontend's
origin (a different port). A small CORS middleware was added to `index.js` for this —
no extra dependency required.

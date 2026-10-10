# Husmusen app

The frontend for Husmusen

## Configuration

Environment files belong in `husmusen-app/`, beside `package.json`:

- `.env.example` lists the expected variables and is committed to Git.
- `.env.local` holds local values and is ignored by Git. Fill it in before working on the Google integration; on a fresh checkout, copy `.env.example` to `.env.local`.

```dotenv
VITE_GOOGLE_CLIENT_ID=
```

`VITE_GOOGLE_CLIENT_ID` is the public Google OAuth web client ID intended for Google sign-in and read-only Calendar authorization. Its value typically looks like `1234567890-abcdef.apps.googleusercontent.com`. It is not an API key or client secret. Do not put a Google client secret in a `VITE_` variable: Vite exposes these variables in the browser bundle.

For local development, use your own dev client ID and register the local origin, such as `http://localhost:5173`, in that client's Authorized JavaScript origins. Match the actual port used by the dev server. The repository deliberately supplies no default client ID.

### Vercel

Set the Vercel project's Root Directory to `husmusen-app`. In Project Settings → Environment Variables, add `VITE_GOOGLE_CLIENT_ID` with the Google test client's ID. 

Vercel supplies the variable during the build, so `.env.local` is not uploaded or needed there. Existing process environment variables take precedence over values in Vite's env files. Changing the value on Vercel requires a new deployment.

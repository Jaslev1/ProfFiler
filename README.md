# Prof. Filer — Web App

AI-powered personality assessment. Built with vanilla HTML/CSS/JS + a Vercel serverless proxy to the Anthropic API.

## Repo structure

```
prof-filer/
├── index.html          # Entire front-end (fonts + assets embedded)
├── api/
│   └── analyze.js      # Serverless proxy — keeps API key off the client
├── vercel.json         # Vercel routing + cache + security headers
├── .gitignore
└── README.md
```

## Deploy to Vercel (first time)

### 1. Push to GitHub

```bash
git clone https://github.com/YOUR_USERNAME/prof-filer.git
cd prof-filer
# copy these files in, then:
git add .
git commit -m "Initial deploy"
git push
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `prof-filer`
3. Framework preset: **Other**
4. Root directory: `.` (leave as-is)
5. Click **Deploy**

### 3. Add the API key environment variable

In the Vercel dashboard → your project → **Settings → Environment Variables**:

| Name | Value | Environments |
|------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Production, Preview, Development |

Then go to **Deployments → Redeploy** (top-right) to apply it.

### 4. Add your custom domain

Vercel dashboard → **Settings → Domains** → add `prof-filer.com`

Point your DNS:
- `A` record: `76.76.21.21`
- `CNAME` for `www`: `cname.vercel-dns.com`

---

## Subsequent deploys

Just push to `main` — Vercel auto-deploys on every push.

```bash
git add .
git commit -m "Update copy"
git push
```

---

## Local development

```bash
# Install Vercel CLI (once)
npm install -g vercel

# Create local env file
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Run locally (serves index.html + api/ functions)
vercel dev
# → http://localhost:3000
```

---

## How the API proxy works

The browser calls `/api/analyze` (same origin — no CORS issues, no key exposure).

`api/analyze.js` adds the secret `x-api-key` header and forwards the request to
`https://api.anthropic.com/v1/messages`, then pipes the response back.

The client sends exactly the same JSON body the Anthropic API expects:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "messages": [{ "role": "user", "content": "..." }]
}
```

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key (`sk-ant-...`) |

# Prof. Filer — Deployment Guide

## What's been built

A single self-contained HTML file (`prof_filer_site.html`) that replaces the entire
WordPress/Elementor site. It contains:

- All brand fonts embedded (SF Orson Casual + Gilroy family)
- All brand assets embedded (logo as base64)
- 4 pages: Home, About, Methodology, Quiz
- Full working quiz with Claude API integration
- No external dependencies except the Anthropic API call

---

## Option A — Replace existing WordPress page (Recommended)

The fastest way to deploy without changing hosting:

1. Log in to WordPress admin at `prof-filer.com/wp-admin`
2. Go to **Pages → The Quiz** (or whichever page you want to replace)
3. Switch the editor to **Code Editor** (three dots → Code Editor)
4. Delete all existing content
5. Paste the entire contents of `prof_filer_site.html` into the body
6. Remove the Elementor template from the page template dropdown (set to Default)
7. Publish

> Note: For full site replacement, you'd repeat for each page or use a single
> full-page template.

---

## Option B — Deploy as a standalone site (Cleanest)

### Vercel (free, instant)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Create a project folder
mkdir prof-filer-v2 && cd prof-filer-v2

# 3. Rename and place the HTML file
cp path/to/prof_filer_site.html index.html

# 4. Create vercel.json
cat > vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
EOF

# 5. Deploy
vercel --prod
```

After deploying, point your domain DNS:
- Add a CNAME record: `www` → `cname.vercel-dns.com`
- Or use the Vercel dashboard to add your custom domain

---

## Option C — Netlify Drop (30 seconds, no CLI)

1. Go to https://app.netlify.com/drop
2. Drag and drop the `prof_filer_site.html` file (rename to `index.html` first)
3. Netlify gives you a live URL instantly
4. Add custom domain in Netlify dashboard

---

## Option D — GitHub Pages

```bash
# 1. Create a new GitHub repo

# 2. Clone it
git clone https://github.com/YOUR_USERNAME/prof-filer.git
cd prof-filer

# 3. Copy file
cp path/to/prof_filer_site.html index.html

# 4. Push
git add .
git commit -m "Deploy Prof. Filer site v2"
git push

# 5. Enable GitHub Pages in repo Settings → Pages → main branch
```

---

## Claude API Key Setup

The quiz calls the Anthropic API directly from the browser. You need to handle
the API key securely — **never hardcode it in a public file**.

### Recommended: Use a serverless proxy

Create a simple Vercel serverless function:

**File: `/api/analyze.js`**
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  res.json(data);
}
```

Then in the HTML, change the fetch URL from:
```javascript
fetch('https://api.anthropic.com/v1/messages', { ... })
```
to:
```javascript
fetch('/api/analyze', { ... })
```

Set the environment variable in Vercel dashboard:
- Key: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...`

### Quick test (direct API — for dev/internal use only)
The current build calls the API directly. Claude.ai artifacts have special
API access built in, but on a public site you'll need the proxy approach above.

---

## Files needed for deployment

```
prof-filer-v2/
├── index.html          ← rename prof_filer_site.html to this
├── vercel.json         ← (if using Vercel)
└── api/
    └── analyze.js      ← (if using serverless proxy)
```

---

## Bugs fixed in this version vs the WordPress build

| Issue | Status |
|-------|--------|
| SyntaxError: Invalid regular expression | ✅ Fixed |
| Methodology nav link not clickable | ✅ Fixed |
| Quiz nav link not clickable (duplicate in header) | ✅ Fixed |
| Slow load (WordPress/Elementor overhead) | ✅ Eliminated — pure HTML |
| Oversized hero banner | ✅ Redesigned — compact nav |
| Missing brand fonts | ✅ SF Orson Casual + Gilroy embedded |
| Clunky quiz UI | ✅ Rebuilt with smooth transitions |
| Report loading states | ✅ Animated loading with Prof. mascot |

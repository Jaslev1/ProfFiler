export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic origin check — update with your actual domain
  const allowed = [
    'https://prof-filer.com',
    'https://www.prof-filer.com',
    /\.vercel\.app$/,
  ];
  const origin = req.headers.origin || '';
  const isAllowed = allowed.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );

  if (origin && !isAllowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();

    // Pass through status and body
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Upstream error:', err);
    res.status(502).json({ error: 'Failed to reach Anthropic API' });
  }
}

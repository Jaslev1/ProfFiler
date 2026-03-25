export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages, max_tokens } = req.body;

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: max_tokens || 1000,
        messages: messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'OpenAI error' });
    }

    // Return in Anthropic-compatible shape so app.js needs zero changes
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ type: 'text', text: text }] });

  } catch (err) {
    console.error('API error:', err);
    res.status(502).json({ error: 'Failed to reach API' });
  }
}

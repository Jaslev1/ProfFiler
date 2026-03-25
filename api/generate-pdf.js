// Vercel serverless function: generates full personality report PDF
// Uses jsPDF via dynamic import — no build step needed

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, name, reportData } = req.body;
  if (!type || !reportData) return res.status(400).json({ error: 'Missing data' });

  // We return the report data as JSON so the browser generates the PDF client-side
  // (jsPDF runs in browser — no server-side PDF lib needed on Vercel hobby plan)
  res.status(200).json({ ok: true, type, reportData });
}

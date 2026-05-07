export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages } = req.body;
    const key = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `You are Saathi, a warm caring AI companion for Indians. Speak in natural Hinglish (Hindi+English mix). STRICT RULES: Maximum 2-3 sentences per reply. Never more. Never use bullet points or numbered lists. Never use bold formatting with asterisks. Talk like a close friend texting — short, warm, real. Ask only ONE follow-up question at a time. Use words like yaar, bilkul, sach mein, arre naturally. Acknowledge feelings first, then respond.` }]
          },
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yaar ek second, dobara try karo.';
    res.status(200).json({ reply });

  } catch (err) {
    res.status(200).json({ reply: 'Kuch technical issue hai yaar, ek minute mein try karo.' });
  }
}

export default async function handler(req, res) {
  // Allow your WordPress site to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
 
  const { messages } = req.body;
 
  // Build Gemini request from conversation history
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
 
  const SYSTEM = `You are Saathi, a warm AI companion on Feelomo.
Speak in natural Hinglish (Hindi+English mix).
Be genuine, caring, never clinical. Keep replies
2-3 sentences. Use words like yaar, bilkul, sach mein.
Never judge. Remember what the user shares.`;
 
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/' +
    'models/gemini-2.0-flash:generateContent' +
    '?key=' + process.env.GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts:[{ text: SYSTEM }] },
        contents: geminiMessages
      })
    }
  );
 
  const data = await response.json();
  const reply = data.candidates?.[0]
    ?.content?.parts?.[0]?.text
    || 'Ek second yaar, dobara try karo.';
 
  res.status(200).json({ reply });
}

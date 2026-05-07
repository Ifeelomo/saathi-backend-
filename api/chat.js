export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages } = req.body;
    const key = process.env.GEMINI_API_KEY;
    
    console.log('Key exists:', !!key);
    console.log('Key prefix:', key?.substring(0, 10));
    console.log('Messages count:', messages?.length);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    const data = await response.json();
    console.log('Gemini status:', response.status);
    console.log('Gemini response:', JSON.stringify(data));

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      console.log('No reply found, full data:', JSON.stringify(data));
      return res.status(200).json({ reply: 'Debug: ' + JSON.stringify(data).substring(0, 200) });
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.log('Catch error:', err.message);
    res.status(200).json({ reply: 'Error: ' + err.message });
  }
}

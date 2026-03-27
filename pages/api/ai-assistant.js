export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, systemPrompt } = req.body;
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(200).json({ 
        response: 'AI-assistenten er ikke konfigurert. Kontakt administrator for å sette opp API-nøkkel.' 
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const reply = data.content[0]?.text || 'Kunne ikke få svar fra AI';

    res.status(200).json({ response: reply });
  } catch (error) {
    console.error('AI API error:', error);
    res.status(200).json({ 
      response: 'Noe gikk galt med AI-assistenten. Prøv igjen senere.' 
    });
  }
}
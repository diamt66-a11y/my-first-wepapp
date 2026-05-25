module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    if (!apiKey) {
      return res.status(500).json({ message: 'API key is not configured in Vercel' });
    }

    const prompt = `너는 내 웹사이트에 방문한 사람들을 친절하게 맞이하고 질문에 답해주는 AI 비서야. 무조건 한국어로 짧고 명확하게, 이모티콘을 섞어서 친절하게 대답해줘. 사용자의 말: ${message}`;
    
    // 지원되는 최신 모델인 gemini-2.5-flash를 사용합니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
       console.error("Gemini API Error:", data);
       return res.status(500).json({ message: '디버그 오류: ' + (data.error?.message || JSON.stringify(data)) });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return res.status(500).json({ message: '디버그 오류: ' + (error.message || String(error)) });
  }
}

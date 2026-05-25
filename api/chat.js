const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Vercel 환경변수에서 API 키 가져오기
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API key is not configured in Vercel' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // AI에게 성격 부여
    const prompt = `너는 내 웹사이트에 방문한 사람들을 친절하게 맞이하고 질문에 답해주는 AI 비서야. 무조건 한국어로 짧고 명확하게, 이모티콘을 섞어서 친절하게 대답해줘. 사용자의 말: ${message}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return res.status(500).json({ message: '디버그 오류: ' + (error.message || String(error)) });
  }
}

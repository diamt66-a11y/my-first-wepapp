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

    // 사용 가능한 모델 목록을 확인하는 디버그 모드로 임시 전환합니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
       console.error("Gemini API Error:", data);
       return res.status(500).json({ message: '디버그 오류: ' + (data.error?.message || JSON.stringify(data)) });
    }

    // 접근 가능한 모델 이름들을 콤마로 연결해서 보여줍니다.
    const availableModels = data.models ? data.models.map(m => m.name).join(', ') : '사용 가능한 모델이 없습니다.';
    return res.status(200).json({ reply: '현재 열쇠로 열 수 있는 방 목록: ' + availableModels });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return res.status(500).json({ message: '디버그 오류: ' + (error.message || String(error)) });
  }
}

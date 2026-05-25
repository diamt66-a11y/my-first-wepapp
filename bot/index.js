const { GoogleGenerativeAI } = require("@google/generative-ai");
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const payload = github.context.payload;
    if (!payload.issue) return;
    
    const issueTitle = payload.issue.title;
    const issueBody = payload.issue.body;
    console.log(`요청사항 접수: ${issueTitle}`);

    // 기존 index.html 파일 읽기
    const htmlContent = fs.readFileSync('../index.html', 'utf8');

    // 구글 Gemini AI 가동
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AI에게 내릴 명령문
    const prompt = `
    다음은 현재 내 웹사이트 HTML 코드야:
    \`\`\`html
    ${htmlContent}
    \`\`\`
    
    사용자의 요청: ${issueTitle} / ${issueBody}
    이 요청사항을 반영해서 전체 HTML 코드를 새로 짜줘. 다른 설명은 다 빼고 오직 \`\`\`html 로 시작하는 코드만 줘.
    `;

    console.log("AI 생각 중...");
    const result = await model.generateContent(prompt);
    let newHtml = (await result.response).text();

    // AI가 준 코드에서 필요없는 기호 빼기
    newHtml = newHtml.replace(/```html/g, '').replace(/```/g, '').trim();

    // 덮어쓰기 완료
    fs.writeFileSync('../index.html', newHtml, 'utf8');
    console.log("파일 수정 완료!");

  } catch (error) {
    console.error("오류 발생:", error);
    try {
      const token = process.env.GITHUB_TOKEN;
      if (token && github.context.payload.issue) {
        const octokit = github.getOctokit(token);
        await octokit.rest.issues.createComment({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.payload.issue.number,
          body: `🤖 앗! 코드를 고치려다 실패했습니다. 구글 AI 에러 내용:\n\`\`\`\n${error.message || String(error)}\n\`\`\``
        });
      }
    } catch (commentError) {
      console.error("댓글 달기 실패:", commentError);
    }
    process.exit(1);
  }
}
run();

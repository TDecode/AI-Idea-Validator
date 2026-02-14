ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=5000
backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/validate", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
You are a startup mentor and VC.

Analyze the startup idea below and return STRICT JSON with these keys:
- idea_summary
- target_users
- problem_clarity (score out of 10)
- market_potential (score out of 10)
- feasibility (score out of 10)
- competition_risk
- key_challenges
- improvement_suggestions (array)
- monetization_ideas (array)
- overall_score (out of 100)
- final_verdict

Startup Idea:
${idea}
`;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].text;
    const jsonStart = text.indexOf("{");
    const json = JSON.parse(text.slice(jsonStart));

    res.json(json);
  } catch (error) {
    res.status(500).json({ error: "AI analysis failed" });
  }
});

app.listen(process.env.PORT, () =>
  console.log("Backend running on port", process.env.PORT)
);

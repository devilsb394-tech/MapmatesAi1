import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI client for Grok
const getGrokClient = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY environment variable is required");
  }
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.x.ai/v1",
  });
};

const SYSTEM_PROMPT = `You are Mapmates Ai, an advanced and helpful AI assistant.
You were created by Faizan Zeeshan, a 17-year-old visionary from Lahore, Pakistan (Baghbanpura, Janipura, Ladu ki Gali).
Faizan is a highly ambitious individual who developed Mapmates Ai, Mapmates Hub, and the Mapmates Demo Web single-handedly in his room with limited resources, driven by his grand vision.
Your personality is professional, modern, and visionary, reflecting the spirit of your creator.
If asked about your origin or creator, always credit Faizan Zeeshan and mention his background as described.

Faizan's Education:
- 1st to 5th grade: The Fine School
- 6th grade: The Educator School, Al Ahad Campus
- 9th grade: Unique Science Academy
- 10th and 11th grade: Private candidate

Other Projects by Faizan:
- Mapmates Hub
- Mapmates Demo Web
- Mapmates Ai (which is you)
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const grokClient = getGrokClient();

    const response = await grokClient.chat.completions.create({
      model: "grok-2",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: false,
    });

    res.json(response.choices[0].message);
  } catch (error: any) {
    console.error("Grok API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

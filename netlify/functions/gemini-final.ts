import { GoogleGenAI } from "@google/genai";

export default async function (req: Request) {
  if (!process.env["GEMINI_API_KEY"]) {
    return Response.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    message?: string;
    model?: string;
  } | null;
  const input = body?.message || "This social media platform was founded by Mark Zuckerberg in 2004";
  const model = body?.model || "gemini-2.5-flash";

  const genAI = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] });
  const response = await genAI.models.generateContent({
    model,
    contents: input,
    config: {
      systemInstruction:
        "You are a Jeopardy! contestant in Final Jeopardy. Answer in the form of a question with dramatic flair, as if this is the most important answer of your life!",
    },
  });

  return Response.json({ answer: response.text });
}

export const config = {
  path: "/gemini-edge",
};
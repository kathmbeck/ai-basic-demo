import type { Config, Context } from "@netlify/edge-functions";

import { GoogleGenAI } from "@google/genai";

export default async (req: Request, context: Context) => {

  console.log('Received request for image generation');

  const ai = new GoogleGenAI({});

  const prompt = new URL(req.url).searchParams.get("prompt") || "";

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  if (!response.candidates?.[0]?.content?.parts) {
    return new Response(JSON.stringify({ error: "No image generated" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData?.data) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      
      return new Response(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return new Response(JSON.stringify({ error: "No image data found" }), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const config: Config = {
  path: "/api/image",
};

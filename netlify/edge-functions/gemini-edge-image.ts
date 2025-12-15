import type { Config, Context } from "@netlify/edge-functions";
import { GoogleGenAI } from "@google/genai";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {

  console.log('Received request for image generation', Date.now());

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

  const encoded = btoa(prompt);
  const promptKey = 'v0' + encoded.slice(0, 25) + '_' + encoded.slice(-25) + '.png';

  console.log('Generated prompt key: ', promptKey);

  // pull from netlify blob store if exists
  const store = getStore("some-store");
  console.log('get store');
  const check = await store.get('something-easy.txt');
  console.log('check store read:', check ? 'found something-easy.txt' : 'nothing found for something-easy.txt');


  const existing = await store.get(promptKey, { type: "arrayBuffer" });

  if (existing) {
    console.log('Cache hit: ', promptKey)

    return new Response(existing, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  console.log('Cache miss: ', promptKey)

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

      await store.set(promptKey, arrayBuffer);
      console.log("Image saved to blob store with key:", promptKey);

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
  path: "/api/image-gen",
};

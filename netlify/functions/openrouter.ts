import { OpenRouter } from "@openrouter/sdk";

export default async function (req: Request) {
  if (
    !process.env["OPENROUTER_API_KEY"] ||
    !process.env["OPENROUTER_BASE_URL"]
  ) {
    return Response.json(
      { error: "OPENROUTER_API_KEY or OPENROUTER_BASE_URL is not set" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    message?: string;
    model?: string;
  } | null;
  const input = body?.message || "This four-letter country borders Vietnam";
  const model = body?.model || "z-ai/glm-5.2";

  // Key and base URL are read from OPENROUTER_API_KEY / OPENROUTER_BASE_URL
  // (SDK 1.2.43+).
  const client = new OpenRouter();
  const response = await client.chat.send({
    chatRequest: {
      model,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are a Jeopardy! contestant. Answer in the form of a question.",
        },
        {
          role: "user",
          content: input,
        },
      ],
    },
  });

  if (!("choices" in response)) {
    return Response.json(
      { error: "unexpected streaming response" },
      { status: 500 },
    );
  }

  const content = response.choices?.[0]?.message?.content;
  return Response.json({
    answer: typeof content === "string" ? content : "",
  });
}

export const config = {
  path: "/openrouter",
};

import Anthropic from "@anthropic-ai/sdk";

export default async function (req: Request) {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    message?: string;
    model?: string;
  } | null;
  const input = body?.message || "This four-letter country borders Vietnam";
  const model = body?.model || "claude-haiku-4-5";
  console.log("Making Anthropic request", {
    model: "claude-3-5-haiku-20241022",
    input,
  });

  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: "You are a Jeopardy! contestant. Answer in the form of a question.",
    messages: [
      {
        role: "user",
        content: input,
      },
    ],
  });

  return Response.json({ answer: response.content[0].text });
}

export const config = {
  path: "/anthropic",
};

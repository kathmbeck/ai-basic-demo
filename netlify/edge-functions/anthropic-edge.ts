import Anthropic from "@anthropic-ai/sdk";

export default async function (req: Request) {
  console.log(process.env)
  console.log('All headers:', Object.fromEntries(req.headers.entries()))

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
  const input = body?.message || "This streaming service launched in 2007 by Reed Hastings";
  const model = body?.model || "claude-3-5-sonnet-20241022";
  console.log("Making Anthropic Double Jeopardy request", {
    model,
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
  path: "/anthropic-edge",
};

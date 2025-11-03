async function callAnthropic() {
	const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
	const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL;

	const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': ANTHROPIC_API_KEY as string,
			'anthropic-version': '2023-06-01',
			'user-agent': 'anthropic/' // Required temporarily
		},
		body: JSON.stringify({
			model: 'claude-sonnet-4-5-20250929',
			max_tokens: 1024,
			messages: [{ role: 'user', content: 'Tell me a topical joke, that is in no way offensive' }]
		})
	});

	return await response.json();
}

export default async () => {
	const res = await callAnthropic()


	return new Response(JSON.stringify(res), { status: 200 })
};
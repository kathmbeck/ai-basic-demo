export default async function(req, context) {
  console.log('Testing Mastra with AI Gateway');

  try {
    // Try to import and use Mastra core
    // @ts-ignore - Mastra may not have full TypeScript definitions yet
    const { Mastra } = await import('@mastra/core');
    
    // Basic Mastra setup - let's see what the actual API looks like
    const mastra = new Mastra();

    // If Mastra has a simple text generation or chat method, use it
    const prompt = 'I want to build a modern todo application. Can you provide a step-by-step plan focusing on the core features and implementation approach?';
    
    // Try different possible methods that Mastra might have
    let result;
    if (typeof mastra.generate === 'function') {
      result = await mastra.generate(prompt);
    } else if (typeof mastra.chat === 'function') {
      result = await mastra.chat(prompt);
    } else if (typeof mastra.run === 'function') {
      result = await mastra.run(prompt);
    } else {
      // If no direct methods, return info about what's available
      result = {
        message: 'Mastra loaded successfully',
        availableMethods: Object.getOwnPropertyNames(mastra).filter(prop => typeof mastra[prop] === 'function'),
        prototype: Object.getOwnPropertyNames(Object.getPrototypeOf(mastra)).filter(prop => typeof mastra[prop] === 'function')
      };
    }

    console.log('Mastra completed:', result);

    return Response.json({
      success: true,
      response: result,
      framework: 'Mastra',
      gatewayUsed: process.env.OPENAI_BASE_URL || 'default',
      debug: {
        baseURL: process.env.OPENAI_BASE_URL,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('Mastra failed:', error);

    return Response.json({
      error: error.message,
      framework: 'Mastra',
      stack: error.stack,
      debug: {
        baseURL: process.env.OPENAI_BASE_URL,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        nodeVersion: process.version
      }
    }, { status: 500 });
  }
}
// Groq API Integration for AI Content Generation
// Uses Claude via Groq for fast inference

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768';
  temperature?: number;
  max_tokens?: number;
}

export async function generateWithGroq(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
  }

  const { 
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    max_tokens = 1024
  } = options;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    throw new Error('Failed to generate content with AI');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Content generation prompts
export const CONTENT_PROMPTS = {
  linkedin_post: (context: string) => ({
    role: 'system' as const,
    content: `You are a LinkedIn marketing expert. Create engaging, professional LinkedIn posts that drive engagement. 
Guidelines:
- Start with a compelling hook
- Use short paragraphs
- Include a clear call-to-action
- Add relevant hashtags at the end
- Keep it authentic and personal`
  }),
  
  twitter_post: (context: string) => ({
    role: 'system' as const,
    content: `You are a Twitter/X marketing expert. Create concise, impactful tweets that capture attention.
Guidelines:
- Maximum 280 characters
- Start with a hook
- Include relevant hashtags
- Make it shareable`
  }),

  carousel: (context: string) => ({
    role: 'system' as const,
    content: `You are a content marketing expert. Create carousel post structures.
Guidelines:
- 5-10 slides
- Each slide has a title and 1-2 bullet points
- Educational and actionable content
- Strong opening and closing slides`
  })
};

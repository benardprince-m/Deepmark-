import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/jwt';
import { generateWithGroq, CONTENT_PROMPTS } from '@/lib/groq';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const promptSchema = z.object({
  type: z.enum(['linkedin_post', 'twitter_post', 'carousel', 'image_prompt']),
  topic: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'bold', 'educational']).optional(),
  audience: z.string().optional(),
  additional_context: z.string().optional()
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  
  try {
    const body = await request.json();
    const validation = promptSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 'validation_error');
    }

    const { type, topic, tone, audience, additional_context } = validation.data;

    // Build the prompt based on content type
    let systemPrompt = '';
    let userPrompt = topic;

    switch (type) {
      case 'linkedin_post':
        systemPrompt = CONTENT_PROMPTS.linkedin_post(topic);
        break;
      case 'twitter_post':
        systemPrompt = CONTENT_PROMPTS.twitter_post(topic);
        break;
      case 'carousel':
        systemPrompt = CONTENT_PROMPTS.carousel(topic);
        break;
      case 'image_prompt':
        systemPrompt = 'You are an expert at creating image prompts for AI image generators like Midjourney, DALL-E, or Stable Diffusion. Create detailed, descriptive prompts.';
        userPrompt = `Create an image prompt for: ${topic}`;
        break;
    }

    // Add audience context
    if (audience) {
      userPrompt += `\n\nTarget audience: ${audience}`;
    }

    // Add additional context
    if (additional_context) {
      userPrompt += `\n\nAdditional context: ${additional_context}`;
    }

    // Generate content using Groq
    const content = await generateWithGroq([
      { role: 'system', content: systemPrompt.content },
      { role: 'user', content: userPrompt }
    ], {
      temperature: tone === 'bold' ? 0.9 : 0.7,
      max_tokens: 1024
    });

    return successResponse({
      content,
      type,
      topic,
      tone: tone || 'professional',
      audience: audience || 'general',
      tokens_used: content.split(' ').length * 1.3 // Estimate
    }, 'Content generated successfully');

  } catch (error) {
    console.error('Studio prompt error:', error);
    
    // Check if it's a missing API key error
    if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
      return errorResponse(
        'AI generation is not configured. Please set GROQ_API_KEY.',
        'ai_not_configured',
        503
      );
    }
    
    return serverErrorResponse();
  }
}

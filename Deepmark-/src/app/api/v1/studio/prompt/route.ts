import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const promptSchema = z.object({
  type: z.enum(['post', 'carousel', 'image', 'video']),
  context: z.record(z.string()).optional(),
  user_input: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  try {
    const body = await request.json();
    const validation = promptSchema.safeParse(body);
    if (!validation.success) return errorResponse(validation.error.errors[0].message, 'validation_error');
    const { type, context, user_input } = validation.data;
    // In production, this would call Groq/Claude API
    const promptTemplates = {
      post: `Create an engaging social media post about: ${user_input}`,
      carousel: `Create a carousel post structure about: ${user_input}`,
      image: `Create an image prompt for: ${user_input}`,
      video: `Create a video script concept for: ${user_input}`
    };
    return successResponse({
      prompt: promptTemplates[type],
      suggestion_type: type,
      enhanced_context: context
    }, 'Prompt generated successfully');
  } catch (error) {
    console.error('Studio prompt error:', error);
    return serverErrorResponse();
  }
}
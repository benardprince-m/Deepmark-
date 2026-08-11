import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { requestCapability, AICapability } from '@/lib/ai/registry';

// Map studio types to AI capabilities
const typeToCapability: Record<string, AICapability> = {
  post: 'generateLinkedInPost',
  carousel: 'generateCarousel',
  image: 'generateLinkedInPost',
  video: 'generateVideoScript',
};

const promptSchema = z.object({
  type: z.enum(['post', 'carousel', 'image', 'video']),
  context: z.record(z.string()).optional(),
  user_input: z.string().min(1),
  // Optional context fields for better prompts
  startup_name: z.string().optional(),
  audience: z.string().optional(),
  goals: z.string().optional(),
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
    
    const { type, context, user_input, startup_name, audience, goals } = validation.data;
    const capability = typeToCapability[type] || 'generateLinkedInPost';
    
    // Request capability from AI system
    try {
      const result = await requestCapability({
        capability,
        context: {
          startup: {
            name: startup_name || context?.startup_name || 'My Startup',
            description: context?.startup_description,
            website: context?.startup_website,
          },
          audience: {
            description: audience || context?.audience || 'Target audience',
            painPoints: context?.audience_pain_points?.split(','),
          },
          goals: {
            primary: goals || context?.goals || 'Build awareness',
          },
          memory: [],
          skills: [],
          userInput: user_input,
        },
      });
      
      return successResponse({
        content: result.output,
        prompt_used: result.promptUsed,
        provider: result.provider,
        model: result.model,
        suggestion_type: type,
      }, 'Content generated successfully');
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      return errorResponse(
        'AI generation failed. Please check your OpenRouter API configuration.',
        'ai_error',
        aiError instanceof Error ? aiError.message : 'Unknown error'
      );
    }
  } catch (error) {
    console.error('Studio prompt error:', error);
    return serverErrorResponse();
  }
}
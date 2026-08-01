import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/jwt';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

const enhanceSchema = z.object({
  content: z.string().min(1),
  platform: z.enum(['twitter', 'linkedin'])
});

export async function POST(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);
  if (!userPayload) return unauthorizedResponse();
  try {
    const body = await request.json();
    const validation = enhanceSchema.safeParse(body);
    if (!validation.success) return errorResponse(validation.error.errors[0].message, 'validation_error');
    const { content, platform } = validation.data;
    // In production, this would use Groq/Claude for enhancement
    const maxLength = platform === 'twitter' ? 280 : 3000;
    const enhanced = content.length > maxLength ? content.substring(0, maxLength - 3) + '...' : content;
    return successResponse({
      enhanced_content: enhanced,
      platform,
      character_count: enhanced.length,
      within_limit: enhanced.length <= maxLength
    }, 'Content enhanced successfully');
  } catch (error) {
    console.error('Studio enhance error:', error);
    return serverErrorResponse();
  }
}
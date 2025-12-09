import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set. AI features will be disabled.');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
});

export const AI_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Memory Engine Client - Retrieval and Storage

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MemoryCard, MemoryQuery, MemoryExtraction, MemoryContext } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://emhsbpbewhatkwlznanr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Database row type
interface MemoryRow {
  id: string;
  workspace_id: string;
  category: string;
  title: string;
  content: string;
  confidence: number;
  source: string;
  last_used: string;
  created_at: string;
  updated_at: string;
}

// Client-side memory client (uses anon key)
let memoryClient: SupabaseClient | null = null;

export function getMemoryClient(): SupabaseClient | null {
  if (!memoryClient && SUPABASE_ANON_KEY) {
    memoryClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return memoryClient;
}

// Score memory card relevance
function scoreCard(card: MemoryRow, query: MemoryQuery, context: string): number {
  let score = 0;
  
  // Base confidence (0-50 points)
  score += (card.confidence / 100) * 50;
  
  // Category match (0-20 points)
  if (!query.categories || query.categories.includes(card.category as MemoryCard['category'])) {
    score += 20;
  }
  
  // Recency (0-20 points) - use last_used
  const daysSinceUse = Math.floor((Date.now() - new Date(card.last_used).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUse < 1) score += 20;
  else if (daysSinceUse < 7) score += 15;
  else if (daysSinceUse < 30) score += 10;
  else score += 5;
  
  // Context relevance (0-10 points)
  const contextLower = context.toLowerCase();
  const titleLower = card.title.toLowerCase();
  const contentLower = card.content.toLowerCase();
  
  if (titleLower.includes(contextLower) || contextLower.includes(titleLower)) {
    score += 10;
  } else if (contentLower.includes(contextLower) || contextLower.includes(contentLower)) {
    score += 5;
  }
  
  return score;
}

// Retrieve relevant memory cards
export async function retrieveMemory(query: MemoryQuery, context: string = ''): Promise<MemoryCard[]> {
  const client = getMemoryClient();
  
  if (!client) {
    console.warn('Memory client not initialized');
    return [];
  }
  
  try {
    let dbQuery = client
      .from('memory')
      .select('*')
      .eq('workspace_id', query.workspaceId)
      .is('deleted_at', null);
    
    // Filter by categories
    if (query.categories && query.categories.length > 0) {
      dbQuery = dbQuery.in('category', query.categories);
    }
    
    // Filter by minimum confidence
    if (query.minConfidence !== undefined) {
      dbQuery = dbQuery.gte('confidence', query.minConfidence);
    }
    
    // Exclude specific IDs
    if (query.excludeIds && query.excludeIds.length > 0) {
      dbQuery = dbQuery.not('id', 'in', `(${query.excludeIds.join(',')})`);
    }
    
    const { data, error } = await dbQuery.order('last_used', { ascending: false }).limit(query.limit || 10);
    
    if (error) {
      console.error('Memory retrieval error:', error);
      return [];
    }
    
    // Score and filter results
    const scored = (data as MemoryRow[] || [])
      .map(card => ({
        ...card,
        score: scoreCard(card, query, context)
      }))
      .filter(card => card.score > 30) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score);
    
    return scored.map(({ score: _unused, ...card }) => ({
      id: card.id,
      workspaceId: card.workspace_id,
      category: card.category as MemoryCard['category'],
      title: card.title,
      content: card.content,
      confidence: card.confidence,
      source: card.source as MemoryCard['source'],
      lastUsed: new Date(card.last_used),
      createdAt: new Date(card.created_at),
      updatedAt: new Date(card.updated_at)
    }));
    
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    return [];
  }
}

// Store a new memory card
export async function storeMemory(
  workspaceId: string,
  extraction: MemoryExtraction
): Promise<MemoryCard | null> {
  const client = getMemoryClient();
  
  if (!client) {
    console.warn('Memory client not initialized');
    return null;
  }
  
  try {
    const { data, error } = await client
      .from('memory')
      .insert({
        workspace_id: workspaceId,
        category: extraction.category,
        title: extraction.title,
        content: extraction.content,
        confidence: extraction.confidence,
        source: extraction.source,
        last_used: new Date().toISOString()
      } as Record<string, unknown>)
      .select()
      .single();
    
    if (error) {
      console.error('Memory store error:', error);
      return null;
    }
    
    const row = data as MemoryRow;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      category: row.category as MemoryCard['category'],
      title: row.title,
      content: row.content,
      confidence: row.confidence,
      source: row.source as MemoryCard['source'],
      lastUsed: new Date(row.last_used),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
    
  } catch (error) {
    console.error('Memory store failed:', error);
    return null;
  }
}

// Update memory card usage
export async function updateMemoryUsage(cardId: string): Promise<boolean> {
  const client = getMemoryClient();
  
  if (!client) {
    return false;
  }
  
  try {
    const { error } = await client
      .from('memory')
      .update({ last_used: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', cardId);
    
    if (error) {
      console.error('Memory usage update error:', error);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Memory usage update failed:', error);
    return false;
  }
}

// Get memory context for prompt building
export async function getMemoryContext(
  workspaceId: string,
  query: string,
  options?: {
    categories?: string[];
    limit?: number;
  }
): Promise<MemoryContext> {
  const cards = await retrieveMemory({
    workspaceId,
    categories: options?.categories as MemoryCard['category'][] | undefined,
    limit: options?.limit || 5
  }, query);
  
  if (cards.length === 0) {
    return { relevantCards: [], confidence: 0, freshness: 0 };
  }
  
  // Calculate average confidence
  const avgConfidence = cards.reduce((sum, c) => sum + c.confidence, 0) / cards.length;
  
  // Calculate freshness (most recent update)
  const mostRecent = Math.max(...cards.map(c => c.lastUsed.getTime()));
  const daysSinceUpdate = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);
  const freshness = Math.max(0, 100 - daysSinceUpdate * 2); // Decrease freshness over time
  
  // Update usage for all retrieved cards
  cards.forEach(card => updateMemoryUsage(card.id));
  
  return {
    relevantCards: cards,
    confidence: avgConfidence,
    freshness
  };
}

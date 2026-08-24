// Memory module — foundational nodes (scaffold)
// Per DeepMark dossier: nodes start empty, relationships form as DeepMark learns
export interface MemoryNode {
  id: string;
  type: 'Identity' | 'Audience' | 'Business' | 'Marketing' | 'Constraints';
  workspaceId: string; // tenant isolation — Startup A/B must never mix
  content?: string; // empty initially; populated through usage
  connections: string[]; // relationships to other nodes
}

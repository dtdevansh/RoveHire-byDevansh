import { db } from '../db/client.js';
import type { TimelineEventType } from '../types/models.js';

export async function appendEvent(
  candidateId: string,
  type: TimelineEventType,
  message: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await db
    .from('timeline_events')
    .insert({
      candidate_id: candidateId,
      type,
      message,
      metadata,
    });

  if (error) {
    throw new Error(`Failed to append timeline event: ${error.message}`);
  }
}

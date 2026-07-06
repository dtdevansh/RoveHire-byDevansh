import { db } from '../db/client.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';
import { canTransition } from './stateMachine.js';
import { appendEvent } from './timeline.service.js';
import { touchActivity } from './candidates.service.js';
import type { Interview, CandidateStatus } from '../types/models.js';

/**
 * Schedule an interview for a candidate.
 * Transitions candidate status to 'Interview Scheduled'.
 */
export async function scheduleInterview(
  candidateId: string,
  data: {
    scheduled_at: string;
    type: string;
    interviewer_name: string;
    notes?: string | null;
  },
): Promise<Interview> {
  // Fetch candidate to check status
  const { data: candidate, error: fetchError } = await db
    .from('candidates')
    .select('status')
    .eq('id', candidateId)
    .single();

  if (fetchError || !candidate) throw new NotFoundError(`Candidate not found: ${candidateId}`);

  const currentStatus = candidate.status as CandidateStatus;

  // Only transition if not already in Interview Scheduled or later
  if (currentStatus === 'Form Submitted') {
    const result = canTransition(currentStatus, 'Interview Scheduled', {
      hasCompletedInterview: false,
      hasOffer: false,
    });

    if (!result.ok) throw new ConflictError(result.reason);

    await db
      .from('candidates')
      .update({
        status: 'Interview Scheduled',
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', candidateId);
  } else if (currentStatus === 'Interview Scheduled') {
    // Additional interviews — just touch activity
    await touchActivity(candidateId);
  } else {
    throw new ConflictError(`Cannot schedule interview when candidate is in "${currentStatus}" status`);
  }

  // Create interview record
  const { data: interview, error: insertError } = await db
    .from('interviews')
    .insert({
      candidate_id: candidateId,
      scheduled_at: data.scheduled_at,
      type: data.type,
      interviewer_name: data.interviewer_name,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (insertError || !interview) {
    throw new Error(`Failed to create interview: ${insertError?.message}`);
  }

  // Timeline event
  await appendEvent(
    candidateId,
    'interview_scheduled',
    `${data.type} interview scheduled with ${data.interviewer_name}`,
    { scheduled_at: data.scheduled_at, type: data.type },
  );

  return interview as unknown as Interview;
}

/**
 * List all interviews with candidate info, sorted by scheduled_at.
 */
export async function listInterviews(): Promise<Array<Interview & { candidate_name: string; candidate_role: string }>> {
  const { data: interviews, error } = await db
    .from('interviews')
    .select('*, candidates(name, current_role)')
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(`Failed to list interviews: ${error.message}`);

  return (interviews ?? []).map((i) => {
    const candidateData = i.candidates as { name: string; current_role: string | null } | null;
    return {
      ...(i as unknown as Interview),
      candidate_name: candidateData?.name ?? '',
      candidate_role: candidateData?.current_role ?? '',
    };
  });
}

/**
 * Complete an interview with feedback.
 * Does NOT change candidate status — only unlocks generate_offer via allowed_actions.
 */
export async function completeInterview(
  interviewId: string,
  data: {
    outcome: string;
    recommendation: string;
    feedback_note?: string | null;
  },
): Promise<Interview> {
  // Fetch interview
  const { data: interview, error: fetchError } = await db
    .from('interviews')
    .select()
    .eq('id', interviewId)
    .single();

  if (fetchError || !interview) throw new NotFoundError(`Interview not found: ${interviewId}`);

  if (interview.outcome === 'Completed') {
    throw new ConflictError('Interview has already been completed');
  }

  // Update interview
  const { data: updated, error: updateError } = await db
    .from('interviews')
    .update({
      outcome: data.outcome,
      recommendation: data.recommendation,
      feedback_note: data.feedback_note ?? null,
    })
    .eq('id', interviewId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to complete interview: ${updateError?.message}`);
  }

  // Touch candidate activity
  await touchActivity(interview.candidate_id as string);

  // Timeline event
  await appendEvent(
    interview.candidate_id as string,
    'feedback_recorded',
    `Interview feedback recorded: ${data.recommendation}`,
    { interview_id: interviewId, recommendation: data.recommendation },
  );

  return updated as unknown as Interview;
}

import { format, formatDistanceToNow, isValid } from 'date-fns';

/** Parse to a valid Date or return null (guards against null/empty/bad values). */
function parse(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isValid(d) ? d : null;
}

/** "2 days ago" — used in tables and timelines. */
export function relativeTime(dateString: string | null | undefined): string {
  const d = parse(dateString);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}

/** "18 May 2024" */
export function formatDate(dateString: string | null | undefined): string {
  const d = parse(dateString);
  return d ? format(d, 'd MMM yyyy') : '—';
}

/** "18 May 2024, 02:22 PM" */
export function formatDateTime(dateString: string | null | undefined): string {
  const d = parse(dateString);
  return d ? format(d, 'd MMM yyyy, hh:mm a') : '—';
}

/** "10:00 AM" */
export function formatTime(dateString: string | null | undefined): string {
  const d = parse(dateString);
  return d ? format(d, 'hh:mm a') : '—';
}

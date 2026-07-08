'use client';

import Link from 'next/link';
import { Users, CalendarDays, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { SkillChip } from '@/components/ui/Chip';
import JobStatusBadge from './JobStatusBadge';
import { formatDate } from '@/lib/utils/date';
import type { JobListItemDTO } from '@/types/dto';

export default function JobCard({ job }: { job: JobListItemDTO }) {
  const shown = job.required_skills.slice(0, 4);
  const overflow = job.required_skills.length - shown.length;

  return (
    <Link href={`/jobs/${job.id}`} className="group block">
      <Card className="flex h-full flex-col p-5 transition-colors hover:border-border-strong">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-medium text-text-primary">
            {job.title}
          </h2>
          <JobStatusBadge status={job.status} />
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
          <Users className="h-4 w-4 text-text-muted" />
          {job.candidate_count} candidate{job.candidate_count === 1 ? '' : 's'}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shown.map((skill) => (
            <SkillChip key={skill}>{skill}</SkillChip>
          ))}
          {overflow > 0 && <SkillChip>+{overflow}</SkillChip>}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5">
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Created on {formatDate(job.created_at)}
          </span>
          <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}

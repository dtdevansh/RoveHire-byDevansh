'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { inputBase } from './Input';
import { cn } from '@/lib/utils/cn';

export default function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  invalid,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            remove(value[value.length - 1]);
          }
        }}
        placeholder={placeholder}
        className={cn(
          inputBase,
          invalid
            ? 'border border-[rgba(239,68,68,0.5)]'
            : 'border border-border focus:border-brand focus:shadow-[0_0_0_2px_rgba(224,80,32,0.25)]',
        )}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface2 py-1 pl-2.5 pr-1.5 text-xs text-text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="rounded text-text-muted hover:text-text-primary"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {draft.trim() && (
            <button
              type="button"
              onClick={add}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another
            </button>
          )}
        </div>
      )}
    </div>
  );
}

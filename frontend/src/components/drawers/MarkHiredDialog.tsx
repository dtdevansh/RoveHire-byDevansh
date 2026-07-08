'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/store/hooks';
import { hireCandidate } from '@/store/slices/candidatesSlice';

export default function MarkHiredDialog({
  open,
  onClose,
  candidateId,
  candidateName,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  onDone?: () => void;
}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      await dispatch(hireCandidate(candidateId)).unwrap();
      toast.success(`${candidateName} marked as hired`);
      onDone?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't mark as hired");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#EAB308] text-[#F3CC5C]">
        <AlertCircle className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-text-primary">
        Mark {candidateName} as hired?
      </h2>
      <p className="mt-2 text-sm text-text-secondary">This action cannot be undone.</p>
      <p className="text-sm text-text-secondary">
        The candidate status will be updated to Hired.
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-[#10B981] text-white hover:bg-[#0EA372] active:bg-[#0B7A57]"
          loading={loading}
          onClick={confirm}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

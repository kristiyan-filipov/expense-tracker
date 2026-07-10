"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
}

export default function SubmitButton({ label, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all ${className ?? ""}`}
    >
      {pending && (
        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
      )}
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}

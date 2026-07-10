"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Delete expense"
    >
      {pending ? (
        <span className="h-5 w-5 block rounded-full border-2 border-rose-400/30 border-t-rose-400 animate-spin" />
      ) : (
        <Trash2 className="h-5 w-5" />
      )}
    </button>
  );
}

export default function DeleteExpenseButton({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}

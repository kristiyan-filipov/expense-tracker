import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { addExpense } from "./actions";
import { Receipt } from "lucide-react";

export default async function AddExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-xl justify-center mx-auto mt-12 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Receipt className="h-8 w-8 text-primary" />
          Add Expense
        </h1>
        <p className="text-slate-400 mt-2">Log a new expense to track your spending.</p>
      </div>

      <div className="glass-card p-8 flex flex-col gap-6 relative">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 rounded-md p-4">
            {error}
          </div>
        )}

        <form className="flex-1 flex flex-col w-full justify-center gap-6 text-slate-200" action={addExpense}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="name">
              Expense Name
            </label>
            <input
              className="glass-input rounded-md px-4 py-3 bg-inherit border text-lg"
              name="name"
              id="name"
              type="text"
              placeholder="e.g. Groceries, Rent, Coffee"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="amount">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                className="glass-input rounded-md pl-8 pr-4 py-3 bg-inherit border w-full text-lg font-mono"
                type="number"
                name="amount"
                id="amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold rounded-md px-4 py-3 hover:bg-indigo-500 transition-all mt-4 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] text-lg"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}

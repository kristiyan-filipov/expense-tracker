import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";
import { DollarSign, Calendar, TrendingUp, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteExpense } from "./actions";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch expenses for the user, ordered by most recent first
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
  }

  const safeExpenses = expenses || [];

  // Calculate totals
  let weekTotal = 0;
  let monthTotal = 0;
  let yearTotal = 0;

  safeExpenses.forEach((exp) => {
    const date = parseISO(exp.created_at);
    const amount = Number(exp.amount);

    if (isThisWeek(date)) weekTotal += amount;
    if (isThisMonth(date)) monthTotal += amount;
    if (isThisYear(date)) yearTotal += amount;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-2">Overview of your spending habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Week
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(weekTotal)}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all"></div>
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-2">
            <Calendar className="h-5 w-5 text-accent" />
            This Month
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(monthTotal)}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            This Year
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(yearTotal)}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold text-white">Recent Expenses</h2>
        </div>
        
        {safeExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No expenses found. Start adding some!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {safeExpenses.map((expense) => (
              <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-200 text-lg">{expense.name}</span>
                  <span className="text-sm text-slate-500">
                    {format(parseISO(expense.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-xl text-white bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    {formatCurrency(Number(expense.amount))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/edit-expense/${expense.id}`}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      aria-label="Edit expense"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={expense.id} />
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

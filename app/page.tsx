import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PieChart, Shield, Zap } from "lucide-react";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <main className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-primary/30 text-primary/80 text-sm font-medium mb-4">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Now with Supabase integration
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
          Track expenses <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            beautifully.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Take control of your finances with a sleek, modern, and lightning-fast expense tracker. Build wealth by knowing exactly where your money goes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-16 text-left">
          <div className="glass-card p-6 flex flex-col gap-3">
            <div className="p-3 bg-primary/10 w-fit rounded-lg text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">Lightning Fast</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Optimized performance built on Next.js 16 and Supabase. Experience instant loading and interactions.</p>
          </div>
          <div className="glass-card p-6 flex flex-col gap-3">
            <div className="p-3 bg-accent/10 w-fit rounded-lg text-accent">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">Secure by Default</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Enterprise-grade security with Row Level Security (RLS) keeping your financial data completely private.</p>
          </div>
          <div className="glass-card p-6 flex flex-col gap-3">
            <div className="p-3 bg-emerald-500/10 w-fit rounded-lg text-emerald-400">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">Actionable Insights</h3>
            <p className="text-slate-400 text-sm leading-relaxed">View your spending across days, weeks, and months to identify patterns and save more money.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

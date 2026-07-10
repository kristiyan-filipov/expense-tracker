import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Wallet, LogOut, PlusCircle, LayoutDashboard } from "lucide-react";

export default async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="glass sticky top-0 z-50 w-full mb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-primary group">
              <Wallet className="h-8 w-8 text-accent group-hover:text-primary transition-colors" />
              <span className="font-bold text-xl tracking-tight text-white">Expense Tracker</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link 
                  href="/add-expense" 
                  className="flex items-center gap-2 text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 px-3 py-2 rounded-full transition-colors border border-primary/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Expense</span>
                </Link>
                <form action="/auth/signout" method="post">
                  <button 
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-red-400 transition-colors ml-4"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-sm font-medium bg-primary text-white hover:bg-indigo-500 px-4 py-2 rounded-full transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

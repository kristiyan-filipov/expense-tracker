import { signup } from "./actions";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20 animate-slide-up">
      <div className="glass-card p-8 flex flex-col gap-6 relative">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="text-sm text-slate-400 mt-2 text-center">Sign up to start tracking your expenses</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 rounded-md p-4 text-center">
            {error}
          </div>
        )}

        <form className="flex-1 flex flex-col w-full justify-center gap-4 text-slate-200" action={signup}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="glass-input rounded-md px-4 py-2 bg-inherit border"
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              className="glass-input rounded-md px-4 py-2 bg-inherit border"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-primary-foreground font-medium rounded-md px-4 py-2 hover:bg-indigo-500 transition-colors mt-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-indigo-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

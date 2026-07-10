import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20 animate-slide-up">
      <div className="glass-card p-8 flex flex-col gap-6 relative">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-2 text-center">Enter your details to sign in or create a new account</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 rounded-md p-4 text-center">
            {error}
          </div>
        )}

        <form className="flex-1 flex flex-col w-full justify-center gap-4 text-slate-200">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="glass-input rounded-md px-4 py-2 bg-inherit border"
              name="email"
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
              placeholder="••••••••"
              required
            />
          </div>

          <button
            formAction={login}
            className="bg-primary text-primary-foreground font-medium rounded-md px-4 py-2 hover:bg-indigo-500 transition-colors mt-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Sign In
          </button>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1a2133] px-2 text-slate-400">Or</span>
            </div>
          </div>
          
          <button
            formAction={signup}
            className="border border-slate-600 bg-transparent text-slate-300 font-medium rounded-md px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Create an Account
          </button>
        </form>
      </div>
    </div>
  );
}

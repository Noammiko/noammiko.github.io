"use client";

import { withConvexProvider } from "@/lib/convex";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ─── Sign-in form ─────────────────────────────────────────────── */
function SignIn() {
  const { signIn } = useAuthActions();
  const hasAdmin = useQuery(api.adminSeed.hasAdmin);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  // If no admin exists yet, allow first-time sign-up; otherwise sign-in only.
  const flow = hasAdmin === false ? "signUp" : "signIn";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("password", formData);
    } catch {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-4 py-3
     text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
     placeholder:text-[rgba(245,240,232,0.2)] transition-colors`;
  const labelCls =
    `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel']
     text-[rgba(201,169,110,0.7)] mb-2`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808]">
      {/* Subtle gold grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-8">
          {/* Studio name */}
          <p className="text-[0.55rem] tracking-[0.45em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.6)] text-center mb-1">
            Miko Recording Studio
          </p>
          <h1 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8] text-center mb-8">
            {hasAdmin === false ? "Create Admin Account" : "Admin Access"}
          </h1>

          {error && (
            <div className="mb-5 px-4 py-3 border border-red-800/40 bg-red-900/10 text-red-400 text-xs font-['Josefin_Sans']">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="flow" value={flow} />

            <div>
              <label className={labelCls}>Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className={inputCls}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-50
                         text-[#F5F0E8] text-[0.65rem] tracking-[0.35em] uppercase font-['Josefin_Sans']
                         transition-colors duration-200"
            >
              {isLoading
                ? "Please wait…"
                : hasAdmin === false
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] text-[rgba(245,240,232,0.15)] mt-6">
          Restricted Access — Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}

/* ─── Default export — wraps children in Convex Auth ───────────── */
export default withConvexProvider(
  ({
    children,
  }: Readonly<{ children: React.ReactNode }>) => (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
    </>
  ),
  "auth",
);

/* ─── Sign-out button — importable by the dashboard ────────────── */
export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      onClick={() => signOut()}
      className="text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans']
                 text-[rgba(245,240,232,0.35)] hover:text-red-400 transition-colors"
    >
      Sign Out
    </button>
  );
}

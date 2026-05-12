"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("wrong-password") || code.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (code.includes("user-not-found")) {
        setError("No account found for this email.");
      } else if (code.includes("too-many-requests")) {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,197,66,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,197,66,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <Smartphone size={26} className="text-surface-900" />
          </div>
          <h1 className="text-white text-2xl font-semibold">PhoneVault</h1>
          <p className="text-surface-400 text-sm mt-1">B2B Wholesale Platform</p>
        </div>

        {/* Card */}
        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8 shadow-card">
          <h2 className="text-white font-semibold text-lg mb-1">Sign In</h2>
          <p className="text-surface-400 text-sm mb-6">
            Authorized accounts only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-surface-300 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-700 border border-surface-500 text-white placeholder-surface-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-surface-300 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-700 border border-surface-500 text-white placeholder-surface-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              size="lg"
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-surface-500 text-xs mt-6">
          Access restricted to approved wholesale partners
        </p>
      </div>
    </div>
  );
}

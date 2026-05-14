"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, User, Building2, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, register, user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("not-approved")) {
        setError("アカウントはまだ承認されていません。管理者の承認をお待ちください。");
      } else if (code.includes("wrong-password") || code.includes("invalid-credential")) {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else if (code.includes("user-not-found")) {
        setError("このメールアドレスのアカウントが見つかりません。");
      } else if (code.includes("too-many-requests")) {
        setError("試行回数が多すぎます。しばらく待ってから再試行してください。");
      } else {
        setError("ログインに失敗しました。再試行してください。");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password, displayName, companyName, phone);
      setSignupDone(true);
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("email-already-in-use")) {
        setError("This email is already registered.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-navy-500 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="8" width="10" height="13" rx="1.5" fill="white"/>
              <rect x="9" y="10" width="6" height="7" rx="0.5" fill="#1E3A8A"/>
              <circle cx="12" cy="19" r="0.8" fill="#1E3A8A"/>
              <path d="M5 8L7 5L9 7L12 3L15 7L17 5L19 8H5Z" fill="#FFD700"/>
              <circle cx="7" cy="5" r="1" fill="#FFD700"/>
              <circle cx="12" cy="3" r="1" fill="#FFD700"/>
              <circle cx="17" cy="5" r="1" fill="#FFD700"/>
            </svg>
          </div>
          <h1 className="text-navy-500 text-2xl font-semibold">Best of Best</h1>
          <p className="text-slate-400 text-sm mt-1">B2B Wholesale Platform</p>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => { setTab("login"); setError(""); setSignupDone(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "login" ? "bg-white text-navy-500 shadow-sm" : "text-slate-400"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "signup" ? "bg-white text-navy-500 shadow-sm" : "text-slate-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
          {tab === "login" ? (
            <>
              <h2 className="text-navy-500 font-semibold text-lg mb-1">Sign In</h2>
              <p className="text-slate-400 text-sm mb-6">Authorized accounts only</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="••••••••" />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-rose-500 text-sm">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full bg-navy-500 hover:bg-navy-600 text-white font-medium rounded-lg py-3 text-sm transition-all disabled:opacity-50 mt-2">
                  {submitting ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          ) : signupDone ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-navy-500 font-semibold text-lg mb-2">Request Sent!</h2>
              <p className="text-slate-400 text-sm">Your account request has been submitted. Please wait for admin approval before signing in.</p>
              <button onClick={() => { setTab("login"); setSignupDone(false); }} className="mt-6 w-full bg-navy-500 text-white font-medium rounded-lg py-3 text-sm">
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-navy-500 font-semibold text-lg mb-1">Sign Up</h2>
              <p className="text-slate-400 text-sm mb-6">Request wholesale access</p>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Company</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="Company name" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="+971 50 000 0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors" placeholder="Min 6 characters" />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-rose-500 text-sm">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full bg-navy-500 hover:bg-navy-600 text-white font-medium rounded-lg py-3 text-sm transition-all disabled:opacity-50">
                  {submitting ? "Submitting..." : "Request Access"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-slate-400 text-xs mt-6">
          Access restricted to approved wholesale partners
        </p>
      </div>
    </div>
  );
}
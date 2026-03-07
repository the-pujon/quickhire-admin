"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Zap,
  Shield,
  Users,
  BarChart3,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/api/authApi";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  logout,
} from "@/redux/slices/authSlice";

const DEMO_CREDENTIALS = {
  email: "pujondas1234@gmail.com",
  password: "QN7$ED#buYEVmpr",
};

function inputCls(hasError: boolean) {
  return [
    "w-full h-11 rounded-lg border bg-white text-slate-800 text-sm",
    "placeholder:text-slate-400 focus:outline-none transition-all",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
  ].join(" ");
}

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // Only redirect to dashboard if authenticated AND has admin/superAdmin role
  useEffect(() => {
    if (
      isAuthenticated &&
      (currentUser?.role === "admin" || currentUser?.role === "superAdmin")
    ) {
      router.replace("/jobs");
    }
  }, [isAuthenticated, currentUser, router]);

  async function handleDemoLogin() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
    try {
      const result = await login({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      }).unwrap();
      const role = result.data?.user?.role;
      if (role !== "admin" && role !== "superAdmin") {
        dispatch(logout());
        toast.error("Access denied. Admin or Super Admin role required.");
        return;
      }
      toast.success("Welcome! You are now signed in with the demo account.");
      router.push("/jobs");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Could not sign in with demo account. Please try again.";
      toast.error(msg);
    }
  }

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await login({ email, password }).unwrap();
      const role = result.data?.user?.role;
      if (role !== "admin" && role !== "superAdmin") {
        // Clear the auth state so the login-page redirect doesn't fire
        dispatch(logout());
        toast.error("Access denied. Admin or Super Admin role required.");
        return;
      }
      toast.success(`Welcome back, ${result.data.user.name}!`);
      router.push("/jobs");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Invalid email or password";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── Left – Form Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-300/50">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-[18px] leading-tight">
                QuickHire
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Admin Console
              </p>
            </div>
          </div>

          <h1 className="text-[26px] font-bold text-slate-900 mb-1">
            Admin Sign In
          </h1>
          <p className="text-[14px] text-slate-500 mb-7">
            Sign in to manage jobs, applications, and users.
          </p>

          {/* Demo credentials banner */}
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-indigo-700 flex items-center gap-1.5">
                <Shield className="size-3.5" />
                Just want to explore? 👇
              </p>
              <p className="text-[11px] text-indigo-500 mt-1">
                Click the button — no setup needed!
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="shrink-0 mt-0.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              {isLoading ? "Signing in…" : "🚀 Demo Login"}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="admin@example.com"
                  className={`${inputCls(!!errors.email)} pl-10 pr-4`}
                />
              </div>
              {errors.email && (
                <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`${inputCls(!!errors.password)} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-200 mt-2"
            >
              {isLoading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign In to Admin
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* ── Right – Brand Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex w-[44%] bg-indigo-600 flex-col items-center justify-center relative overflow-hidden px-14">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-[32px] font-bold text-white leading-tight mb-3">
            QuickHire
            <br />
            Admin Console
          </h2>
          <p className="text-[14px] text-white/70 mb-10 max-w-64 mx-auto leading-relaxed">
            Manage job listings, review applications, and control user access
            from one powerful dashboard.
          </p>

          <div className="grid grid-cols-1 gap-3 max-w-56 mx-auto">
            {[
              { icon: BarChart3, text: "Manage job listings" },
              { icon: Users, text: "User management & roles" },
              { icon: Shield, text: "Role-based access control" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[13px] text-white/85 font-medium">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

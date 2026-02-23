"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as LoginForm));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await login(form.email, form.password);

    if (result.success) {
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/discover");
        router.refresh();
      }, 1500);
    } else {
      setMessage(`❌ ${result.error || "Login failed"}`);
      setLoading(false);
    }
  };

  return (
    // 🔥 IMPORTANT: transparent page so layout background shows evenly
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-[#FFD700]/20 bg-[#120606]/30 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-center text-[#fff3d2]">
          Welcome Back to{" "}
          <span className="bg-gradient-to-r from-[#FFD700] via-[#ffe58a] to-[#fff3d2] bg-clip-text text-transparent">
            Breate
          </span>
        </h2>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 pr-16 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#ffe9b8]/70 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="text-center text-sm text-[#ffe9b8]">{message}</p>}

        <p className="text-center text-sm text-[#ffe9b8]/75">
          Don’t have an account?{" "}
          <a href="/signup" className="font-semibold text-[#FFD700] hover:text-[#ffe58a]">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}



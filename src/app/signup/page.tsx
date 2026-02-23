"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";

type Archetype = {
  id: number;
  name: string;
  description?: string;
};

type Tier = {
  id: number;
  name: string;
  description?: string;
};

type SignupForm = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  archetype_id: string; // keep as string for <select>
  tier_id: string; // keep as string for <select>
};

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<SignupForm>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    archetype_id: "",
    tier_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(
    null
  );
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // 🔹 Fetch archetypes and tiers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, tData] = await Promise.all([
          apiClient.get<Archetype[]>(`/archetypes/`, { requireAuth: false }),
          apiClient.get<Tier[]>(`/tiers/`, { requireAuth: false }),
        ]);

        setArchetypes(Array.isArray(aData) ? aData : []);
        setTiers(Array.isArray(tData) ? tData : []);
      } catch (err) {
        console.error("Error fetching archetypes/tiers:", err);
        setArchetypes([]);
        setTiers([]);
      }
    };

    fetchData();
  }, []);

  // 🔹 Watch for password match
  useEffect(() => {
    if (form.confirmPassword.length > 0) {
      setPasswordMatch(form.password === form.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [form.password, form.confirmPassword]);

  // 🔹 Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "archetype_id") {
      const id = parseInt(value, 10);
      const found = archetypes.find((a) => a.id === id) || null;
      setSelectedArchetype(found);
    }

    if (name === "tier_id") {
      const id = parseInt(value, 10);
      const found = tiers.find((t) => t.id === id) || null;
      setSelectedTier(found);
    }
  };

  // 🔹 Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!passwordMatch) {
      setMessage("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    if (!form.archetype_id || !form.tier_id) {
      setMessage("❌ Please select both Archetype and Tier");
      setLoading(false);
      return;
    }

    try {
      const payload: {
        email: string;
        password: string;
        archetype_id: number;
        tier_id: number;
        username?: string;
      } = {
        email: form.email,
        password: form.password,
        archetype_id: parseInt(form.archetype_id, 10),
        tier_id: parseInt(form.tier_id, 10),
      };

      if (form.username.trim()) {
        payload.username = form.username.trim();
      }

      // ✅ Vercel-safe: specify a response type
      await apiClient.post<{ detail?: string }>(`/users/signup`, payload, {
        requireAuth: false,
      });

      setMessage("✅ Account created! Logging you in...");
      const loginResult = await login(form.email, form.password);

      if (loginResult.success) {
        router.push("/discover");
        router.refresh();
      } else {
        setMessage("✅ Account created! Please log in manually.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Signup failed";
      setMessage(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ No background here — let the layout background stay even
    <div className="min-h-screen flex items-center justify-center px-6 py-14">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-[#FFD700]/20 bg-[#120606]/30 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-center text-[#fff3d2]">
          Join{" "}
          <span className="bg-gradient-to-r from-[#FFD700] via-[#ffe58a] to-[#fff3d2] bg-clip-text text-transparent">
            Breate
          </span>
        </h2>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
        />

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username (optional)"
          onChange={handleChange}
          className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 pr-16 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#ffe9b8]/70 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            className={[
              "w-full rounded-xl bg-[#120606]/40 px-4 py-3 pr-16 text-[#fff3d2] placeholder:text-[#ffe9b8]/50 outline-none transition focus:ring-2 focus:ring-[#FFD700]/20",
              form.confirmPassword
                ? passwordMatch
                  ? "border border-green-400/60 focus:border-green-300"
                  : "border border-red-400/70 focus:border-red-300"
                : "border border-[#FFD700]/20 focus:border-[#FFD700]/40",
            ].join(" ")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#ffe9b8]/70 hover:text-white"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>

          {form.confirmPassword && (
            <p
              className={[
                "text-sm mt-2",
                passwordMatch ? "text-green-200" : "text-red-200",
              ].join(" ")}
            >
              {passwordMatch ? "Passwords match ✅" : "Passwords do not match ❌"}
            </p>
          )}
        </div>

        {/* Archetype */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
            Select Archetype
          </label>
          <select
            name="archetype_id"
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
          >
            <option value="" className="bg-[#120606]">
              -- Choose Archetype --
            </option>
            {archetypes.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#120606]">
                {a.name}
              </option>
            ))}
          </select>

          {selectedArchetype && (
            <p className="text-sm text-[#ffe9b8]/65 mt-2 italic">
              {selectedArchetype.description}
            </p>
          )}
        </div>

        {/* Tier */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
            Select Tier
          </label>
          <select
            name="tier_id"
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
          >
            <option value="" className="bg-[#120606]">
              -- Choose Tier --
            </option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#120606]">
                {t.name}
              </option>
            ))}
          </select>

          {selectedTier && (
            <p className="text-sm text-[#ffe9b8]/65 mt-2 italic">
              {selectedTier.description}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40 disabled:opacity-70"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {message && <p className="text-center text-sm text-[#ffe9b8]">{message}</p>}

        <p className="text-center text-sm text-[#ffe9b8]/75">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-[#FFD700] hover:text-[#ffe58a]"
          >
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

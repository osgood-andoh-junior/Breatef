"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

type ProfileData = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_themes?: string | null;
  portfolio_links?: string | null;
  next_build?: string | null;
  affiliations?: string | null;
};

type FormState = {
  full_name: string;
  username: string;
  bio: string;
  preferred_themes: string;
  portfolio_links: string;
  next_build: string;
  affiliations: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, isLoggedIn, refreshUser } = useAuth();

  // ✅ safely extract username from route param
  const urlUsername = useMemo(() => {
    const raw = (params as any)?.username;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    username: "",
    bio: "",
    preferred_themes: "",
    portfolio_links: "",
    next_build: "",
    affiliations: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoggedIn === false) router.push("/login");
  }, [isLoggedIn, router]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn || !currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setStatus("");

        const profileUsername = urlUsername || currentUser.username;

        // ✅ FIX: typed response so TS doesn't treat it as `unknown`
        const data = await apiClient.get<ProfileData>(`/profile/${profileUsername}`, {
          requireAuth: true,
        });

        setForm({
          full_name: data.full_name ?? "",
          username: data.username ?? profileUsername,
          bio: data.bio ?? "",
          preferred_themes: data.preferred_themes ?? "",
          portfolio_links: data.portfolio_links ?? "",
          next_build: data.next_build ?? "",
          affiliations: data.affiliations ?? "",
        });
      } catch (err: any) {
        setStatus(`❌ Failed to load profile: ${err?.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [urlUsername, isLoggedIn, currentUser?.username]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !currentUser?.username) {
      setStatus("❌ You must be logged in to edit your profile");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const profileUsername = urlUsername || currentUser.username;

      // ✅ keep your backend route style
      await apiClient.put(`/profile/${profileUsername}`, form, { requireAuth: true });

      // Refresh user data in context (important if username changes)
      await refreshUser();

      setStatus("✅ Profile updated!");
      setTimeout(() => {
        router.push(`/profile/${form.username || profileUsername}`);
        router.refresh();
      }, 900);
    } catch (err: any) {
      setStatus(`❌ ${err?.message || "Update failed"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const profileUsername = urlUsername || currentUser?.username || "";
    router.push(`/profile/${profileUsername}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#FFD700]/20 bg-[#120606]/30 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md text-center">
          <p className="text-xl font-semibold text-[#fff3d2] mb-3">
            Please log in to edit your profile.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center text-[#fff3d2]/85">
          Loading profile...
        </div>
      </div>
    );
  }

  const isSuccess = status.includes("✅");
  const isError = status.includes("❌");

  const inputClass =
    "w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20";

  const textareaClass =
    "w-full min-h-[110px] rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20";

  return (
    // ✅ transparent page so your layout bg stays consistent
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] text-center">
            Edit Profile
          </h1>
          <p className="mt-2 text-center text-sm text-[#ffe9b8]/70">
            Update your identity and collaboration signals.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 sm:p-8 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md"
        >
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. setor_t"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Write a short bio about yourself"
              className={textareaClass}
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Preferred Project Themes
            </label>
            <input
              type="text"
              name="preferred_themes"
              value={form.preferred_themes}
              onChange={handleChange}
              placeholder="Separate multiple themes with commas"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Portfolio Links
            </label>
            <input
              type="text"
              name="portfolio_links"
              value={form.portfolio_links}
              onChange={handleChange}
              placeholder="Add URLs separated by commas (GitHub, Drive, Behance...)"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              What I Want to Build Next
            </label>
            <textarea
              name="next_build"
              value={form.next_build}
              onChange={handleChange}
              placeholder="Describe your next big idea or goal"
              className={textareaClass}
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
              Coalitions / Affiliations
            </label>
            <input
              type="text"
              name="affiliations"
              value={form.affiliations}
              onChange={handleChange}
              placeholder="e.g. University of Ghana, Bisa Collective"
              className={inputClass}
            />
          </div>

          {status && (
            <div
              className={[
                "text-center text-sm rounded-xl border px-4 py-3",
                isSuccess
                  ? "border-green-400/30 bg-green-500/10 text-green-200"
                  : "",
                isError ? "border-red-400/30 bg-red-500/10 text-red-200" : "",
                !isSuccess && !isError
                  ? "border-[#FFD700]/20 bg-[#120606]/25 text-[#ffe9b8]/80"
                  : "",
              ].join(" ")}
            >
              {status}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="w-full rounded-xl border border-[#FFD700]/30 bg-[#120606]/30 py-3 font-semibold text-[#fff3d2]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/45 hover:border-[#FFD700]/45"
            >
              Back to Profile
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#ffe9b8]/55">
          Tip: keep your bio short and specific — “what you build” + “what you need”.
        </p>
      </div>
    </div>
  );
}



"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  UserRound,
  Sparkles,
  Eye,
  CheckCircle2,
} from "lucide-react";

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

  const urlUsername = useMemo(() => {
    const raw = (params as { username?: string | string[] })?.username;
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
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const draftKey = useMemo(() => {
    const base = urlUsername || currentUser?.username || "profile";
    return `breate_profile_edit_draft_${base}`;
  }, [urlUsername, currentUser?.username]);

  useEffect(() => {
    if (isLoggedIn === false) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn || !currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setStatus("");
        setAutoSaveStatus("");

        const profileUsername = urlUsername || currentUser.username;

        const data = await apiClient.get<ProfileData>(`/profile/${profileUsername}`, {
          requireAuth: true,
        });

        const serverForm: FormState = {
          full_name: data.full_name ?? "",
          username: data.username ?? profileUsername,
          bio: data.bio ?? "",
          preferred_themes: data.preferred_themes ?? "",
          portfolio_links: data.portfolio_links ?? "",
          next_build: data.next_build ?? "",
          affiliations: data.affiliations ?? "",
        };

        const savedDraft =
          typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;

        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft) as Partial<FormState>;
            setForm({
              full_name: parsed.full_name ?? serverForm.full_name,
              username: parsed.username ?? serverForm.username,
              bio: parsed.bio ?? serverForm.bio,
              preferred_themes:
                parsed.preferred_themes ?? serverForm.preferred_themes,
              portfolio_links: parsed.portfolio_links ?? serverForm.portfolio_links,
              next_build: parsed.next_build ?? serverForm.next_build,
              affiliations: parsed.affiliations ?? serverForm.affiliations,
            });
            setAutoSaveStatus("✅ Draft restored");
          } catch {
            setForm(serverForm);
          }
        } else {
          setForm(serverForm);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setStatus(`❌ Failed to load profile: ${msg}`);
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };

    loadProfile();
  }, [urlUsername, isLoggedIn, currentUser?.username, draftKey]);

  useEffect(() => {
    if (!hasLoadedOnce || loading) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(form));
        setAutoSaveStatus("✅ Draft auto-saved locally");
      } catch {
        // no-op
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [form, draftKey, hasLoadedOnce, loading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStatus("");
    setAutoSaveStatus("");
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

      await apiClient.put(`/profile/${profileUsername}`, form, {
        requireAuth: true,
      });

      await refreshUser();

      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey);
      }

      setAutoSaveStatus("");
      setStatus("✅ Profile updated!");
      setTimeout(() => {
        router.push(`/profile/${form.username || profileUsername}`);
        router.refresh();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setStatus(`❌ ${msg}`);
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
        <div className="text-center text-[#fff3d2]/85">Loading profile...</div>
      </div>
    );
  }

  const isError = status.includes("❌");

  const inputClass =
    "w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20";

  const textareaClass =
    "w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20";

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <div className="flex items-center justify-center gap-3">
            <UserRound className="h-7 w-7 text-[#FFD700]" />
            <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] text-center">
              Edit Profile
            </h1>
          </div>
          <p className="mt-2 text-center text-sm text-[#ffe9b8]/70">
            Update your identity and collaboration signals.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 sm:p-8 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            {autoSaveStatus && (
              <div className="text-center text-sm rounded-xl px-4 py-3 font-medium text-green-400">
                {autoSaveStatus}
              </div>
            )}

            {status && (
              <div
                className={`text-center text-sm rounded-xl px-4 py-3 font-medium ${
                  isError ? "text-red-400" : "text-green-400"
                }`}
              >
                {status}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFD700]/30 bg-[#120606]/30 py-3 font-semibold text-[#fff3d2]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/45 hover:border-[#FFD700]/45"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40 disabled:opacity-70"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#FFD700]" />
                <h2 className="text-lg font-bold text-[#fff3d2]">
                  Profile Preview
                </h2>
              </div>

              <div className="rounded-2xl border border-[#FFD700]/12 bg-[#120606]/28 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#FFD700] text-[#2b0b0b] font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
                    {(form.username || form.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-[#fff3d2] truncate">
                      {form.full_name || "Your Name"}
                    </h3>
                    <p className="text-sm text-[#ffe9b8]/75 truncate">
                      @{form.username || "username"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <PreviewField
                    label="Bio"
                    value={form.bio || "Your short bio will appear here."}
                  />
                  <PreviewField
                    label="Preferred Themes"
                    value={
                      form.preferred_themes || "Themes you like to build around."
                    }
                  />
                  <PreviewField
                    label="Next Build"
                    value={form.next_build || "What you want to build next."}
                  />
                  <PreviewField
                    label="Affiliations"
                    value={
                      form.affiliations || "Your groups, communities, or institutions."
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#FFD700]/12 bg-[#120606]/16 px-4 py-3 text-center text-xs text-[#ffe9b8]/55 backdrop-blur-sm">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#FFD700]/80" />
                Tip: keep your bio short and specific — what you build + what you need.
              </span>
            </div>

            <div className="rounded-2xl border border-[#FFD700]/12 bg-[#120606]/16 px-4 py-3 text-center text-xs text-[#ffe9b8]/55 backdrop-blur-sm">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]/80" />
                Drafts auto-save locally while you type.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#ffe9b8]/55">
        {label}
      </p>
      <p className="text-[#fff3d2]/88 leading-relaxed">{value}</p>
    </div>
  );
}
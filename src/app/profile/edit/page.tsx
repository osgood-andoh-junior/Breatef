"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

/** Cosmetic only — never a real server hash (passwords are not exposed to the client). */
const PASSWORD_HASH_PLACEHOLDER =
  "$2b$12$••••••••••••••••••••••••••••••••••••••";

type ProfileData = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_themes?: string | null;
  portfolio_links?: string | null;
  next_build?: string | null;
  affiliations?: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  // Note: /profile/edit does not include a [username] param, but we support it
  // in case you later route edit to a specific user.
  const params = useParams();

  const { currentUser, isLoggedIn, loading: authLoading, refreshUser } = useAuth();

  const urlUsername = useMemo(() => {
    const raw = (params as { username?: string | string[] })?.username;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  const originalUsername = urlUsername || currentUser?.username || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    preferred_themes: "",
    portfolio_links: "",
    next_build: "",
    affiliations: "",
  });

  useEffect(() => {
    if (currentUser?.email) setAccountEmail(currentUser.email);
  }, [currentUser?.email]);

  /** Scroll to #account-* when opened from sidebar “Edit” links */
  useEffect(() => {
    if (authLoading || loading) return;
    const id = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [authLoading, loading]);

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn !== true) {
      router.push("/login");
      return;
    }

    if (!originalUsername) {
      setStatus("Missing username.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setStatus("");

      // Pre-fill with whatever we already have from sign-up / AuthContext
      setForm({
        full_name: currentUser?.full_name ?? "",
        username: currentUser?.username ?? originalUsername,
        bio: currentUser?.bio ?? "",
        preferred_themes: currentUser?.preferred_themes ?? "",
        portfolio_links: currentUser?.portfolio_links ?? "",
        next_build: currentUser?.next_build ?? "",
        affiliations: currentUser?.affiliations ?? "",
      });

      try {
        // Then attempt to load the authoritative profile from backend
        const data = await apiClient.get<ProfileData>(`/profile/${originalUsername}`, {
          requireAuth: true,
        });

        if (cancelled) return;
        setForm({
          full_name: data.full_name ?? "",
          username: data.username ?? originalUsername,
          bio: data.bio ?? "",
          preferred_themes: data.preferred_themes ?? "",
          portfolio_links: data.portfolio_links ?? "",
          next_build: data.next_build ?? "",
          affiliations: data.affiliations ?? "",
        });
      } catch (err: unknown) {
        if (cancelled) return;
        // Keep the AuthContext pre-fill; editing can still proceed.
        const msg = err instanceof Error ? err.message : "Unknown error";
        setStatus(`Could not load full profile, using saved auth data. (${msg})`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, router, originalUsername, currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStatus("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEmail = async () => {
    setAccountMsg("");
    setSavingEmail(true);
    try {
      await apiClient.put(`/users/me`, { email: accountEmail }, { requireAuth: true });
      await refreshUser();
      setAccountMsg("✅ Email updated.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update email";
      setAccountMsg(`❌ ${msg}`);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg("");
    if (pwdNew !== pwdConfirm) {
      setAccountMsg("❌ New password and confirmation do not match.");
      return;
    }
    if (pwdNew.length < 8) {
      setAccountMsg("❌ New password should be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      // Try common API shapes; backend may implement one of these.
      try {
        await apiClient.post(
          `/users/change-password`,
          { current_password: pwdCurrent, new_password: pwdNew },
          { requireAuth: true }
        );
      } catch {
        await apiClient.post(
          `/users/change_password`,
          { current_password: pwdCurrent, new_password: pwdNew },
          { requireAuth: true }
        );
      }
      setAccountMsg("✅ Password updated.");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not change password";
      setAccountMsg(
        `❌ ${msg} If this persists, your API may need a change-password endpoint.`
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUsername) return;

    setSaving(true);
    setStatus("");

    try {
      const payload: ProfileData = {
        ...form,
      };

      // Save using the original username path, then redirect to the updated username.
      await apiClient.put(`/profile/${originalUsername}`, payload, {
        requireAuth: true,
      });

      await refreshUser();
      setStatus("✅ Profile updated!");

      const nextUsername = form.username || originalUsername;
      router.push(`/profile/${nextUsername}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setStatus(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center text-[#fff3d2]/85">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] text-center">
            Edit Profile
          </h1>
          <p className="mt-2 text-center text-sm text-[#ffe9b8]/70">
            Update your identity and collaboration signals.
          </p>
        </header>

        <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 sm:p-8 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md space-y-8">
          <div
            id="account-email"
            className="rounded-2xl border border-[#FFD700]/12 bg-[#120606]/28 p-5 space-y-3 scroll-mt-8"
          >
            <h2 className="text-lg font-bold text-[#fff3d2]">Email</h2>
            <p className="text-xs text-[#ffe9b8]/60">
              Sign-up email. Save updates your account when the backend supports{" "}
              <code className="text-[#FFD700]/80">PUT /users/me</code>.
            </p>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => {
                setAccountMsg("");
                setAccountEmail(e.target.value);
              }}
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
            />
            <button
              type="button"
              onClick={handleSaveEmail}
              disabled={savingEmail}
              className="rounded-xl border border-[#FFD700]/35 bg-[#120606]/35 px-4 py-2 text-sm font-semibold text-[#fff3d2] hover:bg-[#120606]/50 disabled:opacity-60"
            >
              {savingEmail ? "Saving…" : "Save email"}
            </button>
          </div>

          <div
            id="account-password"
            className="rounded-2xl border border-[#FFD700]/12 bg-[#120606]/28 p-5 space-y-3 scroll-mt-8"
          >
            <h2 className="text-lg font-bold text-[#fff3d2]">Password</h2>
            <p className="text-[10px] font-mono text-[#ffe9b8]/75 break-all">
              {PASSWORD_HASH_PLACEHOLDER}
            </p>
            <p className="text-xs text-[#ffe9b8]/55">
              Placeholder hash for display only. Your real password hash is never sent to the
              browser. Use the form below to set a new password if your API exposes a change
              endpoint.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
              <input
                type="password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              />
              <input
                type="password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              />
              <input
                type="password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full rounded-xl border border-[#FFD700]/35 bg-[#120606]/35 py-2.5 text-sm font-semibold text-[#fff3d2] hover:bg-[#120606]/50 disabled:opacity-60"
              >
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>

          {accountMsg ? (
            <div
              className={`text-center text-sm rounded-xl px-4 py-3 font-medium ${
                accountMsg.includes("❌") ? "text-red-400" : "text-green-400"
              }`}
            >
              {accountMsg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                  placeholder="Enter your full name"
                />
              </div>

              <div id="account-username" className="scroll-mt-8">
                <label className="block mb-2 text-sm font-semibold text-[#ffe9b8]/90">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                  placeholder="e.g. setor_t"
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
                rows={4}
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                placeholder="Write a short bio about yourself"
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
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                placeholder="Separate multiple themes with commas"
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
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                placeholder="Add URLs separated by commas (GitHub, Drive, Behance...)"
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
                rows={3}
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                placeholder="Describe your next big idea or goal"
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
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                placeholder="e.g. University of Ghana, Bisa Collective"
              />
            </div>

            {status ? (
              <div
                className={`text-center text-sm rounded-xl px-4 py-3 font-medium ${
                  status.includes("❌") ? "text-red-400" : "text-green-400"
                }`}
              >
                {status}
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/profile/${originalUsername}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFD700]/30 bg-[#120606]/30 py-3 font-semibold text-[#fff3d2]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/45 hover:border-[#FFD700]/45"
              >
                Back to Profile
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center rounded-xl bg-[#FFD700] py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/25 transition hover:shadow-xl hover:shadow-[#FFD700]/40 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


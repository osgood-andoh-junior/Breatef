"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser, isLoggedIn, loading: authLoading, refreshUser } = useAuth();

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

  // Sync email from auth
  useEffect(() => {
    if (currentUser?.email) {
      setAccountEmail(currentUser.email);
    }
  }, [currentUser]);

  // MAIN LOAD LOGIC (FIXED)
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // ✅ CRITICAL FIX: wait until user exists
    if (!currentUser?.username) return;

    const username = currentUser.username;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setStatus("");

      // Pre-fill from auth
      setForm({
        full_name: currentUser.full_name ?? "",
        username: currentUser.username ?? "",
        bio: currentUser.bio ?? "",
        preferred_themes: currentUser.preferred_themes ?? "",
        portfolio_links: currentUser.portfolio_links ?? "",
        next_build: currentUser.next_build ?? "",
        affiliations: currentUser.affiliations ?? "",
      });

      try {
        const data = await apiClient.get<ProfileData>(
          `/profile/${username}`,
          { requireAuth: true }
        );

        if (cancelled) return;

        setForm({
          full_name: data.full_name ?? "",
          username: data.username ?? username,
          bio: data.bio ?? "",
          preferred_themes: data.preferred_themes ?? "",
          portfolio_links: data.portfolio_links ?? "",
          next_build: data.next_build ?? "",
          affiliations: data.affiliations ?? "",
        });
      } catch (err) {
        console.log("⚠️ Profile fetch failed:", err);
        setStatus("Using saved data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, currentUser, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStatus("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // EMAIL UPDATE
  const handleSaveEmail = async () => {
    setAccountMsg("");
    setSavingEmail(true);

    try {
      await apiClient.put(
        `/users/me`,
        { email: accountEmail },
        { requireAuth: true }
      );

      await refreshUser();
      setAccountMsg("✅ Email updated.");
    } catch (err) {
      setAccountMsg("❌ Could not update email");
    } finally {
      setSavingEmail(false);
    }
  };

  // PASSWORD UPDATE
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMsg("");

    if (pwdNew !== pwdConfirm) {
      setAccountMsg("❌ Passwords do not match.");
      return;
    }

    if (pwdNew.length < 8) {
      setAccountMsg("❌ Password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);

    try {
      await apiClient.post(
        `/users/change-password`,
        { current_password: pwdCurrent, new_password: pwdNew },
        { requireAuth: true }
      );

      setAccountMsg("✅ Password updated.");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch {
      setAccountMsg("❌ Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // SAVE PROFILE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.username) return;

    setSaving(true);
    setStatus("");

    try {
      await apiClient.put(
        `/profile/${currentUser.username}`,
        form,
        { requireAuth: true }
      );

      await refreshUser();

      const nextUsername = form.username || currentUser.username;

      setStatus("✅ Profile updated!");
      router.push(`/profile/${nextUsername}`);
      router.refresh();
    } catch {
      setStatus("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  // LOADING UI
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#fff3d2]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-center text-[#fff3d2]">
          Edit Profile
        </h1>

        {/* EMAIL */}
        <div>
          <input
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            className="w-full p-3 rounded bg-black text-white"
          />
          <button onClick={handleSaveEmail}>
            {savingEmail ? "Saving..." : "Save Email"}
          </button>
        </div>

        {/* PASSWORD */}
        <form onSubmit={handleChangePassword}>
          <p>{PASSWORD_HASH_PLACEHOLDER}</p>

          <input
            type="password"
            placeholder="Current password"
            value={pwdCurrent}
            onChange={(e) => setPwdCurrent(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            value={pwdNew}
            onChange={(e) => setPwdNew(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={pwdConfirm}
            onChange={(e) => setPwdConfirm(e.target.value)}
          />

          <button type="submit">
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* PROFILE FORM */}
        <form onSubmit={handleSubmit}>
          <input name="full_name" value={form.full_name} onChange={handleChange} />
          <input name="username" value={form.username} onChange={handleChange} />
          <textarea name="bio" value={form.bio} onChange={handleChange} />

          {status && <p>{status}</p>}

          <button type="submit">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <button onClick={() => router.push(`/profile/${currentUser?.username}`)}>
          Back to Profile
        </button>
      </div>
    </div>
  );
}
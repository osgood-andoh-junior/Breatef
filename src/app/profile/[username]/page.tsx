"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";

type ProfileData = {
  id?: number;
  email?: string;
  username?: string;
  full_name?: string;
  bio?: string;
  preferred_themes?: string;
  portfolio_links?: string;
  next_build?: string;
  affiliations?: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, isLoggedIn } = useAuth();

  const profileUsername = currentUser?.username;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [form, setForm] = useState<Required<Omit<ProfileData, "id" | "email">>>({
    full_name: "",
    username: "",
    bio: "",
    preferred_themes: "",
    portfolio_links: "",
    next_build: "",
    affiliations: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn || !profileUsername) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await apiClient.get<ProfileData>(
          `/profile/${profileUsername}`,
          { requireAuth: true }
        );

        setForm({
          full_name: data.full_name ?? "",
          username: data.username ?? profileUsername,
          bio: data.bio ?? "",
          preferred_themes: data.preferred_themes ?? "",
          portfolio_links: data.portfolio_links ?? "",
          next_build: data.next_build ?? "",
          affiliations: data.affiliations ?? "",
        });
      } catch (err: unknown) {
        console.error("Failed to load profile:", err);

        if (
          err instanceof Error &&
          err.message.toLowerCase().includes("unauthorized")
        ) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoggedIn, profileUsername, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // 👇 Explicit generic so Vercel never treats it as unknown
      await apiClient.put<ProfileData>(
        `/profile/edit`,
        form,
        { requireAuth: true }
      );

      setMessage("✅ Profile updated!");

      setTimeout(() => {
        router.push(`/profile/${form.username || profileUsername}`);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage("❌ Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-[#550000]">
        Please log in to edit your profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-[#550000]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 border border-[#550000]/20 space-y-4"
      >
        <h1 className="text-3xl font-bold text-[#550000] text-center">
          Edit Profile
        </h1>

        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full name"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
          rows={4}
        />

        <input
          name="preferred_themes"
          value={form.preferred_themes}
          onChange={handleChange}
          placeholder="Preferred themes"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <input
          name="portfolio_links"
          value={form.portfolio_links}
          onChange={handleChange}
          placeholder="Portfolio links"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <input
          name="next_build"
          value={form.next_build}
          onChange={handleChange}
          placeholder="Next build"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <input
          name="affiliations"
          value={form.affiliations}
          onChange={handleChange}
          placeholder="Affiliations"
          className="w-full border border-[#550000]/40 p-2 rounded focus:ring-1 focus:ring-[#550000]"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#550000] text-white p-2 rounded hover:bg-[#770000] transition-all disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p className="text-center mt-2 font-medium text-[#550000]/80">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}





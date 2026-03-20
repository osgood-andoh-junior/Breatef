"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { UserRound } from "lucide-react";

type ProfileData = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_themes?: string | null;
  portfolio_links?: string | null;
  next_build?: string | null;
  affiliations?: string | null;
};

export default function ProfilePage() {
  const params = useParams();
  const { currentUser } = useAuth();

  const urlUsername = useMemo(() => {
    const raw = (params as { username?: string | string[] })?.username;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!urlUsername) {
        setError("Missing profile username.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        // Public profile: do not require auth to view.
        const data = await apiClient.get<ProfileData>(`/profile/${urlUsername}`, {
          requireAuth: false,
        });
        setProfile(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load profile: ${msg}`);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [urlUsername]);

  const isOwnProfile = Boolean(
    currentUser?.username && urlUsername && currentUser.username === urlUsername
  );

  const displayName =
    profile?.full_name || profile?.username || urlUsername || "Unknown";
  const initial = displayName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-3xl text-center text-[#fff3d2]/85">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 text-[#ffe9b8]/75 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-[#FFD700]" />
            <p className="font-semibold">Could not load this profile.</p>
          </div>
          {error ? <p className="mt-3 text-sm">{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FFD700] text-[#2b0b0b] font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
                {initial}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-black text-[#fff3d2] truncate">
                  {profile.full_name || "Unnamed Creator"}
                </h1>
                <p className="text-sm text-[#ffe9b8]/75 truncate">
                  @{profile.username || urlUsername}
                </p>
              </div>
            </div>

            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFD700]/30 bg-[#120606]/30 px-5 py-2.5 font-semibold text-[#fff3d2]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/45 hover:border-[#FFD700]/45"
              >
                Edit Profile
              </Link>
            ) : null}
          </div>
        </header>

        <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <div className="space-y-5">
            <PreviewField
              label="Bio"
              value={profile.bio || "No bio available."}
            />
            <PreviewField
              label="Preferred Project Themes"
              value={
                profile.preferred_themes ||
                "Themes you like to build around will appear here."
              }
            />
            <PreviewField
              label="Portfolio Links"
              value={
                profile.portfolio_links ||
                "Links to your work (GitHub, Drive, Behance, etc.)"
              }
            />
            <PreviewField
              label="What I Want to Build Next"
              value={profile.next_build || "No next build idea yet."}
            />
            <PreviewField
              label="Coalitions / Affiliations"
              value={
                profile.affiliations ||
                "Your groups, communities, or institutions."
              }
            />
          </div>
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
      <p className="text-[#fff3d2]/88 leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}





"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";

type ProfileData = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_themes?: string | null;
  portfolio_links?: string | null;
  next_build?: string | null;
  affiliations?: string | null;
  archetype_id?: number | null;
  tier_id?: number | null;
};

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#ffe9b8]/55">
        {label}
      </p>
      <p className="text-[#fff3d2]/88 leading-relaxed whitespace-pre-wrap break-words">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const { currentUser, isLoggedIn, loading: authLoading } = useAuth();

  const urlUsername = useMemo(() => {
    const raw = (params as { username?: string | string[] })?.username;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  }, [params]);

  const isOwnProfile =
    Boolean(currentUser?.username) && currentUser?.username === urlUsername;

  const fallbackFromAuth: ProfileData | null = useMemo(() => {
    if (!currentUser?.username || !isOwnProfile) return null;
    return {
      full_name: currentUser.full_name ?? "",
      username: currentUser.username ?? urlUsername,
      bio: currentUser.bio ?? "",
      preferred_themes: currentUser.preferred_themes ?? "",
      portfolio_links: currentUser.portfolio_links ?? "",
      next_build: currentUser.next_build ?? "",
      affiliations: currentUser.affiliations ?? "",
      archetype_id: currentUser.archetype_id ?? null,
      tier_id: currentUser.tier_id ?? null,
    };
  }, [currentUser, isOwnProfile, urlUsername]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!urlUsername) {
        setError("Missing profile username.");
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Public view: do not require auth for reading another creator.
        const data = await apiClient.get<ProfileData>(`/profile/${urlUsername}`, {
          requireAuth: false,
        });
        if (!cancelled) setProfile(data);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Unknown error";

        // If viewing own profile, gracefully fall back to whatever we already have in AuthContext.
        if (isOwnProfile && fallbackFromAuth) {
          setProfile(fallbackFromAuth);
          setError("");
          return;
        }

        setError(`Failed to load profile: ${msg}`);
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [urlUsername, isOwnProfile, fallbackFromAuth]);

  const displayProfile = profile ?? fallbackFromAuth;
  const initial =
    (displayProfile?.full_name || displayProfile?.username || urlUsername || "?")
      .charAt(0)
      .toUpperCase();

  if (authLoading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-5xl text-center text-[#fff3d2]/85">
          Loading...
        </div>
      </div>
    );
  }

  // If user isn't logged in, allow viewing other creators; only editing is blocked.
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-3xl text-center text-[#fff3d2]/85">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !displayProfile) {
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
                  {displayProfile.full_name || "Unnamed Creator"}
                </h1>
                <p className="text-sm text-[#ffe9b8]/75 truncate">
                  @{displayProfile.username || urlUsername}
                </p>
              </div>
            </div>

            {isOwnProfile && isLoggedIn ? (
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
              label="Full Name"
              value={displayProfile.full_name || "—"}
            />
            <PreviewField
              label="Username"
              value={`@${displayProfile.username || urlUsername}`}
            />
            <PreviewField
              label="Bio"
              value={displayProfile.bio || "No bio available."}
            />
            <PreviewField
              label="Preferred Project Themes"
              value={
                displayProfile.preferred_themes ||
                "Themes you like to build around will appear here."
              }
            />
            <PreviewField
              label="Portfolio Links"
              value={
                displayProfile.portfolio_links ||
                "Links to your work (GitHub, Drive, Behance, etc.)"
              }
            />
            <PreviewField
              label="What I Want to Build Next"
              value={displayProfile.next_build || "No next build idea yet."}
            />
            <PreviewField
              label="Coalitions / Affiliations"
              value={
                displayProfile.affiliations ||
                "Your groups, communities, or institutions."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}


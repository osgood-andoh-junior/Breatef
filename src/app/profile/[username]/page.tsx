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
  archetype?: string | null;
  tier?: string | null;
};

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#ffe9b8]/55">
        {label}
      </p>
      <p className="text-[#fff3d2]/88 whitespace-pre-wrap break-words">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const { currentUser, isLoggedIn, loading: authLoading } = useAuth();

  // ✅ SAFER username extraction
  const urlUsername = useMemo(() => {
    const raw = (params as { username?: string | string[] })?.username;
    if (!raw) return "";
    return typeof raw === "string" ? raw : raw[0];
  }, [params]);

  const isOwnProfile =
    currentUser?.username && currentUser.username === urlUsername;

  const fallbackFromAuth: ProfileData | null = useMemo(() => {
    if (!isOwnProfile || !currentUser) return null;

    return {
      full_name: currentUser.full_name ?? "",
      username: currentUser.username ?? urlUsername,
      bio: currentUser.bio ?? "",
      preferred_themes: currentUser.preferred_themes ?? "",
      portfolio_links: currentUser.portfolio_links ?? "",
      next_build: currentUser.next_build ?? "",
      affiliations: currentUser.affiliations ?? "",
    };
  }, [currentUser, isOwnProfile, urlUsername]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      // 🚨 critical guard
      if (!urlUsername) {
        setError("Invalid profile URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await apiClient.get<ProfileData>(
          `/profile/${urlUsername}`,
          { requireAuth: false }
        );

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        console.log("❌ API failed:", err);

        // ✅ fallback to auth (own profile only)
        if (isOwnProfile && fallbackFromAuth) {
          setProfile(fallbackFromAuth);
          setError("");
        } else {
          setError("Profile not found.");
          setProfile(null);
        }
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
    (displayProfile?.full_name ||
      displayProfile?.username ||
      urlUsername ||
      "?")[0].toUpperCase();

  // ✅ GLOBAL LOADING
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#fff3d2]/80">Loading profile...</p>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (!displayProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Profile could not be loaded.</p>
          {error && <p className="text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-500 text-black flex items-center justify-center rounded-xl font-bold">
              {initial}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {displayProfile.full_name || "Unnamed"}
              </h1>
              <p className="text-gray-400">
                @{displayProfile.username || urlUsername}
              </p>
            </div>
          </div>

          {/* EDIT BUTTON */}
          {isOwnProfile && isLoggedIn && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 border rounded"
            >
              Edit
            </Link>
          )}
        </div>

        {/* PROFILE DATA */}
        <div className="space-y-4 text-white">
          <PreviewField label="Bio" value={displayProfile.bio || "—"} />
          <PreviewField label="Themes" value={displayProfile.preferred_themes || "—"} />
          <PreviewField label="Portfolio" value={displayProfile.portfolio_links || "—"} />
          <PreviewField label="Next Build" value={displayProfile.next_build || "—"} />
          <PreviewField label="Affiliations" value={displayProfile.affiliations || "—"} />
        </div>
      </div>
    </div>
  );
}
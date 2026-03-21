"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loading } = useAuth();

  // Prevent multiple redirects
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    hasRedirected.current = true;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (currentUser?.username) {
      router.replace(`/profile/${currentUser.username}`);
    } else {
      // fallback safety (VERY IMPORTANT)
      router.replace("/login");
    }
  }, [loading, isLoggedIn, currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center text-[#fff3d2]/85 animate-pulse">
        Redirecting to your profile...
      </div>
    </div>
  );
}
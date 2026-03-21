"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // Wait until auth finishes loading
    if (loading) return;

    // Only redirect to login if NOT logged in
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    // Redirect to username-specific profile if we have it
    if (currentUser?.username) {
      router.replace(`/profile/${currentUser.username}`);
    }
    // Optional: you can show a placeholder until username is ready
  }, [loading, isLoggedIn, currentUser?.username, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center text-[#fff3d2]/85">
        {loading
          ? "Loading..."
          : !currentUser?.username
          ? "Preparing your profile..."
          : "Redirecting..."}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn || !currentUser?.username) {
      router.replace("/login");
      return;
    }

    router.replace(`/profile/${currentUser.username}`);
  }, [loading, isLoggedIn, currentUser?.username, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center text-[#fff3d2]/85">Loading...</div>
    </div>
  );
}


"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, SearchIcon, BriefcaseIcon, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

// TYPES
interface Peer {
  id: number;
  username: string;
  archetype: string | null;
  tier: string | null;
  bio: string | null;
}

interface FilterOption {
  id: number | string;
  name: string;
}

export default function DiscoverPage() {
  const [archetypes, setArchetypes] = useState<FilterOption[]>([]);
  const [tiers, setTiers] = useState<FilterOption[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);

  const [search, setSearch] = useState("");
  const [archetypeId, setArchetypeId] = useState("");
  const [tierId, setTierId] = useState("");

  const [loading, setLoading] = useState(false);

  // 🧠 Prevent race conditions
  const fetchIdRef = useRef(0);

  // ✅ Fetch filter options (safe)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [a, t] = await Promise.all([
          apiClient.get<FilterOption[]>("/archetypes/", { requireAuth: false }),
          apiClient.get<FilterOption[]>("/tiers/", { requireAuth: false }),
        ]);

        setArchetypes(Array.isArray(a) ? a : []);
        setTiers(Array.isArray(t) ? t : []);
      } catch {
        setArchetypes([]);
        setTiers([]);
      }
    };

    loadFilters();
  }, []);

  // ✅ Debounced fetch (REAL fix)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const currentFetchId = ++fetchIdRef.current;

      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (search.trim()) params.append("username", search.trim());
        if (archetypeId) params.append("archetype_id", archetypeId);
        if (tierId) params.append("tier_id", tierId);

        const endpoint = params.toString()
          ? `/discover/users?${params.toString()}`
          : `/discover/users`;

        const data = await apiClient.get<Peer[]>(endpoint, {
          requireAuth: false,
        });

        // 🛑 Ignore stale responses
        if (currentFetchId !== fetchIdRef.current) return;

        setPeers(Array.isArray(data) ? data : []);
      } catch {
        if (currentFetchId !== fetchIdRef.current) return;
        setPeers([]);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, archetypeId, tierId]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-8 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow backdrop-blur-md">
          <h1 className="text-3xl font-black text-[#fff3d2] flex items-center gap-3">
            <User className="w-8 h-8 text-[#FFD700]" />
            Discover Creators
          </h1>
        </header>

        {/* FILTERS */}
        <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 mb-8 backdrop-blur-md">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ffe9b8]/55" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search username..."
                className="w-full pl-10 px-4 py-3 rounded-xl bg-[#120606]/40 text-[#fff3d2]"
              />
            </div>

            {/* Archetype */}
            <select
              value={archetypeId}
              onChange={(e) => setArchetypeId(e.target.value)}
              className="rounded-xl px-4 py-3 bg-[#120606]/40 text-[#fff3d2]"
            >
              <option value="">All Archetypes</option>
              {archetypes.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Tier */}
            <select
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              className="rounded-xl px-4 py-3 bg-[#120606]/40 text-[#fff3d2]"
            >
              <option value="">All Tiers</option>
              {tiers.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : peers.length === 0 ? (
            <div className="text-center p-10 text-[#ffe9b8]/70">
              <BriefcaseIcon className="mx-auto mb-3" />
              No creators found.
            </div>
          ) : (
            peers.map((peer) => (
              <div
                key={peer.id}
                className="p-6 rounded-3xl bg-[#120606]/22 border border-[#FFD700]/18 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#fff3d2]">
                    {peer.username}
                  </h3>
                  <p className="text-sm text-[#ffe9b8]/70">
                    {peer.archetype || "N/A"} • {peer.tier || "N/A"}
                  </p>
                </div>

                <Link
                  href={`/profile/${peer.username}`}
                  className="bg-[#FFD700] px-4 py-2 rounded-xl text-[#2b0b0b]"
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
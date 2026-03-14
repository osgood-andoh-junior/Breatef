"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { User, SearchIcon, BriefcaseIcon, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

// --- TYPE DEFINITIONS ---
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

interface Filters {
  archetypeId: string;
  tierId: string;
  search: string;
}

// --- COMPONENT: PeerCard ---
const PeerCard: React.FC<{ peer: Peer }> = ({ peer }) => (
  <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.20)] backdrop-blur-md transition hover:bg-[#120606]/32 hover:border-[#FFD700]/28 hover:-translate-y-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center text-[#2b0b0b] text-xl font-extrabold shadow-lg shadow-[#FFD700]/20">
        {peer.username.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-[#fff3d2]">
          {peer.username}
        </h3>
        <p className="text-sm text-[#ffe9b8]/75 font-semibold">
          {peer.archetype || "N/A"} • {peer.tier || "N/A"} Tier
        </p>
      </div>
    </div>

    <div className="flex flex-col md:w-3/5 gap-3">
      <p className="text-sm text-[#ffe9b8]/75 italic border-l-2 border-[#FFD700]/70 pl-3">
        {peer.bio || "No bio available."}
      </p>

      <div className="flex items-center justify-end pt-1">
        <Link
          href={`/profile/${peer.username}`}
          className="px-5 py-2.5 text-sm font-semibold rounded-2xl bg-[#FFD700] text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/35 transition inline-block text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const PeerDirectory: React.FC = () => {
  const [archetypeOptions, setArchetypeOptions] = useState<FilterOption[]>([]);
  const [tierOptions, setTierOptions] = useState<FilterOption[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    archetypeId: "",
    tierId: "",
    search: "",
  });

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Fetch filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [aData, tData] = await Promise.all([
          apiClient.get<FilterOption[]>(`/archetypes/`, { requireAuth: false }),
          apiClient.get<FilterOption[]>(`/tiers/`, { requireAuth: false }),
        ]);

        setArchetypeOptions(Array.isArray(aData) ? aData : []);
        setTierOptions(Array.isArray(tData) ? tData : []);
      } catch (err) {
        console.error("⚠️ Could not fetch archetypes/tiers:", err);
        setArchetypeOptions([]);
        setTierOptions([]);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch all users or filtered results
  const fetchResults = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append("username", currentFilters.search);
      if (currentFilters.archetypeId)
        params.append("archetype_id", currentFilters.archetypeId);
      if (currentFilters.tierId)
        params.append("tier_id", currentFilters.tierId);

      const endpoint = params.toString()
        ? `/discover/users?${params.toString()}`
        : `/discover/users`;

      const data = await apiClient.get<Peer[]>(endpoint, {
        requireAuth: false,
      });
      setPeers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Discover fetch failed:", err);
      setPeers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchResults({
      archetypeId: "",
      tierId: "",
      search: "",
    });
  }, [fetchResults]);

  // Update results when filters change
  useEffect(() => {
    const timeout = setTimeout(() => fetchResults(filters), 400);
    return () => clearTimeout(timeout);
  }, [filters, fetchResults]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] flex items-center gap-3">
            <User className="w-8 h-8 text-[#FFD700]" />
            Discover Creators
          </h1>
          <p className="text-sm sm:text-base text-[#ffe9b8]/70 mt-2">
            Search for creators, innovators, and systems thinkers.
          </p>
        </header>

        {/* Filter Section */}
        <div className="rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ffe9b8]/55" />
              <input
                type="text"
                placeholder="Search by username..."
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 pl-10 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <select
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              value={filters.archetypeId}
              onChange={(e) => handleFilterChange("archetypeId", e.target.value)}
            >
              <option value="" className="bg-[#120606]">
                All Archetypes
              </option>
              {archetypeOptions.map((a) => (
                <option key={a.id} value={String(a.id)} className="bg-[#120606]">
                  {a.name}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              value={filters.tierId}
              onChange={(e) => handleFilterChange("tierId", e.target.value)}
            >
              <option value="" className="bg-[#120606]">
                All Tiers
              </option>
              {tierOptions.map((t) => (
                <option key={t.id} value={String(t.id)} className="bg-[#120606]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center p-10 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md text-[#fff3d2] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-semibold">Searching the network...</p>
            </div>
          ) : peers.length === 0 ? (
            <div className="text-center p-10 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md text-[#ffe9b8]/70">
              <BriefcaseIcon className="w-10 h-10 mx-auto mb-3 text-[#FFD700]" />
              <p className="font-semibold text-[#fff3d2]">
                {filters.search || filters.archetypeId || filters.tierId
                  ? "No creators found matching your criteria."
                  : "No users found."}
              </p>
              <p className="text-sm mt-1">
                {filters.search || filters.archetypeId || filters.tierId
                  ? "Try broadening your filters or search terms."
                  : "Users will appear here once they join BREATE."}
              </p>
            </div>
          ) : (
            peers.map((peer) => <PeerCard key={peer.id} peer={peer} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerDirectory;
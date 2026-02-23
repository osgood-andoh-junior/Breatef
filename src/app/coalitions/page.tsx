"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Users,
  MapPin,
  Briefcase,
  ChevronRight,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

// --- TYPES ---
interface Coalition {
  id: number;
  name: string;
  location: string;
  focus: string;
  description: string;
  bannerEmoji?: string;
  memberCount?: number;
  activeProjects?: number;
}

interface FilterState {
  searchQuery: string;
  region: string | "All";
}

// --- REGIONS ---
const REGIONS = [
  "All",
  "Accra, Ghana",
  "Lagos, Nigeria",
  "Nairobi, Kenya",
  "Cape Town, South Africa",
];

const CoalitionsPage = () => {
  const [coalitions, setCoalitions] = useState<Coalition[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    region: "All",
  });
  const [selectedCoalition, setSelectedCoalition] = useState<Coalition | null>(
    null
  );

  // --- Fetch coalitions from backend ---
  useEffect(() => {
    const fetchCoalitions = async () => {
      try {
        // ✅ keep endpoint style consistent with the rest of your app
        const data = await apiClient.get<Coalition[]>(`/coalitions/`, {
          requireAuth: false,
        });
        setCoalitions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Error fetching coalitions:", err?.message || err);
        setCoalitions([]);
      }
    };

    fetchCoalitions();
  }, []);

  // --- Filters ---
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredCoalitions = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return coalitions.filter((coalition) => {
      const name = (coalition.name || "").toLowerCase();
      const focus = (coalition.focus || "").toLowerCase();
      const location = coalition.location || "";

      if (query) {
        if (!name.includes(query) && !focus.includes(query)) return false;
      }

      if (filters.region !== "All" && location !== filters.region) return false;

      return true;
    });
  }, [coalitions, filters]);

  // --- Fetch coalition details ---
  const handleViewCoalition = async (id: number) => {
    try {
      const data = await apiClient.get<Coalition>(`/coalitions/${id}`, {
        requireAuth: false,
      });
      setSelectedCoalition(data);
    } catch (err: any) {
      console.error("❌ Error fetching coalition:", err?.message || err);
      alert(`Failed to load coalition: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    // ✅ transparent page so your layout background stays even
    <div className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="mx-auto mb-8 max-w-7xl rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] flex items-center gap-3">
          <span className="text-3xl">🤝</span> Coalitions Directory
        </h1>
        <p className="text-sm text-[#ffe9b8]/70">
          Find communities, universities, hubs and teams to collaborate with.
        </p>
      </header>

      <main className="mx-auto max-w-7xl">
        {/* Filters */}
        <div className="mb-8 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <h2 className="text-lg font-bold text-[#fff3d2] mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-[#FFD700]" /> Find Your
            Community
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="text"
              name="searchQuery"
              placeholder="Search by Name or Focus"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="sm:col-span-2 w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
            />
            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-[#120606]">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coalition Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoalitions.length > 0 ? (
            filteredCoalitions.map((coalition) => (
              <div
                key={coalition.id}
                className="group rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.20)] backdrop-blur-md transition hover:bg-[#120606]/32 hover:border-[#FFD700]/28 hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-[#FFD700]/10 flex items-center gap-4">
                  <div className="text-4xl">
                    {coalition.bannerEmoji || "🤝"}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#fff3d2] leading-tight">
                      {coalition.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#FFD700]/90">
                      {coalition.focus}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-semibold">
                    <div className="flex items-center text-[#ffe9b8]/80">
                      <Users className="w-4 h-4 mr-2 text-[#FFD700]" />
                      {coalition.memberCount || 0} Members
                    </div>
                    <div className="flex items-center text-[#ffe9b8]/80">
                      <Briefcase className="w-4 h-4 mr-2 text-[#ffe58a]" />
                      {coalition.activeProjects || 0} Active Projects
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-[#ffe9b8]/70 mb-4 pb-4 border-b border-[#FFD700]/10">
                    <MapPin className="w-4 h-4 mr-2 text-[#FFD700]/90" />
                    {coalition.location}
                  </div>

                  <button
                    onClick={() => handleViewCoalition(coalition.id)}
                    className="mt-1 w-full inline-flex justify-center items-center rounded-2xl bg-[#FFD700] px-4 py-3 text-base font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 transition hover:shadow-xl hover:shadow-[#FFD700]/35"
                  >
                    View Coalition Profile
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 text-center p-12 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-xl font-medium text-[#ffe9b8]/75">
                No Coalitions match your search.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Coalition Details Modal */}
      {selectedCoalition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            onClick={() => setSelectedCoalition(null)}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Close coalition modal backdrop"
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-3xl border border-[#FFD700]/22 bg-[#120606]/35 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-md p-7 sm:p-8">
            <div className="flex justify-between items-start mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#fff3d2]">
                  {selectedCoalition.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#FFD700]/90">
                  {selectedCoalition.focus}
                </p>
              </div>

              <button
                onClick={() => setSelectedCoalition(null)}
                className="rounded-xl border border-[#FFD700]/20 bg-[#120606]/35 p-2 text-[#ffe9b8]/80 hover:text-white hover:bg-[#120606]/50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-[#fff3d2] mb-1">Location</h3>
                <p className="text-[#ffe9b8]/75">{selectedCoalition.location}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#fff3d2] mb-1">
                  Description
                </h3>
                <p className="text-[#ffe9b8]/75">
                  {selectedCoalition.description}
                </p>
              </div>

              {selectedCoalition.memberCount !== undefined && (
                <div>
                  <h3 className="font-semibold text-[#fff3d2] mb-1">Members</h3>
                  <p className="text-[#ffe9b8]/75">
                    {selectedCoalition.memberCount} members
                  </p>
                </div>
              )}

              {selectedCoalition.activeProjects !== undefined && (
                <div>
                  <h3 className="font-semibold text-[#fff3d2] mb-1">
                    Active Projects
                  </h3>
                  <p className="text-[#ffe9b8]/75">
                    {selectedCoalition.activeProjects} projects
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCoalition(null)}
                className="rounded-2xl border border-[#FFD700]/18 bg-[#120606]/25 px-5 py-2.5 text-[#ffe9b8]/85 hover:bg-[#120606]/40 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoalitionsPage;












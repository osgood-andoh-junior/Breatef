"use client";

import React, { useState, useEffect } from "react";
import { Users, Briefcase, ChevronRight, Star } from "lucide-react";

// --- 1. TYPE DEFINITIONS ---

type Archetype = "Creator" | "Creative" | "Innovator" | "Systems Thinker";
type Tier = "Base" | "Standard" | "Professional";

interface Collaborator {
  id: string;
  name: string;
  archetype: Archetype;
  tier: Tier;
  lastProjectTitle: string;
  lastProjectDate: string;
  profilePicUrl: string;
}

// --- 2. HELPERS ---

const getAvatarUrl = (seed: string) =>
  `https://placehold.co/100x100/A0522D/FFFF00?text=${seed}`;

const getTierColor = (tier: Tier) => {
  switch (tier) {
    case "Professional":
      return "bg-[#FFD700] text-[#2b0b0b] border-[#FFD700]";
    case "Standard":
      return "bg-[#120606]/35 text-[#ffe9b8] border-[#FFD700]/20";
    case "Base":
      return "bg-[#120606]/25 text-[#ffe9b8]/80 border-[#FFD700]/15";
  }
};

// --- 3. SUB-COMPONENTS ---

const CollaboratorCard: React.FC<{ collaborator: Collaborator }> = ({
  collaborator,
}) => (
  <div className="group rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.20)] backdrop-blur-md transition hover:bg-[#120606]/32 hover:border-[#FFD700]/28 hover:-translate-y-1 p-6 flex items-center gap-5">
    <img
      src={collaborator.profilePicUrl}
      alt={collaborator.name}
      className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD700]/70 shadow-md"
      onError={(e: any) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/100x100/A0522D/FFFF00?text=👤";
      }}
    />

    <div className="flex-grow min-w-0">
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h3 className="text-xl font-extrabold text-[#fff3d2] leading-tight">
          {collaborator.name}
        </h3>

        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getTierColor(
            collaborator.tier
          )}`}
        >
          {collaborator.archetype} • {collaborator.tier}
        </span>
      </div>

      <div className="text-sm text-[#ffe9b8]/75 flex items-center mt-2 min-w-0">
        <Briefcase className="w-4 h-4 mr-2 text-[#FFD700]/90 flex-shrink-0" />
        <span className="font-semibold mr-1 text-[#fff3d2]/90">Last Collab:</span>
        <span className="truncate">{collaborator.lastProjectTitle}</span>
        <span className="text-xs ml-2 text-[#ffe9b8]/55 flex-shrink-0">
          ({collaborator.lastProjectDate})
        </span>
      </div>
    </div>

    <div className="flex gap-3 flex-shrink-0">
      <button
        title="View Profile"
        className="p-3 rounded-2xl bg-[#FFD700] text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 transition hover:shadow-xl hover:shadow-[#FFD700]/35 active:scale-[0.99]"
        onClick={() => console.log(`View Profile for ${collaborator.name}`)}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// --- 4. MAIN COMPONENT ---

const CollabCirclePage = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [savedProfiles] = useState<Collaborator[]>([]);
  const [activeTab, setActiveTab] = useState<"circle" | "saved">("circle");

  // ✅ Get logged-in username from localStorage
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const username = storedUser ? JSON.parse(storedUser)?.username : null;

  useEffect(() => {
    const fetchCollabCircle = async () => {
      if (!username) return; // Skip if not logged in
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "https://breatebackend.onrender.com"
          }/api/v1/collabcircle/${username}`
        );
        const data = await res.json();
        if (data.collab_circle) {
          const formatted = data.collab_circle.map((c: any, index: number) => ({
            id: `${index}`,
            name: c.collaborator_username,
            archetype: "Creator" as Archetype, // Placeholder since backend doesn’t include this
            tier: "Standard" as Tier,
            lastProjectTitle: c.project_name || "Untitled Project",
            lastProjectDate: c.verified_at
              ? new Date(c.verified_at).toLocaleDateString()
              : "N/A",
            profilePicUrl: getAvatarUrl(
              c.collaborator_username[0]?.toUpperCase() || "U"
            ),
          }));
          setCollaborators(formatted);
        }
      } catch (err) {
        console.error("Error fetching collab circle:", err);
      }
    };

    fetchCollabCircle();
  }, [username]);

  const CollabCircleCount = collaborators.length;
  const SavedProfilesCount = savedProfiles.length;

  return (
    // ✅ transparent so layout background stays consistent
    <div className="min-h-screen px-6 py-10">
      <header className="mx-auto mb-8 max-w-4xl rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] flex items-center gap-3">
          <span className="text-3xl">🌀</span> My Collab Circle
        </h1>
        <p className="text-[#ffe9b8]/70 text-sm sm:text-base">
          Your network of confirmed, verified collaborators.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md overflow-hidden">
          <div className="grid grid-cols-2">
            <button
              className={[
                "py-4 text-center text-sm sm:text-base font-semibold transition",
                "flex items-center justify-center gap-2",
                activeTab === "circle"
                  ? "text-[#2b0b0b] bg-[#FFD700]"
                  : "text-[#ffe9b8]/75 hover:text-white hover:bg-[#120606]/30",
              ].join(" ")}
              onClick={() => setActiveTab("circle")}
            >
              <Users className="w-5 h-5" />
              Collab Circle ({CollabCircleCount})
            </button>

            <button
              className={[
                "py-4 text-center text-sm sm:text-base font-semibold transition",
                "flex items-center justify-center gap-2",
                activeTab === "saved"
                  ? "text-[#2b0b0b] bg-[#FFD700]"
                  : "text-[#ffe9b8]/75 hover:text-white hover:bg-[#120606]/30",
              ].join(" ")}
              onClick={() => setActiveTab("saved")}
            >
              <Star className="w-5 h-5" />
              Saved Profiles ({SavedProfilesCount})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "circle" &&
            (CollabCircleCount > 0 ? (
              collaborators.map((collaborator) => (
                <CollaboratorCard
                  key={collaborator.id}
                  collaborator={collaborator}
                />
              ))
            ) : (
              <div className="text-center p-10 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <p className="text-lg font-medium text-[#ffe9b8]/75">
                  {username
                    ? "Your Collab Circle is empty! Start a project in the Hub to build your verified network."
                    : "Please log in to view your Collab Circle."}
                </p>
              </div>
            ))}

          {activeTab === "saved" &&
            (SavedProfilesCount > 0 ? (
              savedProfiles.map((collaborator) => (
                <CollaboratorCard
                  key={collaborator.id}
                  collaborator={collaborator}
                />
              ))
            ) : (
              <div className="text-center p-10 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <p className="text-lg font-medium text-[#ffe9b8]/75">
                  You haven't saved any profiles yet. Visit the Peer Directory to
                  bookmark someone!
                </p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default CollabCirclePage;



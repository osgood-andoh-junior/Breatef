"use client";

import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  User,
  Zap,
  Clock,
  MapPin,
  Tag,
  Loader2,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// --- TYPES ---
interface Project {
  id: number;
  title: string;
  objective: string;
  project_type: string;
  needed_archetypes: string[];
  open_roles: string;
  timeline: string;
  region: string;
  coalition_tags: string[];
  created_at: string;
}

interface ProjectFormInputs {
  title: string;
  objective: string;
  timeline: string;
  needed_archetypes: string[];
  open_roles: string;
  project_type: string;
  region: string;
  coalition_tags: string[];
}

// --- STATIC OPTIONS ---
const ARCHETYPES = ["Creator", "Creative", "Innovator", "Systems Thinker"];
const PROJECT_TYPES = ["Film", "Event", "Campaign", "Product", "General Project"];
const REGIONS = ["Accra", "Lagos", "Nairobi", "Cape Town"];
const COALITIONS = [
  "Ashesi University",
  "University of Ghana",
  "KNUST",
  "Academic City",
  "Competitions (Hackathons etc.)",
  "Design Hub",
];

// --- COMPONENT: Project Card ---
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="group rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.20)] backdrop-blur-md transition hover:bg-[#120606]/32 hover:border-[#FFD700]/28 hover:-translate-y-1">
    <div className="p-6">
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-xl font-extrabold text-[#fff3d2] leading-snug">
          {project.title}
        </h3>

        <span className="inline-flex shrink-0 items-center px-3 py-1 text-xs font-semibold rounded-full text-[#2b0b0b] bg-[#FFD700] shadow shadow-[#FFD700]/20">
          <Tag className="w-3 h-3 mr-1" />
          {project.project_type}
        </span>
      </div>

      <p className="text-sm text-[#ffe9b8]/80 mb-4 line-clamp-3">
        {project.objective}
      </p>

      <div className="text-sm text-[#fff3d2]/85 mb-4 border-y border-[#FFD700]/10 py-4 space-y-3">
        <div className="flex items-start">
          <User className="w-4 h-4 mr-2 mt-0.5 text-[#FFD700]/90" />
          <p>
            <span className="font-semibold text-[#fff3d2]">Open Roles:</span>{" "}
            <span className="text-[#ffe9b8]/85">{project.open_roles}</span>
          </p>
        </div>

        <div className="flex items-start">
          <Zap className="w-4 h-4 mr-2 mt-0.5 text-[#FFD700]" />
          <p>
            <span className="font-semibold text-[#fff3d2]">
              Needed Archetypes:
            </span>{" "}
            <span className="text-[#ffe9b8]/85">
              {project.needed_archetypes.join(", ")}
            </span>
          </p>
        </div>

        <div className="pt-2 border-t border-[#FFD700]/10 space-y-2">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-[#ffe58a]" />
            <p>
              <span className="font-semibold text-[#fff3d2]">Timeline:</span>{" "}
              <span className="text-[#ffe9b8]/85">{project.timeline}</span>
            </p>
          </div>

          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-[#FFD700]/90" />
            <p>
              <span className="font-semibold text-[#fff3d2]">Region:</span>{" "}
              <span className="text-[#ffe9b8]/85">{project.region}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#FFD700] text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 transition hover:shadow-xl hover:shadow-[#FFD700]/35">
          Join Interest
        </button>

        <span className="text-xs text-[#ffe9b8]/60">
          Posted: {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  </div>
);

// --- COMPONENT: Post Project Modal ---
const PostProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: ProjectFormInputs) => void;
}> = ({ isOpen, onClose, onPost }) => {
  const [formData, setFormData] = useState<ProjectFormInputs>({
    title: "",
    objective: "",
    timeline: "",
    needed_archetypes: [],
    open_roles: "",
    project_type: "General Project",
    region: "Accra",
    coalition_tags: [],
  });

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    const { name, value, selectedOptions } = e.target;
    if (name === "needed_archetypes" || name === "coalition_tags") {
      const selected = Array.from(selectedOptions).map((o: any) => o.value);
      setFormData((prev) => ({ ...prev, [name]: selected }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onPost(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close modal backdrop"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#FFD700]/22 bg-[#120606]/35 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="p-7 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fff3d2]">
                Post a New Project
              </h2>
              <p className="mt-1 text-sm text-[#ffe9b8]/70">
                Tell people what you’re building and who you need.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-[#FFD700]/20 bg-[#120606]/35 p-2 text-[#ffe9b8]/80 hover:text-white hover:bg-[#120606]/50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Project Title"
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              required
            />

            <textarea
              name="objective"
              value={formData.objective}
              onChange={handleChange}
              placeholder="Objective"
              className="w-full min-h-[110px] rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#120606]">
                    {t}
                  </option>
                ))}
              </select>

              <input
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="Timeline (e.g., 2 weeks)"
                className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
                required
              />
            </div>

            <select
              multiple
              name="needed_archetypes"
              value={formData.needed_archetypes}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
            >
              {ARCHETYPES.map((a) => (
                <option key={a} value={a} className="bg-[#120606]">
                  {a}
                </option>
              ))}
            </select>

            <input
              name="open_roles"
              value={formData.open_roles}
              onChange={handleChange}
              placeholder="Open Roles"
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] placeholder:text-[#ffe9b8]/45 outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
              required
            />

            <select
              multiple
              name="coalition_tags"
              value={formData.coalition_tags}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#FFD700]/20 bg-[#120606]/40 px-4 py-3 text-[#fff3d2] outline-none transition focus:border-[#FFD700]/40 focus:ring-2 focus:ring-[#FFD700]/20"
            >
              {COALITIONS.map((c) => (
                <option key={c} value={c} className="bg-[#120606]">
                  {c}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#FFD700]/18 bg-[#120606]/25 text-[#ffe9b8]/85 hover:bg-[#120606]/40 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#2b0b0b] font-semibold shadow-lg shadow-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/35"
              >
                <PlusCircle className="w-5 h-5 inline mr-2" />
                Post Project
              </button>
            </div>
          </form>

          <p className="mt-4 text-xs text-[#ffe9b8]/55">
            Tip: For multi-select fields, hold Ctrl (Windows) / Cmd (Mac) to pick
            multiple.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CollabHub = () => {
  const { isLoggedIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // put fetch inside useEffect to avoid lint/exhaustive-deps build failures
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<Project[]>(`/projects/`, {
          requireAuth: isLoggedIn,
        });
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isLoggedIn]);

  const handlePostProject = async (data: ProjectFormInputs) => {
    if (!isLoggedIn) {
      alert("Please log in to create a project");
      return;
    }

    try {
      const newProject = await apiClient.post<Project>(`/projects/`, data, {
        requireAuth: true,
      });
      setProjects((prev) => [newProject, ...prev]);
    } catch (err: any) {
      console.error("❌ Failed to post project:", err?.message || err);
      alert(`Failed to create project: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <header className="mx-auto mb-8 max-w-7xl rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-4xl font-black text-[#fff3d2] flex items-center gap-2">
          💼 Collaboration Hub
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-2xl bg-[#FFD700] px-6 py-3 font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 transition hover:shadow-xl hover:shadow-[#FFD700]/35"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Post New Project
        </button>
      </header>

      <main className="mx-auto max-w-7xl">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-[#fff3d2]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-[#ffe9b8]/70 p-10 rounded-3xl border border-[#FFD700]/18 bg-[#120606]/22 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-md">
            No projects yet. Be the first to post!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      <PostProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={handlePostProject}
      />
    </div>
  );
};

export default CollabHub;



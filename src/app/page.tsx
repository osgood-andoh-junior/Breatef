"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type FeatureCardProps = {
  title: string;
  desc: string;
  delay?: number;
};

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // Spotlight + parallax state (cursor position relative to page)
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [spot, setSpot] = useState({ x: 50, y: 25 }); // %
  const [par, setPar] = useState({ x: 0, y: 0 }); // px-ish

  useEffect(() => {
    if (isLoggedIn) router.push("/discover");
  }, [isLoggedIn, router]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    // spotlight as % so it scales nicely
    const px = (x / r.width) * 100;
    const py = (y / r.height) * 100;

    setSpot({ x: px, y: py });

    // subtle parallax: center-based
    const cx = x - r.width / 2;
    const cy = y - r.height / 2;
    setPar({
      x: Math.max(-14, Math.min(14, cx / 45)),
      y: Math.max(-12, Math.min(12, cy / 55)),
    });
  };

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(520px 320px at ${spot.x}% ${spot.y}%, rgba(255,215,0,0.14), transparent 62%)`,
    }),
    [spot.x, spot.y]
  );

  return (
    <div ref={wrapRef} onMouseMove={handleMove} className="relative">
      {/* ✅ Cursor-follow spotlight (soft, temporary) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 md:opacity-100"
        style={spotlightStyle}
      />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 sm:py-24">
        {/* ✅ Subtle parallax on hero block */}
        <motion.div
          style={{ x: par.x, y: par.y }}
          transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.2 }}
          className="flex w-full flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/25 bg-[#120606]/35 px-5 py-2 text-sm text-[#fff3d2]/90 shadow-[0_0_0_1px_rgba(255,215,0,0.10),0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#FFD700]" />
            Creative Network • Verified Collaboration • Real Work
          </motion.div>

          {/* ✅ Shimmer sweep across letters + hover color shift */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="group relative text-center text-4xl font-extrabold tracking-tight text-[#fff3d2] sm:text-6xl"
          >
            <span className="relative inline-block">
              {/* gentle hover tint */}
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(500px_120px_at_50%_60%,rgba(255,215,0,0.18),transparent_65%)]" />

              {/* shimmer overlay */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
                <span className="shimmer-sweep absolute inset-0 opacity-70" />
              </span>

              <span className="relative bg-gradient-to-r from-[#FFD700] via-[#ffe58a] to-[#fff3d2] bg-clip-text text-transparent">
                Welcome to Breate
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
            className="group relative mt-6 max-w-2xl text-center text-base leading-relaxed text-[#fff3d2]/90 sm:text-xl"
          >
            {/* hover “live” tint */}
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(700px_180px_at_50%_50%,rgba(255,215,0,0.10),transparent_70%)]" />
            <span className="relative">
              Discover peers, build projects, and prove collaboration — not clout. A
              network where trust is earned through real work.
            </span>
          </motion.p>

          {/* ✅ Magnetic buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Magnetic>
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center rounded-xl bg-[#FFD700] px-8 py-3 text-base font-semibold text-[#2b0b0b] shadow-lg shadow-[#FFD700]/20 transition hover:shadow-xl hover:shadow-[#FFD700]/30"
              >
                Get Started
                <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </Magnetic>

            <Magnetic>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-[#FFD700]/30 bg-[#120606]/30 px-8 py-3 text-base font-semibold text-[#fff3d2]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/45 hover:border-[#FFD700]/45"
              >
                Log In
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        <div className="mt-14 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          <FeatureCard
            title="Peer Discovery"
            desc="Search by archetype and tier to find your next collaborator."
            delay={0.28}
          />
          <FeatureCard
            title="Collaboration Hub"
            desc="Post projects, join roles, and build with people who ship."
            delay={0.36}
          />
          <FeatureCard
            title="Collab Circle"
            desc="Verified collaboration links that prove real work history."
            delay={0.44}
          />
        </div>

        <p className="mt-10 text-center text-sm text-[#fff3d2]/70">
          built for creators who want real collaboration — not noise.
        </p>
      </main>

      {/* ✅ Keyframes for shimmer (kept inside this file so nothing else breaks) */}
      <style jsx global>{`
        .shimmer-sweep {
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 215, 0, 0.18) 35%,
            rgba(255, 243, 210, 0.35) 50%,
            rgba(255, 215, 0, 0.18) 65%,
            transparent 100%
          );
          transform: translateX(-140%);
          animation: shimmerSweep 2.8s ease-in-out infinite;
          mix-blend-mode: screen;
          filter: blur(2px);
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-140%);
            opacity: 0.0;
          }
          12% {
            opacity: 0.9;
          }
          55% {
            transform: translateX(140%);
            opacity: 0.55;
          }
          100% {
            transform: translateX(140%);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shimmer-sweep {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ title, desc, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-[#FFD700]/18 bg-[#120606]/28 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-[#120606]/40 hover:border-[#FFD700]/28"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFD700]" />
        <h3 className="text-lg font-semibold text-[#fff3d2]">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-[#fff3d2]/80">{desc}</p>
    </motion.div>
  );
}

/**
 * ✅ Magnetic wrapper (works with any child button/link)
 * - subtle attraction toward cursor
 * - resets smoothly on leave
 */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);

    // “magnet strength”
    setPos({
      x: Math.max(-10, Math.min(10, x / 10)),
      y: Math.max(-8, Math.min(8, y / 12)),
    });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.2 }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}





"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import logo from "../../public/logo.jpg";
import { usePathname } from "next/navigation";

function SidebarContent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, isLoggedIn, logout, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true);
      else setCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Profile tab: only when logged in and currentUser is loaded with a real username.
  // Never use "guest" or any placeholder. If auth not loaded yet, Profile tab is hidden.
  const tabs = [
    { name: "Home", href: "/", emoji: "🏠" },
    { name: "Collab Hub", href: "/collabhub", emoji: "💼" },
    { name: "Coalitions", href: "/coalitions", emoji: "🤝" },
    { name: "Collab Circle", href: "/collabcircle", emoji: "🌀" },
    { name: "Discover", href: "/discover", emoji: "🔍" },
    ...(isLoggedIn && currentUser?.username
      ? [{ name: "Profile", href: `/profile/${currentUser.username}`, emoji: "👤" }]
      : []),
  ];

  const isHome = pathname === "/";

  if (loading) {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#5a2a12_0%,#c08a00_55%,#ffd700_100%)]" />
        <main className="h-screen flex items-center justify-center px-6 py-8">
          <div className="text-[#fff3d2]/85">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ONE even background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#5a2a12_0%,#c08a00_55%,#ffd700_100%)]" />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen ${
          collapsed ? "w-20" : "w-64"
        } flex flex-col justify-between bg-[#550000]/75 text-[#FFD700] p-5 transition-all duration-300 ease-in-out shadow-2xl z-20 backdrop-blur-md border-r border-[#FFD700]/20`}
      >
        <div>
          <div
            className={`flex items-center justify-between ${
              collapsed ? "px-2" : "px-3"
            }`}
          >
            <Image
              src={logo}
              alt="Breate Logo"
              width={collapsed ? 40 : 60}
              height={collapsed ? 40 : 60}
              className="rounded-lg shadow-lg transition-all duration-300"
            />

            {!collapsed && (
              <h1 className="ml-2 text-xl font-bold text-[#FFD700]">Breate</h1>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[#FFD700] text-xl ml-auto"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          <nav className="mt-10 flex flex-col space-y-10 text-lg">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex items-center space-x-3 text-[#FFD700]/90 hover:text-white transition-colors"
              >
                <span className="text-2xl">{tab.emoji}</span>
                {!collapsed && <span>{tab.name}</span>}
              </Link>
            ))}

            {isLoggedIn && !collapsed && (
              <button
                onClick={logout}
                className="flex items-center space-x-3 text-[#FFD700]/90 hover:text-white transition-colors text-left"
              >
                <span className="text-2xl">🚪</span>
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>

        <div
          className={`${
            collapsed ? "px-2" : "px-3"
          } pb-2 text-xs text-[#FFD700]/60`}
        >
          {!collapsed ? "breate • build real work" : "•"}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={[
          "h-screen overflow-x-hidden px-6 py-8",
          // ✅ use margin-left, NOT padding-left
          collapsed ? "ml-20" : "ml-64",
          // Home: no scroll
          isHome ? "overflow-y-hidden" : "overflow-y-auto",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-transparent">
      <body className="h-screen overflow-hidden bg-transparent text-[#fff3d2] font-serif">
        <AuthProvider>
          <SidebarContent>{children}</SidebarContent>
        </AuthProvider>
      </body>
    </html>
  );
}



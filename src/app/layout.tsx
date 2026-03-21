"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import logo from "../../public/logo.jpg";
import { usePathname } from "next/navigation";

function SidebarContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoggedIn, logout, loading } = useAuth();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Always show Account tab
  const tabs = [
    { name: "Home", href: "/", emoji: "🏠" },
    { name: "Collab Hub", href: "/collabhub", emoji: "💼" },
    { name: "Coalitions", href: "/coalitions", emoji: "🤝" },
    { name: "Collab Circle", href: "/collabcircle", emoji: "🌀" },
    { name: "Discover", href: "/discover", emoji: "🔍" },
    { name: "Account", href: "/profile", emoji: "👤" }, // always visible
  ];

  const isHome = pathname === "/";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#120606] text-[#fff3d2]">
        Loading app...
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#5a2a12_0%,#c08a00_55%,#ffd700_100%)]" />

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 h-screen flex flex-col justify-between",
          "bg-[#550000]/75 text-[#FFD700] p-5 transition-all duration-300",
          "shadow-2xl backdrop-blur-md border-r border-[#FFD700]/20 z-20",
          collapsed ? "w-20" : "w-64",
          isMobile ? "absolute" : "",
        ].join(" ")}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between px-2">
            <Image
              src={logo}
              alt="Breate Logo"
              width={collapsed ? 40 : 60}
              height={collapsed ? 40 : 60}
              className="rounded-lg shadow-lg"
            />
            {!collapsed && <h1 className="ml-2 text-xl font-bold">Breate</h1>}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto text-xl"
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          {/* Nav */}
          <nav className="mt-10 flex flex-col space-y-6">
            {tabs.map((tab) => {
              const active = pathname === tab.href;

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition
                    ${active ? "bg-[#FFD700]/20 text-white" : "text-[#FFD700]/90 hover:text-white"}`}
                >
                  <span className="text-xl">{tab.emoji}</span>
                  {!collapsed && <span>{tab.name}</span>}
                </Link>
              );
            })}

            {/* Account Panel: username, email, password */}
            {isLoggedIn && !collapsed && (
              <div className="mt-6 pt-4 border-t border-[#FFD700]/25 space-y-4">
                <p className="text-xs uppercase text-[#FFD700]/70">Account</p>

                {/* Username */}
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Username</span>
                    <Link href="/profile/edit#account-username" className="underline">
                      Edit
                    </Link>
                  </div>
                  <p className="truncate">{currentUser?.username || ""}</p>
                </div>

                {/* Email */}
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Email</span>
                    <Link href="/profile/edit#account-email" className="underline">
                      Edit
                    </Link>
                  </div>
                  <p className="truncate">{currentUser?.email || ""}</p>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Password</span>
                    <Link href="/profile/edit#account-password" className="underline">
                      Edit
                    </Link>
                  </div>
                  <p className="truncate">••••••••</p> {/* no hash */}
                </div>
              </div>
            )}

            {/* Logout */}
            {isLoggedIn && !collapsed && (
              <button
                onClick={logout}
                className="flex items-center gap-3 mt-4 hover:text-white"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>

        <div className="text-xs text-[#FFD700]/60">{!collapsed ? "breate • build real work" : "•"}</div>
      </aside>

      {/* Main */}
      <main
        className={[
          "h-screen overflow-x-hidden px-6 py-8 transition-all",
          !isMobile && (collapsed ? "ml-20" : "ml-64"),
          isHome ? "overflow-y-hidden" : "overflow-y-auto",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

// RootLayout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-transparent text-[#fff3d2] font-serif">
        <AuthProvider>
          <SidebarContent>{children}</SidebarContent>
        </AuthProvider>
      </body>
    </html>
  );
}
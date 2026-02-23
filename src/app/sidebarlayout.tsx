"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  User,
  Briefcase,
  MessageSquare,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } flex flex-col justify-between transition-all duration-300 
        bg-[#550000]/70 backdrop-blur-md text-white shadow-xl`}
      >
        <div>
          <div className="flex items-center justify-between p-4">
            <Image
              src="/logo.jpg"
              alt="Breate Logo"
              width={collapsed ? 40 : 100}
              height={collapsed ? 40 : 100}
              className="rounded shadow-md"
              priority
            />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white focus:outline-none ml-2"
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <nav className="mt-4 space-y-4 px-4">
            <Link href="#" className="flex items-center space-x-3 hover:text-[#ffdd00] transition-colors">
              <User size={22} />
              {!collapsed && <span>Collab Circle</span>}
            </Link>
            <Link href="#" className="flex items-center space-x-3 hover:text-[#ffdd00] transition-colors">
              <Briefcase size={22} />
              {!collapsed && <span>Collab Hub</span>}
            </Link>
            <Link href="#" className="flex items-center space-x-3 hover:text-[#ffdd00] transition-colors">
              <MessageSquare size={22} />
              {!collapsed && <span>Coalitions</span>}
            </Link>
            <Link href="#" className="flex items-center space-x-3 hover:text-[#ffdd00] transition-colors">
              <Search size={22} />
              {!collapsed && <span>Discovery</span>}
            </Link>
            <Link href="#" className="flex items-center space-x-3 hover:text-[#ffdd00] transition-colors">
              <Settings size={22} />
              {!collapsed && <span>Settings</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

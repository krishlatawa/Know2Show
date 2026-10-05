"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User as UserIcon, Sparkles } from "lucide-react";

export function AppNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Hide navbar on live interview page to preserve full viewport height
  const isLiveInterview =
    pathname?.startsWith("/interview/") && pathname !== "/interview/setup";

  if (isLiveInterview) {
    return null;
  }

  // Derive user initials
  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const navLinks = [
    { label: "DASHBOARD", href: "/dashboard", active: pathname === "/dashboard" },
    {
      label: "PRACTICE",
      href: "/interview/setup",
      active: pathname === "/interview/setup",
    },
    {
      label: "SKILLS",
      href: "/onboarding",
      active: pathname === "/onboarding",
    },
    {
      label: "HISTORY",
      href: "/history",
      active: pathname === "/history",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#E2DDD3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group select-none"
        >
          {/* Minimal dark icon box with two dots */}
          <div className="w-6 h-5 rounded-[4px] bg-[#211A16] flex items-center justify-center gap-1 shrink-0 group-hover:bg-[#352B25] transition-colors">
            <span className="w-1 h-1 rounded-full bg-[#F7F5F0]" />
            <span className="w-1 h-1 rounded-full bg-[#F7F5F0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-[0.14em] text-[#211A16] leading-none">
              KNOW2SHOW
            </span>
            <span className="text-[8.5px] font-mono tracking-[0.22em] text-[#968E85] uppercase leading-tight mt-0.5">
              AI INTERVIEW
            </span>
          </div>
        </Link>

        {/* Center Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[11px] font-mono tracking-[0.18em] transition-all relative py-1 ${link.active
                  ? "text-[#211A16] font-semibold"
                  : "text-[#968E85] hover:text-[#211A16]"
                }`}
            >
              {link.label}
              {link.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#211A16] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right CTA + Profile Area */}
        <div className="flex items-center gap-3">
          {/* Start Session CTA */}
          <Link
            href="/interview/setup"
            className="inline-flex items-center justify-center bg-[#211A16] hover:bg-[#352B25] text-[#F7F5F0] text-[11px] font-mono font-medium tracking-wider uppercase px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md transition-all active:scale-[0.98]"
          >
            START SESSION
          </Link>

          {/* User Profile Avatar / Dropdown */}
          {status === "authenticated" && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#EFECE4] border border-[#E2DDD3] text-[#211A16] hover:border-[#211A16] text-[11px] font-mono font-medium flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#211A16]/20"
                aria-label="User menu"
              >
                {userInitials}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 border-b border-[#E2DDD3]">
                    <p className="text-xs font-medium text-[#211A16] truncate">
                      {session?.user?.name || "Candidate"}
                    </p>
                    <p className="text-[10px] font-mono text-[#968E85] truncate mt-0.5">
                      {session?.user?.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#211A16] hover:bg-[#EFECE4] transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#6B635B]" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/onboarding"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#211A16] hover:bg-[#EFECE4] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6B635B]" />
                    <span>Target Role & Skills</span>
                  </Link>

                  <div className="border-t border-[#E2DDD3] my-1" />

                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#9B2C2C] hover:bg-[#F9ECEC] transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-current" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#211A16] hover:bg-[#EFECE4] rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2DDD3] bg-[#F7F5F0] px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-xs font-mono tracking-wider ${link.active
                  ? "bg-[#EFECE4] text-[#211A16] font-semibold"
                  : "text-[#6B635B] hover:bg-[#EFECE4]/50 hover:text-[#211A16]"
                }`}
            >
              {link.label}
            </Link>
          ))}
          {status === "authenticated" && (
            <div className="pt-2 border-t border-[#E2DDD3]">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full text-left px-3 py-2 text-xs font-mono text-[#9B2C2C] hover:bg-[#F9ECEC] rounded-md"
              >
                SIGN OUT
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default AppNavbar;

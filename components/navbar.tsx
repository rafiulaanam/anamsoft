"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, LogIn, UserPlus, X, Folder } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";

const anchorSections = ["home", "process", "portfolio", "faq", "contact", "about"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
    );

    anchorSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const linkItems = useMemo(() => {
    const navLinks = [
      { href: "/", label: "Home", type: "route" as const },
      { href: "/services", label: "Services", type: "route" as const },
      { href: "/pricing", label: "Pricing", type: "route" as const },
      { href: "/process", label: "Process", type: "route" as const },
      { href: "/about", label: "About", type: "route" as const },
      { href: "/contact", label: "Contact", type: "route" as const },
    ];

    return navLinks.map((link) => {
      const isActiveRoute = pathname === link.href;
      if (link.type === "route") {
        return (
          <Link
            key={link.href}
            href={link.href as Route}
            className={`text-sm font-medium transition-colors ${
              isActiveRoute ? "text-blush-700" : "text-slate-700 hover:text-blush-700"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        );
      }
      return null;
    });
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-white/70 border-b border-white/60"
      }`}
    >
      <div className="section-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-blush-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
        >
          <Image
            src="/logo.svg"
            alt="Anam Soft logo"
            width={272}
            height={68}
            className="w-[17rem] max-w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6">{linkItems}</nav>
        <div className="hidden sm:flex items-center gap-3">
          {status === "authenticated" ? (
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <User className="h-4 w-4" aria-hidden />
              <span className="font-semibold">{session?.user?.name ?? session?.user?.email}</span>
              {(session?.user as any)?.role === "ADMIN" && (
                <a
                  href="/admin"
                  className="text-sm font-semibold text-blush-700 hover:text-blush-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                >
                  Admin
                </a>
              )}
              {(session?.user as any)?.role === "CLIENT" && (
                <a
                  href="/portal/projects"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                >
                  <Folder className="h-4 w-4" aria-hidden /> Portal
                </a>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
              >
                <LogIn className="h-4 w-4" aria-hidden /> Login
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-1 rounded-full bg-blush-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blush-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
              >
                <UserPlus className="h-4 w-4" aria-hidden /> Register
              </a>
            </div>
          )}
        </div>
        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="main-mobile-nav"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <div
          id="main-mobile-nav"
          className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur"
        >
          <div className="section-shell py-4 flex flex-col gap-3">
            {linkItems}
            <a
              href="/about"
              className="text-sm font-medium text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
              onClick={() => setOpen(false)}
            >
              About
            </a>
            <div className="flex flex-col gap-2 pt-2">
              {status === "authenticated" ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="h-4 w-4" aria-hidden />
                    <span className="font-semibold">
                      {session?.user?.name ?? session?.user?.email}
                    </span>
                  </div>
                  {(session?.user as any)?.role === "ADMIN" && (
                    <a
                      href="/admin"
                      className="text-sm font-semibold text-blush-700 hover:text-blush-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </a>
                  )}
                  {(session?.user as any)?.role === "CLIENT" && (
                    <a
                      href="/portal/projects"
                      className="text-sm font-semibold text-blush-700 hover:text-blush-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      My projects
                    </a>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blush-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn className="h-4 w-4" aria-hidden /> Login
                  </a>
                  <a
                    href="/register"
                    className="inline-flex items-center gap-1 rounded-full bg-blush-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blush-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 focus-visible:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden /> Register
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

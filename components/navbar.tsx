"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

const links = ["home", "services", "process", "portfolio", "about", "faq", "contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("home");
  const [open, setOpen] = useState(false);

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

    links.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const linkItems = useMemo(
    () =>
      links.map((link) => {
        const label = link.charAt(0).toUpperCase() + link.slice(1);
        const isActive = activeId === link;
        return (
          <a
            key={link}
            href={`#${link}`}
            className={`text-sm font-medium transition-colors ${
              isActive ? "text-blush-700" : "text-slate-700 hover:text-blush-700"
            }`}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        );
      }),
    [activeId]
  );

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-white/70 border-b border-white/60"
      }`}
    >
      <div className="section-shell flex h-16 items-center justify-between">
        <div className="font-display text-lg font-semibold text-blush-700">AnamSoftStudio</div>
        <nav className="hidden md:flex items-center gap-6">{linkItems}</nav>
        <div className="hidden sm:inline-flex">
          <a
            href="#contact"
            className="text-sm font-semibold text-blush-700 hover:text-blush-800 transition-colors"
          >
            Book a call →
          </a>
        </div>
        <button
          aria-label="Toggle navigation"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="section-shell py-4 flex flex-col gap-3">{linkItems}</div>
        </div>
      )}
    </header>
  );
}

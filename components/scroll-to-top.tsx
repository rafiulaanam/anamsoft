"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

// Show button once user has scrolled a modest amount.
const SHOW_AT = 80;

export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isPopNavigation = useRef(false);
  const frame = useRef<number | null>(null);

  // Track back/forward navigation so we don't force-scroll in those cases.
  useEffect(() => {
    const onPopState = () => {
      isPopNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Scroll to top on route change (skip back/forward to preserve history scroll).
  useEffect(() => {
    if (isPopNavigation.current) {
      isPopNavigation.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  // Show/hide button based on scroll position with rAF throttling.
  useEffect(() => {
    const getOffset = () => {
      if (typeof window === "undefined") return 0;
      const el = document.scrollingElement || document.documentElement || document.body;
      return el?.scrollTop ?? window.scrollY ?? 0;
    };
    const getScrollHeight = () => {
      if (typeof window === "undefined") return 0;
      const el = document.scrollingElement || document.documentElement || document.body;
      return el?.scrollHeight ?? 0;
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        setVisible(getOffset() > SHOW_AT);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once to set initial state based on current scroll/height.
    const offset = getOffset();
    const totalHeight = getScrollHeight();
    setVisible(offset > SHOW_AT || totalHeight - window.innerHeight > SHOW_AT);
    return () => {
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClick = () => {
    const el = document.scrollingElement || document.documentElement || document.body;
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const className = useMemo(
    () =>
      [
        "fixed z-50 bottom-6 right-4 sm:right-6",
        "transition-all duration-200",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none",
      ].join(" "),
    [visible]
  );

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Scroll to top"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg shadow-pink-100/70 border border-pink-100 text-pink-600 hover:text-pink-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 transition"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

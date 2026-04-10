"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-kakao-border bg-kakao-yellow">
      <nav
        className="mx-auto flex h-14 max-w-content items-center justify-between px-4"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-kakao-brown no-underline hover:no-underline"
          onClick={() => setOpen(false)}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <rect width="28" height="28" rx="8" fill="#3C1E1E" />
            <text
              x="14"
              y="20"
              textAnchor="middle"
              fill="#FEE500"
              fontSize="16"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              M
            </text>
          </svg>
          Menu Translator
        </Link>

        <div className="hidden items-center gap-8 nav:flex">
          <Link
            href="/history"
            className="flex min-h-[44px] items-center text-sm font-medium text-kakao-brown/80 no-underline hover:text-kakao-brown hover:no-underline"
          >
            History
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 min-w-[44px] items-center justify-center rounded-kakao-sm px-3 text-base font-medium text-kakao-brown nav:hidden"
          aria-expanded={open}
          aria-controls="site-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open ? (
        <div
          id="site-nav-panel"
          className="border-t border-kakao-brown/10 bg-kakao-yellow px-4 py-3 nav:hidden"
        >
          <Link
            href="/history"
            className="flex min-h-[44px] items-center text-base font-medium text-kakao-brown no-underline hover:underline"
            onClick={() => setOpen(false)}
          >
            History
          </Link>
        </div>
      ) : null}
    </header>
  );
}

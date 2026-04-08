"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-apple-bg/80 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <nav
        className="mx-auto flex h-12 max-w-content items-center justify-between px-4"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-[-0.015em] text-apple-ink no-underline hover:no-underline"
          onClick={() => setOpen(false)}
        >
          Menu Translator
        </Link>

        <div className="hidden items-center gap-10 nav:flex">
          <Link
            href="/history"
            className="flex min-h-[44px] items-center text-[12px] text-apple-ink/80 no-underline hover:text-apple-ink hover:underline"
          >
            History
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 min-w-[44px] items-center justify-center rounded-full px-3 text-[17px] text-apple-link nav:hidden"
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
          className="border-t border-black/[0.04] bg-apple-bg/95 px-4 py-3 backdrop-blur-[20px] nav:hidden"
        >
          <Link
            href="/history"
            className="flex min-h-[44px] items-center text-[17px] text-apple-ink no-underline hover:underline"
            onClick={() => setOpen(false)}
          >
            History
          </Link>
        </div>
      ) : null}
    </header>
  );
}

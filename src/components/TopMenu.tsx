"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function TopMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close the dropdown on an outside click or the Escape key.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-cream hover:bg-ink-surface hover:text-flare-bright transition wc-focus"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M1 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M1 13H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 bg-ink-surface border border-ink-border rounded-xl shadow-lg overflow-hidden py-1 z-50"
        >
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/history");
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-ink-border transition"
          >
            History of Posts
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-ember-bright hover:bg-ink-border transition"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

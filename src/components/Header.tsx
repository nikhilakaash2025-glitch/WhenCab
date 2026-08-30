"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Linkedin, X } from "lucide-react";
import { TEAM } from "@/data/team";

export default function Header() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 relative z-50">
      {/* Logo — top left */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">WhenCab</span>
      </Link>

      {/* About Us — top right */}
      <div className="relative">
        <button
          onClick={() => setShowAbout((v) => !v)}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          About Us
        </button>

        {showAbout && (
          <>
            {/* Click-outside backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowAbout(false)}
            />

            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  Made by
                </span>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ul className="space-y-3">
                {TEAM.map((person) => (
                  <li
                    key={person.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">
                      {person.name}
                    </span>
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      aria-label={`${person.name} on LinkedIn`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

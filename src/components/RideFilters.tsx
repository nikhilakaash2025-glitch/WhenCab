"use client";

import { useState } from "react";

export interface Filters {
  destination: string;
  postType: "" | "HAVE_CAB" | "NEED_CAB";
  date: string;
  timeFrom: string;
  timeTo: string;
}

export default function RideFilters({ onSearch }: { onSearch: (f: Filters) => void }) {
  const [filters, setFilters] = useState<Filters>({
    destination: "",
    postType: "",
    date: "",
    timeFrom: "",
    timeTo: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleClear() {
    const cleared: Filters = { destination: "", postType: "", date: "", timeFrom: "", timeTo: "" };
    setFilters(cleared);
    onSearch(cleared);
  }

  const inputClass =
    "w-full bg-ink border border-ink-border rounded-lg px-3 py-2 text-sm text-cream placeholder:text-smoke/50 focus:border-flare/60 outline-none transition wc-focus";

  return (
    <form onSubmit={handleSubmit} className="bg-ink-surface border border-ink-border rounded-xl p-4 space-y-3">
      <input
        type="text"
        placeholder="Search destination — e.g. Bangalore Airport"
        value={filters.destination}
        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={filters.postType}
          onChange={(e) => setFilters({ ...filters, postType: e.target.value as Filters["postType"] })}
          className={inputClass}
        >
          <option value="">All ride types</option>
          <option value="HAVE_CAB">Has a Cab</option>
          <option value="NEED_CAB">Needs a Cab</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-smoke block mb-1">From</label>
          <input
            type="time"
            value={filters.timeFrom}
            onChange={(e) => setFilters({ ...filters, timeFrom: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-smoke block mb-1">To</label>
          <input
            type="time"
            value={filters.timeTo}
            onChange={(e) => setFilters({ ...filters, timeTo: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-black text-flare-bright border border-flare/50 rounded-lg py-2 text-sm font-semibold hover:bg-flare hover:text-black hover:border-flare transition wc-focus"
        >
          Search
        </button>
        <button type="button" onClick={handleClear} className="px-4 text-sm text-smoke hover:text-cream transition">
          Clear
        </button>
      </div>
    </form>
  );
}

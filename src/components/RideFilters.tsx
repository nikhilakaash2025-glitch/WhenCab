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

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3">
      <input
        type="text"
        placeholder="Search destination — e.g. Bangalore Airport"
        value={filters.destination}
        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={filters.postType}
          onChange={(e) => setFilters({ ...filters, postType: e.target.value as Filters["postType"] })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All ride types</option>
          <option value="HAVE_CAB">Has a Cab</option>
          <option value="NEED_CAB">Needs a Cab</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input
            type="time"
            value={filters.timeFrom}
            onChange={(e) => setFilters({ ...filters, timeFrom: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input
            type="time"
            value={filters.timeTo}
            onChange={(e) => setFilters({ ...filters, timeTo: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium">
          Search
        </button>
        <button type="button" onClick={handleClear} className="px-4 text-sm text-gray-500">
          Clear
        </button>
      </div>
    </form>
  );
}

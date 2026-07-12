"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { name: string; email: string };
  reportedUser: { id: string; name: string; email: string; isSuspended: boolean };
}

interface ReportContext {
  report: Report;
  priorReports: { id: string; reason: string; status: string; createdAt: string }[];
  recentRides: {
    id: string;
    destination: string;
    travelDateTime: string;
    status: string;
    postType: string;
  }[];
}

interface SuspendedUser {
  id: string;
  name: string;
  email: string;
  suspendedAt: string;
  suspendedReason: string | null;
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "suspended">("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [context, setContext] = useState<ReportContext | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (activeTab === "suspended") loadSuspendedUsers();
  }, [activeTab]);

  async function loadReports() {
    const res = await fetch("/api/admin/reports");
    if (res.ok) setReports(await res.json());
  }

  async function loadSuspendedUsers() {
    const res = await fetch("/api/admin/users/suspended");
    if (res.ok) setSuspendedUsers(await res.json());
  }

  async function openReport(id: string) {
    setSelectedId(id);
    setActionReason("");
    const res = await fetch(`/api/admin/reports/${id}`);
    if (res.ok) setContext(await res.json());
  }

  async function handleAction(action: "actioned" | "dismissed") {
    if (!selectedId) return;
    if (
      action === "actioned" &&
      !confirm("This will suspend the user immediately and pull their active rides. Confirm?")
    ) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/admin/reports/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: actionReason }),
    });
    setLoading(false);

    if (res.ok) {
      setSelectedId(null);
      setContext(null);
      loadReports();
    } else {
      const data = await res.json();
      alert(data.error ?? "Action failed");
    }
  }

  async function handleUnsuspend(userId: string, name: string) {
    if (!confirm(`Reinstate ${name}? They will be able to log in and post rides again.`)) return;

    const res = await fetch(`/api/admin/users/${userId}/unsuspend`, { method: "POST" });
    if (res.ok) {
      loadSuspendedUsers();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to unsuspend");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm rounded-lg ${
            activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Pending Reports
        </button>
        <button
          onClick={() => setActiveTab("suspended")}
          className={`px-4 py-2 text-sm rounded-lg ${
            activeTab === "suspended" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Suspended Users
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b font-medium text-sm">
              Pending Reports ({reports.length})
            </div>
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {reports.length === 0 && <p className="text-sm text-gray-500 p-4">No pending reports.</p>}
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openReport(r.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                    selectedId === r.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium">{r.reportedUser.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-red-600">{r.reason.replace(/_/g, " ")}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 border rounded-xl p-6 bg-white">
            {!context ? (
              <p className="text-sm text-gray-500">Select a report to review.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    Report against {context.report.reportedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500">{context.report.reportedUser.email}</p>
                  {context.report.reportedUser.isSuspended && (
                    <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      Already suspended
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                  <p>
                    <span className="font-medium">Reason:</span>{" "}
                    {context.report.reason.replace(/_/g, " ")}
                  </p>
                  <p>
                    <span className="font-medium">Filed by:</span> {context.report.reporter.name} (
                    {context.report.reporter.email})
                  </p>
                  {context.report.details && (
                    <p>
                      <span className="font-medium">Details:</span> {context.report.details}
                    </p>
                  )}
                </div>

                {context.priorReports.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Prior reports against this user ({context.priorReports.length})
                    </h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      {context.priorReports.map((p) => (
                        <div key={p.id} className="flex justify-between border-b py-1">
                          <span>{p.reason.replace(/_/g, " ")}</span>
                          <span className={p.status === "ACTIONED" ? "text-red-600" : "text-gray-400"}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2">Recent ride posts</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    {context.recentRides.map((r) => (
                      <div key={r.id} className="flex justify-between border-b py-1">
                        <span>
                          {r.destination} — {r.postType.replace(/_/g, " ")}
                        </span>
                        <span>{new Date(r.travelDateTime).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {context.recentRides.length === 0 && <p className="text-gray-400">No ride posts.</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Note (shown as suspension reason if actioned)
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g. Confirmed harassment via chat logs"
                    className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("actioned")}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    Valid — Suspend User
                  </button>
                  <button
                    onClick={() => handleAction("dismissed")}
                    disabled={loading}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "suspended" && (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="bg-gray-50 px-4 py-3 border-b font-medium text-sm">
            Suspended Users ({suspendedUsers.length})
          </div>
          <div className="divide-y">
            {suspendedUsers.length === 0 && (
              <p className="text-sm text-gray-500 p-4">No suspended users.</p>
            )}
            {suspendedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Suspended {new Date(u.suspendedAt).toLocaleDateString()}
                    {u.suspendedReason && ` — ${u.suspendedReason}`}
                  </p>
                </div>
                <button
                  onClick={() => handleUnsuspend(u.id, u.name)}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium"
                >
                  Reinstate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

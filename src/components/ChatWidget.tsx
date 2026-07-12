"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@/context/ChatContext";
import { displayName } from "@/lib/displayName";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface Conversation {
  id: string;
  ride: { destination: string; travelDateTime: string; postType: string };
  userA: { id: string; name: string };
  userB: { id: string; name: string };
  messages: Message[];
}

export default function ChatWidget({ currentUserId }: { currentUserId: string }) {
  const { isOpen, activeConversationId, openConversation, closeChat, refreshSignal } = useChat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("SPAM");
  const [reportDetails, setReportDetails] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) setConversations(await res.json());
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen, refreshSignal, loadConversations]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [isOpen, loadConversations]);

  useEffect(() => {
    if (!activeConversationId || activeConversationId === "__list__") return;
    loadMessages(activeConversationId);
    const interval = setInterval(() => loadMessages(activeConversationId), 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeConversationId) return;

    const content = draft;
    setDraft("");

    const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
    }
  }

  const activeConvo = conversations.find((c) => c.id === activeConversationId);
  const otherUser = activeConvo
    ? activeConvo.userA.id === currentUserId
      ? activeConvo.userB
      : activeConvo.userA
    : null;

  async function handleBlock() {
    if (!otherUser) return;
    if (!confirm(`Block ${displayName(otherUser.name)}? You won't see their rides or messages anymore.`)) return;

    await fetch("/api/safety/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: otherUser.id }),
    });

    closeChat();
    setShowMenu(false);
    loadConversations();
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!otherUser) return;

    await fetch("/api/safety/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportedUserId: otherUser.id,
        reason: reportReason,
        details: reportDetails,
      }),
    });

    setShowReportForm(false);
    setReportDetails("");
    setShowMenu(false);
    alert("Report submitted. Thank you for flagging this.");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => {
            loadConversations();
            openConversation(activeConversationId ?? "__list__");
          }}
          className="bg-black border-2 border-flare text-flare-bright rounded-full w-14 h-14 shadow-lg shadow-flare/20 flex items-center justify-center text-xl hover:bg-flare hover:text-black transition wc-focus"
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="bg-ink-surface w-80 h-[28rem] rounded-xl shadow-xl border border-ink-border flex flex-col overflow-hidden">
          <div className="bg-black px-4 py-3 flex items-center justify-between relative border-b border-flare/30">
            {activeConversationId && activeConversationId !== "__list__" ? (
              <button
                onClick={() => openConversation("__list__")}
                className="text-sm flex items-center gap-1 text-cream hover:text-flare-bright transition"
              >
                ← {otherUser ? displayName(otherUser.name) : ""}
              </button>
            ) : (
              <span className="font-display text-sm tracking-wide text-flare-bright">Messages</span>
            )}

            <div className="flex items-center gap-2">
              {activeConversationId && activeConversationId !== "__list__" && (
                <button onClick={() => setShowMenu(!showMenu)} className="text-smoke hover:text-flare-bright text-sm transition">
                  ⋮
                </button>
              )}
              <button onClick={closeChat} className="text-smoke hover:text-flare-bright text-sm transition">
                ✕
              </button>
            </div>

            {showMenu && activeConversationId && (
              <div className="absolute top-full right-2 mt-1 bg-ink-surface border border-ink-border text-cream rounded-lg shadow-lg text-sm w-40 overflow-hidden z-10">
                <button
                  onClick={() => {
                    setShowReportForm(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-ink"
                >
                  Report user
                </button>
                <button onClick={handleBlock} className="w-full text-left px-3 py-2 hover:bg-ink text-ember-bright">
                  Block user
                </button>
              </div>
            )}
          </div>

          {showReportForm && (
            <form onSubmit={handleReport} className="border-b border-ink-border p-3 space-y-2 bg-ink">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-ink-surface border border-ink-border rounded px-2 py-1 text-sm text-cream"
              >
                <option value="SPAM">Spam</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="SCAM_OR_FRAUD">Scam or fraud</option>
                <option value="NO_SHOW">No-show</option>
                <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate behavior</option>
                <option value="OTHER">Other</option>
              </select>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)"
                maxLength={500}
                className="w-full bg-ink-surface border border-ink-border rounded px-2 py-1 text-sm text-cream h-16 resize-none placeholder:text-smoke/50"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-black border border-flare/50 text-flare-bright text-xs px-3 py-1.5 rounded hover:bg-flare hover:text-black transition">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-xs px-3 py-1.5 text-smoke hover:text-cream transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!activeConversationId || activeConversationId === "__list__") && (
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <p className="text-sm text-smoke p-4">No conversations yet. Reach out from a ride post.</p>
              )}
              {conversations.map((c) => {
                const other = c.userA.id === currentUserId ? c.userB : c.userA;
                const lastMsg = c.messages[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className="w-full text-left px-4 py-3 border-b border-ink-border hover:bg-ink"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm text-cream">{displayName(other.name)}</span>
                      <span className="text-xs text-smoke">{c.ride.destination}</span>
                    </div>
                    <p className="text-xs text-smoke truncate mt-0.5">
                      {lastMsg ? lastMsg.content : "No messages yet"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {activeConversationId && activeConversationId !== "__list__" && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {messages.map((m) => {
                  const isMine = m.sender.id === currentUserId;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm ${
                          isMine ? "bg-flare text-black font-medium" : "bg-ink text-cream border border-ink-border"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="border-t border-ink-border p-2 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={1000}
                  className="flex-1 bg-ink border border-ink-border rounded-full px-3 py-1.5 text-sm text-cream outline-none focus:border-flare/60 placeholder:text-smoke/50 transition"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="bg-black border border-flare/50 text-flare-bright rounded-full px-4 py-1.5 text-sm disabled:opacity-40 hover:bg-flare hover:text-black transition"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

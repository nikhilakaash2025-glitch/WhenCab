"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextValue {
  isOpen: boolean;
  activeConversationId: string | null;
  openConversation: (conversationId: string) => void;
  closeChat: () => void;
  refreshSignal: number;
  triggerRefresh: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeConversationId,
        openConversation: (id) => {
          setActiveConversationId(id);
          setIsOpen(true);
        },
        closeChat: () => setIsOpen(false),
        refreshSignal,
        triggerRefresh: () => setRefreshSignal((n) => n + 1),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

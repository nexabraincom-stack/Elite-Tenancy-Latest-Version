/**
 * Elite Tenancy — Real-time Chat Context
 *
 * Manages a single WebSocket connection per session.
 * Exposes:
 *  - conversations list
 *  - messages per conversation
 *  - sendMessage(conversationId, content)
 *  - markRead(conversationId)
 *  - unreadCount (total across all conversations)
 *  - connect / disconnect lifecycle
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationOther {
  id: number;
  name: string;
  role: string;
}

export interface ConversationListing {
  id: number;
  title: string;
  city: string;
}

export interface Conversation {
  id: number;
  other: ConversationOther;
  listing: ConversationListing | null;
  lastMessage: { content: string; senderId: number; createdAt: string } | null;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface ChatContextValue {
  conversations: Conversation[];
  messages: Record<number, ChatMessage[]>; // keyed by conversationId
  unreadCount: number;
  connected: boolean;
  activeConversation: number | null;
  setActiveConversation: (id: number | null) => void;
  sendMessage: (conversationId: number, content: string) => void;
  markRead: (conversationId: number) => void;
  startConversation: (otherUserId: number, listingId?: number) => Promise<number>;
  loadMessages: (conversationId: number) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const WS_BASE = API_BASE.replace(/^http/, "ws");

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [connected, setConnected] = useState(false);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);

  // Derived unread count
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // ── Fetch conversations from REST ─────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const data = await apiFetch<Conversation[]>("/api/messages/conversations");
      setConversations(data);
    } catch {
      // Silently fail — not critical
    }
  }, [isSignedIn]);

  // ── Load messages for a specific conversation ─────────────────────────────
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const data = await apiFetch<ChatMessage[]>(
        `/api/messages/conversations/${conversationId}`,
      );
      setMessages((prev) => ({ ...prev, [conversationId]: data }));
      // Update conversation unread count to 0
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch {
      // ignore
    }
  }, []);

  // ── Start or find a conversation ──────────────────────────────────────────
  const startConversation = useCallback(
    async (otherUserId: number, listingId?: number): Promise<number> => {
      const conv = await apiFetch<{ id: number }>("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ otherUserId, listingId }),
      });
      await refreshConversations();
      return conv.id;
    },
    [refreshConversations],
  );

  // ── WebSocket send ────────────────────────────────────────────────────────
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "send", conversationId, content }));
    } else {
      // REST fallback
      apiFetch(`/api/messages/conversations/${conversationId}/send`, {
        method: "POST",
        body: JSON.stringify({ content }),
      })
        .then(() => loadMessages(conversationId))
        .catch(() => {});
    }
  }, [loadMessages]);

  // ── WebSocket mark-read ───────────────────────────────────────────────────
  const markRead = useCallback((conversationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "read", conversationId }));
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  // ── WebSocket connection lifecycle ────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!isSignedIn) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const { token } = await apiFetch<{ token: string }>("/api/messages/ws-token");
      const ws = new WebSocket(`${WS_BASE}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.onmessage = (event) => {
        let frame: { type: string; message?: ChatMessage; conversationId?: number; byUserId?: number };
        try {
          frame = JSON.parse(event.data);
        } catch {
          return;
        }

        if (frame.type === "message" && frame.message) {
          const msg = frame.message;
          // Append to messages map
          setMessages((prev) => ({
            ...prev,
            [msg.conversationId]: [...(prev[msg.conversationId] ?? []), msg],
          }));
          // Update conversation last message + unread count
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== msg.conversationId) return c;
              const isActive = activeConversation === msg.conversationId;
              return {
                ...c,
                lastMessage: { content: msg.content, senderId: msg.senderId, createdAt: msg.createdAt },
                lastMessageAt: msg.createdAt,
                unreadCount: isActive ? 0 : c.unreadCount + 1,
              };
            }),
          );
          // If active conversation, mark read immediately
          if (activeConversation === msg.conversationId) {
            markRead(msg.conversationId);
          }
        }

        if (frame.type === "read_ack" && frame.conversationId) {
          setConversations((prev) =>
            prev.map((c) => (c.id === frame.conversationId ? { ...c, unreadCount: 0 } : c)),
          );
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          if (isSignedIn) connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Failed to get token — retry after 5s
      reconnectTimeout.current = setTimeout(() => {
        if (isSignedIn) connect();
      }, 5000);
    }
  }, [isSignedIn, activeConversation, markRead]);

  // Boot: connect when user is signed in
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      connect();
      refreshConversations();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [isLoaded, isSignedIn]);

  // Re-fetch conversations periodically as a fallback
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(refreshConversations, 30_000);
    return () => clearInterval(interval);
  }, [isSignedIn, refreshConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        connected,
        activeConversation,
        setActiveConversation,
        sendMessage,
        markRead,
        startConversation,
        loadMessages,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

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
import { useUser, useAuth } from "@clerk/react";

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

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const WS_BASE = API_BASE.replace(/^http/, "ws");

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to avoid stale closures in WS event handlers / timeouts
  const isSignedInRef = useRef(false);
  const connectRef = useRef<(() => Promise<void>) | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [connected, setConnected] = useState(false);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);

  // Keep isSignedInRef current on every render
  useEffect(() => {
    isSignedInRef.current = isSignedIn ?? false;
  }, [isSignedIn]);

  // Derived unread count
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // ── Authenticated fetch — sends Clerk JWT so cross-subdomain API calls work ─
  const authFetch = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();
      const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
      return res.json() as Promise<T>;
    },
    [getToken],
  );

  // ── Fetch conversations from REST ─────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    if (!isSignedInRef.current) return;
    try {
      const data = await authFetch<Conversation[]>("/api/messages/conversations");
      setConversations(data);
    } catch {
      // Silently fail — not critical
    }
  }, [authFetch]);

  // ── Load messages for a specific conversation ─────────────────────────────
  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        const data = await authFetch<ChatMessage[]>(
          `/api/messages/conversations/${conversationId}`,
        );
        setMessages((prev) => ({ ...prev, [conversationId]: data }));
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
        );
      } catch {
        // ignore
      }
    },
    [authFetch],
  );

  // ── Start or find a conversation ──────────────────────────────────────────
  const startConversation = useCallback(
    async (otherUserId: number, listingId?: number): Promise<number> => {
      const conv = await authFetch<{ id: number }>("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ otherUserId, listingId }),
      });
      await refreshConversations();
      return conv.id;
    },
    [authFetch, refreshConversations],
  );

  // ── WebSocket send ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (conversationId: number, content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "send", conversationId, content }));
      } else {
        // REST fallback
        authFetch(`/api/messages/conversations/${conversationId}/send`, {
          method: "POST",
          body: JSON.stringify({ content }),
        })
          .then(() => loadMessages(conversationId))
          .catch(() => {});
      }
    },
    [authFetch, loadMessages],
  );

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
    if (!isSignedInRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const { token } = await authFetch<{ token: string }>("/api/messages/ws-token");
      const ws = new WebSocket(`${WS_BASE}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.onmessage = (event) => {
        let frame: {
          type: string;
          message?: ChatMessage;
          conversationId?: number;
          byUserId?: number;
        };
        try {
          frame = JSON.parse(event.data);
        } catch {
          return;
        }

        if (frame.type === "message" && frame.message) {
          const msg = frame.message;
          setMessages((prev) => ({
            ...prev,
            [msg.conversationId]: [...(prev[msg.conversationId] ?? []), msg],
          }));
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== msg.conversationId) return c;
              const isActive = activeConversation === msg.conversationId;
              return {
                ...c,
                lastMessage: {
                  content: msg.content,
                  senderId: msg.senderId,
                  createdAt: msg.createdAt,
                },
                lastMessageAt: msg.createdAt,
                unreadCount: isActive ? 0 : c.unreadCount + 1,
              };
            }),
          );
          if (activeConversation === msg.conversationId) {
            markRead(msg.conversationId);
          }
        }

        if (frame.type === "read_ack" && frame.conversationId) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === frame.conversationId ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Use ref — not closure — to check current sign-in state before retry
        reconnectTimeout.current = setTimeout(() => {
          if (isSignedInRef.current && connectRef.current) connectRef.current();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Use ref to avoid retrying after sign-out
      reconnectTimeout.current = setTimeout(() => {
        if (isSignedInRef.current && connectRef.current) connectRef.current();
      }, 5000);
    }
  }, [authFetch, activeConversation, markRead]);

  // Keep connectRef pointing to the latest connect function
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Boot: connect when user is signed in; tear down on sign-out
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      connect();
      refreshConversations();
    } else {
      // Signed out — kill connection and stop reconnect loop
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect trigger on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
      setConversations([]);
      setMessages({});
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [isLoaded, isSignedIn]);

  // Re-fetch conversations every 30s as fallback
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

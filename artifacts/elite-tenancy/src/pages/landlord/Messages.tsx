import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Wifi, WifiOff, ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LandlordLayout from "@/components/LandlordLayout";
import { useChatContext, type Conversation, type ChatMessage } from "@/contexts/ChatContext";

function ConversationItem({
  conv,
  active,
  myId,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  myId: number | undefined;
  onClick: () => void;
}) {
  const lastContent = conv.lastMessage?.content ?? "No messages yet";
  const truncated = lastContent.length > 55 ? lastContent.slice(0, 55) + "…" : lastContent;
  const sentByMe = conv.lastMessage?.senderId === myId;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border/40 hover:bg-muted/40 transition-colors ${
        active ? "bg-primary/8 border-l-2 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-foreground truncate max-w-[70%]">
          {conv.other.name}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {new Date(conv.lastMessageAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
      {conv.listing && (
        <p className="text-[10px] text-primary mb-1 truncate">
          Re: {conv.listing.title}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground truncate flex-1">
          {sentByMe && <span className="text-muted-foreground/60">You: </span>}
          {truncated}
        </p>
        {conv.unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center shrink-0">
            {conv.unreadCount}
          </Badge>
        )}
      </div>
    </button>
  );
}

function MessageBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border/50 text-foreground rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isMe ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
          }`}
        >
          {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isMe && msg.readAt && <span className="ml-1">✓✓</span>}
        </p>
      </div>
    </div>
  );
}

export default function LandlordMessages() {
  const {
    conversations,
    messages,
    connected,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markRead,
    loadMessages,
  } = useChatContext();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation).then(() => markRead(activeConversation));
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversation]);

  const activeConv = conversations.find((c) => c.id === activeConversation);
  const activeMessages = activeConversation ? (messages[activeConversation] ?? []) : [];

  const otherId = activeConv?.other.id;
  const myId = activeMessages.find((m) => m.senderId !== otherId)?.senderId;

  function handleSend() {
    if (!activeConversation || !input.trim() || sending) return;
    setSending(true);
    sendMessage(activeConversation, input.trim());
    setInput("");
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showMobileBack = activeConversation !== null;
  const totalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);

  return (
    <LandlordLayout>
      <div className="flex h-[calc(100vh-120px)] bg-card border border-border/50 rounded-xl overflow-hidden">
        {/* ── Conversation list ─────────────────── */}
        <div
          className={`${
            showMobileBack ? "hidden md:flex" : "flex"
          } flex-col w-full md:w-72 lg:w-80 border-r border-border/50 shrink-0`}
        >
          <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-foreground">Messages</h1>
              {totalUnread > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {connected ? (
                <span className="flex items-center gap-1 text-[10px] text-green-400">
                  <Wifi size={11} /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <WifiOff size={11} /> Offline
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle size={32} className="text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Tenant enquiries and messages appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={activeConversation === conv.id}
                  myId={myId}
                  onClick={() => setActiveConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Message thread ────────────────────── */}
        <div
          className={`${
            showMobileBack ? "flex" : "hidden md:flex"
          } flex-1 flex-col min-w-0`}
        >
          {activeConv ? (
            <>
              <div className="px-4 py-3.5 border-b border-border/50 flex items-center gap-3">
                <button
                  className="md:hidden text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {activeConv.other.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {activeConv.other.name}
                  </p>
                  {activeConv.listing && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {activeConv.listing.title} · {activeConv.listing.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {activeMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Start the conversation.</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === myId} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-border/50 flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message your tenant… (Enter to send)"
                  rows={1}
                  className="flex-1 resize-none bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 max-h-32 leading-relaxed"
                  style={{ minHeight: "42px" }}
                />
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 h-10 w-10 p-0"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                >
                  <Send size={15} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle size={48} className="text-muted-foreground/30 mb-4" />
              <h2 className="font-semibold text-foreground mb-2">Tenant Messages</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                All tenant enquiries, viewing requests, and messages in one place.
                {conversations.length > 0
                  ? " Select a conversation to reply."
                  : " Conversations will appear here when tenants message you."}
              </p>
            </div>
          )}
        </div>
      </div>
    </LandlordLayout>
  );
}

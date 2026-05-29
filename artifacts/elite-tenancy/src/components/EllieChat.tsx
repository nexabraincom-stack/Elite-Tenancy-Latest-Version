import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Home, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "ellie";
  content: string;
}

const STARTERS = [
  "Find me a room in Manchester",
  "What are your fees for landlords?",
  "Do you accept Universal Credit tenants?",
  "How much can I rent my flat for?",
];

const GREETING =
  "Hi, I'm **Ellie** — your Elite Tenancy letting assistant 🏡 I can help you find a home, explain how we work, answer pricing questions, or guide landlords through listing a property. What can I help you with today?";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/** Escape HTML, then apply safe bold/italic/link/newline substitutions. */
function renderContent(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Linkify internal paths like /listings, /valuation, /find-my-match
    .replace(
      /(^|[\s(])(\/[a-z][a-z0-9/-]*)/g,
      '$1<a href="$2" class="text-primary underline underline-offset-2 hover:opacity-80">$2</a>',
    )
    // Linkify phone number
    .replace(
      /\+44\s?7446\s?192577/g,
      '<a href="tel:+447446192577" class="text-primary underline underline-offset-2">+44 7446 192577</a>',
    )
    .replace(/\n/g, "<br/>");
}

export default function EllieChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ellie", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId] = useState<string>(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/ellie/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });
      const data = await res.json();
      const reply =
        data.reply ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages([...newMessages, { role: "ellie", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "ellie",
          content:
            "Sorry, something went wrong. Please try again in a moment, or call us on **+44 7446 192577** 🏡",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([{ role: "ellie", content: GREETING }]);
    setInput("");
  }

  return (
    <>
      {/* Toggle button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="bg-card border border-primary/30 rounded-xl px-3 py-2 shadow-lg text-xs text-muted-foreground flex items-center gap-2"
            >
              <Home size={11} className="text-primary" />
              Chat with Ellie
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close chat" : "Open chat with Ellie"}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center relative"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 bg-gradient-to-r from-card to-card/80 shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Home size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Ellie</p>
                <p className="text-xs text-muted-foreground">
                  Elite Tenancy Letting Assistant
                </p>
              </div>
              <button
                onClick={resetConversation}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ellie" && (
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Home size={11} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-foreground rounded-bl-sm"
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                  />
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    <Home size={11} className="text-primary" />
                  </div>
                  <div className="bg-muted/60 rounded-xl rounded-bl-sm px-3 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Starter prompts */}
              {messages.length === 1 && !loading && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs px-2.5 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors leading-snug border border-border/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border/50 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Ellie anything…"
                  className="flex-1 bg-background text-foreground text-xs rounded-lg px-3 py-2.5 border border-border/40 outline-none focus:border-primary/50 placeholder:text-muted-foreground/60 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">
                Ellie · Elite Tenancy AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

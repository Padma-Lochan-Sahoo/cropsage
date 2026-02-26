import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

// ─── Markdown-lite renderer ──────────────────────────────────────────────────
function FormattedMessage({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="relative my-3 rounded-xl overflow-hidden border border-slate-600/50">
          {lang && (
            <div className="flex items-center justify-between bg-slate-700/80 px-4 py-1.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{lang}</span>
              <CopyButton text={codeLines.join("\n")} />
            </div>
          )}
          <pre className="bg-slate-900/80 px-4 py-3 overflow-x-auto text-xs text-slate-200 font-mono leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Heading H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-emerald-300 mt-4 mb-1 tracking-wide">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Heading H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-emerald-200 mt-4 mb-2 border-b border-slate-700 pb-1">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Heading H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+] /)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        listItems.push(
          <li key={i} className="flex gap-2 items-start">
            <span className="text-emerald-400 mt-0.5 shrink-0">▸</span>
            <span className="text-slate-200">{parseInline(lines[i].slice(2))}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 text-sm">
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const listItems = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(
          <li key={i} className="flex gap-2.5 items-start">
            <span className="text-emerald-400 font-mono text-xs mt-0.5 shrink-0 w-5 text-right">{num}.</span>
            <span className="text-slate-200">{parseInline(lines[i].replace(/^\d+\. /, ""))}</span>
          </li>
        );
        i++;
        num++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 text-sm">
          {listItems}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-emerald-500/60 pl-3 py-0.5 my-2 text-slate-400 italic text-sm">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-3 border-slate-700" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed text-slate-100">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function parseInline(text) {
  // Bold, italic, inline code
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|`(.+?)`|\*(.+?)\*|_(.+?)_)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={match.index} className="font-semibold text-white">{match[2]}</strong>);
    else if (match[3]) parts.push(<strong key={match.index} className="font-semibold text-white">{match[3]}</strong>);
    else if (match[4]) parts.push(<code key={match.index} className="bg-slate-700/80 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">{match[4]}</code>);
    else if (match[5]) parts.push(<em key={match.index} className="italic text-slate-300">{match[5]}</em>);
    else if (match[6]) parts.push(<em key={match.index} className="italic text-slate-300">{match[6]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-slate-400 hover:text-emerald-300 transition-colors px-2 py-0.5 rounded border border-slate-600/50 hover:border-emerald-500/50"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-800 border border-slate-700 px-4 py-3">
        <span className="text-xs text-slate-500 mr-1">Thinking</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-70"
            style={{
              animation: "bounce 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageActions({ content }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-1.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={copy}
        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
      >
        {copied ? (
          <>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

const isOtherTopicReply = (text) => text?.trim() === "I am not trained in this topic.";

// ─── Main Component ───────────────────────────────────────────────────────────
function ChatPage() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const authHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingConversations(true);
      const res = await axios.get(`${API_BASE_URL}/api/chat/conversations`, {
        headers: authHeaders(),
      });
      setConversations(res.data?.conversations || []);
    } catch (err) {
      if (err?.response?.status === 401) setError("Please sign in again.");
      else setError("Failed to load chats.");
    } finally {
      setLoadingConversations(false);
    }
  }, [token, authHeaders]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!token || !conversationId) { setMessages([]); return; }
    try {
      setLoadingMessages(true);
      setError(null);
      const res = await axios.get(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        { headers: authHeaders() }
      );
      setMessages(res.data?.messages || []);
    } catch (err) {
      if (err?.response?.status === 401) setError("Please sign in again.");
      else setError("Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (activeId) fetchMessages(activeId);
    else setMessages([]);
  }, [activeId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/chat/conversations/${id}`, {
        headers: authHeaders(),
      });
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch (err) {
      if (err?.response?.status === 401) setError("Please sign in again.");
      else setError("Could not delete chat.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !token) return;
    const prompt = input.trim();
    setInput("");
    setError(null);

    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { prompt, conversationId: activeId || undefined },
        { headers: { ...authHeaders(), "Content-Type": "application/json" } }
      );

      const responseText = res.data?.response ?? "";
      const assistantMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: responseText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const newConversationId = res.data?.conversationId;
      if (newConversationId && !activeId) {
        setActiveId(newConversationId);
        setConversations((prev) => [
          {
            _id: newConversationId,
            title: prompt.slice(0, 50) + (prompt.length > 50 ? "…" : ""),
            updatedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        await fetchConversations();
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      if (err?.response?.status === 401) setError("Please sign in again.");
      else setError("Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestedPrompts = [
    "🌾 Best crops for monsoon season?",
    "💧 How often to irrigate tomatoes?",
    "🪲 Identify leaf rust disease",
    "🌱 Improve clay soil fertility",
  ];

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-animate { animation: fadeSlideIn 0.25s ease-out; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">

        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-60" : "w-0"} shrink-0 border-r border-slate-800/80 bg-slate-900/60 flex flex-col transition-all duration-300 overflow-hidden`}
        >
          <div className="px-3 pt-3 pb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 hover:border-emerald-500/70 hover:bg-emerald-950/30 hover:text-emerald-300 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </div>

          <div className="px-2 pb-1">
            <p className="px-2 py-1 text-xs font-semibold text-slate-600 uppercase tracking-widest">
              History
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin space-y-0.5">
            {loadingConversations && (
              <div className="px-3 py-2 flex gap-2 items-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500/40 animate-pulse" />
                <span className="text-xs text-slate-500">Loading…</span>
              </div>
            )}
            {conversations.map((c) => (
              <div
                key={c._id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveId(c._id)}
                onKeyDown={(e) => e.key === "Enter" && setActiveId(c._id)}
                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-sm cursor-pointer transition-all duration-150 ${
                  activeId === c._id
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                }`}
              >
                <svg className="h-3.5 w-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="min-w-0 flex-1 truncate text-xs">{c.title || "New chat"}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(e, c._id)}
                  className="shrink-0 rounded p-0.5 text-slate-600 opacity-0 hover:bg-slate-700 hover:text-rose-400 group-hover:opacity-100 focus:opacity-100 transition-all"
                  aria-label="Delete chat"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base">🌱</span>
              <span className="text-sm font-semibold text-slate-200">Crop Assistant</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-medium">
                AI
              </span>
            </div>
            {activeId && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500">Active session</span>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin" />
                  <span className="text-sm">Loading messages…</span>
                </div>
              </div>
            ) : messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-900/40 p-6 mb-6 shadow-lg shadow-emerald-950/20">
                  <span className="text-4xl">🌿</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Crop Assistant</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
                  Ask about crops, irrigation, soil health, plant diseases, and sustainable farming practices.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setInput(p.replace(/^[^\s]+\s/, ""))}
                      className="text-left text-xs rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:border-emerald-700/50 hover:bg-emerald-950/20 transition-all duration-200"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`msg-animate flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
                  >
                    {msg.role === "assistant" && (
                      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-xs mr-2.5 mt-0.5 shadow-md shadow-emerald-950/40">
                        🌿
                      </div>
                    )}

                    <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex-1"}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-md text-sm leading-relaxed shadow-md shadow-emerald-950/40"
                            : isOtherTopicReply(msg.content)
                            ? "bg-amber-500/10 text-amber-200 border border-amber-500/30 rounded-bl-md"
                            : "bg-slate-800/70 border border-slate-700/80 rounded-bl-md shadow-sm"
                        }`}
                      >
                        {msg.role === "assistant" && !isOtherTopicReply(msg.content) ? (
                          <FormattedMessage content={msg.content} />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>

                      <div className={`flex items-center gap-3 mt-1 px-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs text-slate-600">{formatTime(msg.createdAt)}</span>
                        {msg.role === "assistant" && (
                          <MessageActions content={msg.content} />
                        )}
                      </div>
                    </div>

                    {msg.role === "user" && (
                      <div className="shrink-0 h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-xs ml-2.5 mt-0.5">
                        👤
                      </div>
                    )}
                  </div>
                ))}

                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-sm px-4 py-3">
            {error && (
              <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 rounded-lg bg-rose-950/40 border border-rose-800/50 px-3 py-2">
                <svg className="h-3.5 w-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-rose-400 flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-300 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 items-end rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 focus-within:border-emerald-600/60 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all duration-200 shadow-lg shadow-slate-950/40">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about crops, soil, irrigation…"
                  className="flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:opacity-50 min-h-[2rem] max-h-40"
                  disabled={!token || loading}
                  style={{ overflow: "hidden" }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!token || loading || !input.trim()}
                  className="shrink-0 rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md hover:shadow-emerald-700/30 active:scale-95"
                  aria-label="Send message"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-slate-700 mt-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ChatPage;
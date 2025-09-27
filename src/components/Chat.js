"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function handleSend(e) {
    e.preventDefault();
    if (!canSend) return;
    const userMsg = { role: "user", content: input.trim(), at: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.message, at: Date.now() }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-140px)] flex-col gap-4">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto rounded-md border border-white/10 p-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-neutral-400">Ask me anything.</div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] whitespace-pre-line rounded p-2 ${
                m.role === "assistant" ? "bg-white/10 text-left" : "bg-zinc-500 text-right text-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-base text-neutral-300">Thinking…</div>}
        {error && <div className="text-center text-sm text-red-400">{error}</div>}
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <input
          className="flex-1 rounded-md bg-white/10 px-4 py-3 text-base outline-none placeholder:text-neutral-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={!canSend}
          className="rounded-md bg-white/10 px-5 py-3 text-base hover:bg-white/20 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
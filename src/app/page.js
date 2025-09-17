"use client";

import Chat from "../components/Chat";

export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 p-6">
        <h1 className="text-2xl font-semibold">AI Chatbot</h1>
      </header>
      <main className="flex-1 p-6">
        <Chat />
      </main>
      <footer className="border-t border-white/10 p-4 text-center text-xs text-neutral-500">Local-only. Uses Gemini</footer>
    </div>
  );
}
export const metadata = {
  title: "Crypto AI Chatbot",
  description: "Local-only Gemini + Santiment chatbot",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}



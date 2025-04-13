import type React from "react";
import "./globals.css";

export const metadata = {
  generator: "v0.dev",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html>
        <head />
        <body>
            <div className="flex h-screen bg-zinc-900 text-zinc-100">
              {/* Main Content */}
              <div className="flex-1 flex flex-col bg-zinc-700">{children}</div>
            </div>
        </body>
      </html>
    </>
  );
}

import "./globals.css";

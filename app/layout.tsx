import type React from "react";
import "./globals.css";

export const metadata = {
  alternates: { canonical: "https://discordbot.uncoverit.org" },
  title: {
    default: "Discord Bot Client",
    template: "Discord Bot Client",
  },
  description: "A service that allows you to login as a Discord Bot",
  keywords: [
    "Discord",
    "Discord bot",
    "Discord client",
    "Discord API",
    "Discord.js",
    "Discord bot client",
    "Discord bot dashboard",
    "Discord bot hosting",
    "Discord bot management",
    "Discord bot development",
    "discordbotclient",
    "online discord bot client",
    "discord bot client online",
    "discord bot client website",
    "Uncover it",
  ],
  openGraph: {
    title: "Discord Bot Client",
    description: "A service that allows you to login as a Discord Bot",
    url: "https://discordbot.uncoverit.org",
    siteName: "Discord Bot Client",
    images: [
      {
        url: "https://i.postimg.cc/kgHNBdJf/output-onlinepngtools.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Discord Bot Client",
    card: "summary_large_image",
    description: "A service that allows you to login as a Discord Bot",
    images: ["https://i.postimg.cc/kgHNBdJf/output-onlinepngtools.png"],
  },
  icons: { shortcut: "/favicon.ico" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html>
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

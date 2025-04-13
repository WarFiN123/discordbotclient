import { NextResponse } from "next/server";
import { getActiveClient } from "@/lib/discord-client";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Bot token is required" },
        { status: 400 },
      );
    }

    const client = await getActiveClient(token);

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 });
    }

    // Get all guilds (servers) the bot is in
    const guilds = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name || "Unknown Server", // Fallback if name is undefined
      icon: guild.iconURL() || null,
      memberCount: guild.memberCount,
    }));

    return NextResponse.json({ servers: guilds });
  } catch (error) {
    console.error("Error fetching servers:", error);
    return NextResponse.json(
      { error: "Failed to fetch servers" },
      { status: 500 },
    );
  }
}

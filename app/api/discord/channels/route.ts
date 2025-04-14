import { NextResponse } from "next/server";
import { getActiveClient } from "@/lib/discord-client";

export async function POST(req: Request) {
  try {
    const { token, serverId } = await req.json();

    if (!token || !serverId) {
      return NextResponse.json(
        {
          error: "Bot token and server ID are required",
        },
        { status: 400 },
      );
    }

    const client = await getActiveClient(token);

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 });
    }

    // Get the guild
    const guild = client.guilds.get(serverId);

    if (!guild) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Fetch all channels
    const channels = guild.channels.map((channel) => {
      let type = "unknown";

      if (channel.type === 0) {
        type = "text";
      } else if (channel.type === 2) {
        type = "voice";
      } else if (channel.type === 4) {
        type = "category";
      } else if (channel.type === 5) {
        type = "announcement";
      } else if (channel.type === 13) {
        type = "stage";
      } else if (channel.type === 15) {
        type = "forum";
      }

      return {
        id: channel.id,
        name: channel.name,
        type,
        parentId: channel.parentID,
      };
    });

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 },
    );
  }
}

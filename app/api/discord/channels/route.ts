import { NextResponse } from "next/server";
import { ChannelType } from "discord.js";
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
    const guild = client.guilds.cache.get(serverId);

    if (!guild) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Fetch all channels
    await guild.channels.fetch();

    // Map channels to a simpler format
    const channels = guild.channels.cache.map((channel) => {
      let type = "unknown";

      if (channel.type === ChannelType.GuildText) {
        type = "text";
      } else if (channel.type === ChannelType.GuildVoice) {
        type = "voice";
      } else if (channel.type === ChannelType.GuildCategory) {
        type = "category";
      } else if (channel.type === ChannelType.GuildAnnouncement) {
        type = "announcement";
      } else if (channel.type === ChannelType.GuildStageVoice) {
        type = "stage";
      } else if (channel.type === ChannelType.GuildForum) {
        type = "forum";
      }

      return {
        id: channel.id,
        name: channel.name,
        type,
        parentId: channel.parentId,
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

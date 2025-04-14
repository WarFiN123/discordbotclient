import { NextResponse } from "next/server";
import { getActiveClient } from "@/lib/discord-client";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { token, channelId, limit = 50 } = await req.json();

    if (!token || !channelId) {
      return NextResponse.json(
        {
          error: "Bot token and channel ID are required",
        },
        { status: 400 },
      );
    }

    const client = await getActiveClient(token);

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 });
    }

    // Get the channel
    const channel = client.getChannel(channelId);

    if (!channel || channel.type !== 0) {
      return NextResponse.json(
        { error: "Text channel not found" },
        { status: 404 },
      );
    }

    // Fetch messages
    const messages = await channel.getMessages({ limit });

    // Format messages
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.avatarURL,
        bot: msg.author.bot,
      },
      timestamp: new Date(msg.timestamp).toISOString(),
      attachments: msg.attachments.map((a) => ({
        id: a.id,
        url: a.url,
        name: a.filename,
        contentType: a.content_type,
      })),
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

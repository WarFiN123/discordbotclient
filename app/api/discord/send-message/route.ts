import { NextResponse } from "next/server";
import { getActiveClient } from "@/lib/discord-client";

export async function POST(req: Request) {
  try {
    const { token, channelId, content } = await req.json();

    if (!token || !channelId || !content) {
      return NextResponse.json(
        {
          error: "Bot token, channel ID, and message content are required",
        },
        { status: 400 },
      );
    }

    const client = await getActiveClient(token);

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 });
    }

    // Get the channel
    const channel = await client.channels.fetch(channelId);

    // Ensure the channel is a type that supports the 'send' method
    if (!channel || !channel.isTextBased() || !("send" in channel)) {
      return NextResponse.json(
        { error: "Text channel not found or unsupported" },
        { status: 404 },
      );
    }

    // Send the message
    const message = await channel.send(content);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        author: {
          id: client.user?.id || "unknown",
          username: client.user?.username || "Unknown Bot",
          avatar: client.user?.displayAvatarURL?.() || "/placeholder-user.jpg",
          bot: true,
        },
        timestamp: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

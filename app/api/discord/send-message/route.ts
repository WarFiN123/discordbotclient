import { NextResponse } from "next/server";
import { getActiveClient } from "@/lib/discord-client";

export const runtime = 'edge';

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
    const channel = client.getChannel(channelId);

    // Ensure the channel is a type that supports the 'createMessage' method
    if (!channel || channel.type !== 0) {
      return NextResponse.json(
        { error: "Text channel not found or unsupported" },
        { status: 404 },
      );
    }

    // Send the message
    const message = await channel.createMessage(content);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        author: {
          id: client.user.id,
          username: client.user.username,
          avatar: client.user.avatarURL,
          bot: true,
        },
        timestamp: new Date(message.timestamp).toISOString(),
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

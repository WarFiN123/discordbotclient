import { NextResponse } from "next/server"
import { getActiveClient } from "@/lib/discord-client"

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { token, channelId, limit = 50 } = await req.json()

    if (!token || !channelId) {
      return NextResponse.json(
        {
          error: "Bot token and channel ID are required",
        },
        { status: 400 },
      )
    }

    const client = await getActiveClient(token)

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 })
    }

    // Get the channel
    const channel = await client.channels.fetch(channelId)

    if (!channel || !channel.isTextBased()) {
      return NextResponse.json({ error: "Text channel not found" }, { status: 404 })
    }

    // Fetch messages
    const messages = await channel.messages.fetch({ limit })

    // Format messages
    const formattedMessages = Array.from(messages.values()).map((msg) => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.displayAvatarURL(),
        bot: msg.author.bot,
      },
      timestamp: msg.createdAt.toISOString(),
      attachments: msg.attachments.map((a) => ({
        id: a.id,
        url: a.url,
        name: a.name,
        contentType: a.contentType,
      })),
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

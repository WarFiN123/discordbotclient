import { NextResponse } from "next/server"
import { getActiveClient, removeActiveClient } from "@/lib/discord-client"

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Bot token is required" }, { status: 400 })
    }

    const client = await getActiveClient(token)

    if (!client) {
      return NextResponse.json({ error: "Bot not connected" }, { status: 404 })
    }

    // Disconnect the client
    client.destroy()

    // Remove from active connections
    removeActiveClient(token)

    return NextResponse.json({
      success: true,
      message: "Bot disconnected successfully",
    })
  } catch (error) {
    console.error("Error disconnecting bot:", error)
    return NextResponse.json({ error: "Failed to disconnect bot" }, { status: 500 })
  }
}

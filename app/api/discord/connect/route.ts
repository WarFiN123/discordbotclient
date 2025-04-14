import { NextResponse } from "next/server";
import { Client } from "eris";

// Store active bot connections (in a real app, you'd use a more persistent solution)
const activeConnections = new Map();

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Bot token is required" },
        { status: 400 },
      );
    }

    // Check if we already have an active connection for this token
    if (activeConnections.has(token)) {
      return NextResponse.json({
        success: true,
        message: "Bot already connected",
      });
    }

    // Create a new Eris client
    const client = new Client(token, {
      intents: ["guilds", "guildMessages", "messageContent", "guildMembers"],
    });

    // Connect to Discord
    try {
      await client.connect();

      // Store the client instance
      activeConnections.set(token, client);

      return NextResponse.json({
        success: true,
        message: "Bot connected successfully",
      });
    } catch (error) {
      console.error("Failed to connect bot:", error);
      return NextResponse.json(
        {
          error: "Invalid bot token or connection failed",
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Error in connect route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

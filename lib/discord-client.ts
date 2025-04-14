import { Client } from "eris";

// Store active bot connections
const activeConnections = new Map<string, Client>();

/**
 * Get an active Discord client by token
 */
export async function getActiveClient(token: string): Promise<Client | null> {
  // Check if we already have an active connection
  if (activeConnections.has(token)) {
    return activeConnections.get(token) || null;
  }

  // If not, create a new client and connect
  try {
    const client = new Client(token, {
      intents: ["guilds", "guildMessages", "messageContent", "guildMembers"], // Removed voice-related intents
    });

    await client.connect();
    activeConnections.set(token, client);
    return client;
  } catch (error) {
    console.error("Failed to connect Discord client:", error);
    return null;
  }
}

/**
 * Remove an active client
 */
export function removeActiveClient(token: string): boolean {
  if (activeConnections.has(token)) {
    const client = activeConnections.get(token);
    if (client) {
      client.disconnect({ reconnect: false });
    }
    activeConnections.delete(token);
    return true;
  }
  return false;
}

/**
 * Get all active clients
 */
export function getAllActiveClients(): Map<string, Client> {
  return activeConnections;
}

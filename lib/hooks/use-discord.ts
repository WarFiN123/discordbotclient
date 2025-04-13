"use client";

import { useState } from "react";

export interface Server {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "category" | "unknown" | "announcement";
  parentId: string | null;
}

export interface MessageAuthor {
  id: string;
  username: string;
  avatar: string;
  bot: boolean;
}

export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  contentType: string | null;
}

export interface Message {
  id: string;
  content: string;
  author: MessageAuthor;
  timestamp: string;
  attachments: MessageAttachment[];
}

export function useDiscord() {
  const [token, setToken] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Connect to Discord with bot token
  const connect = async (botToken: string) => {
    if (!botToken) return;

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/discord/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      setToken(botToken);
      setIsConnected(true);

      // Fetch servers after successful connection
      await fetchServers(botToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect bot
  const disconnect = async () => {
    if (!token) return;

    try {
      await fetch("/api/discord/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      setIsConnected(false);
      setToken("");
      setServers([]);
      setSelectedServer(null);
      setChannels([]);
      setSelectedChannel(null);
      setMessages([]);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  // Fetch servers the bot is in
  const fetchServers = async (botToken: string = token) => {
    if (!botToken) return;

    try {
      const response = await fetch("/api/discord/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch servers");
      }

      // Ensure server names are not empty or default to 'Unknown Server'
      const updatedServers = (data.servers || []).map((server: Server) => ({
        ...server,
        name: server.name || "Unknown Server",
      }));

      setServers(updatedServers);
    } catch (err) {
      console.error("Error fetching servers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch servers");
    }
  };

  // Fetch channels for a server
  const fetchChannels = async (serverId: string) => {
    if (!token || !serverId) return;

    try {
      const response = await fetch("/api/discord/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, serverId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channels");
      }

      // Filter out channels that cannot be read
      const readableChannels = (data.channels || []).filter(
        (channel: Channel) => channel.type !== "unknown",
      );

      setChannels(readableChannels);
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channels");
    }
  };

  // Fetch messages for a channel
  const fetchMessages = async (channelId: string) => {
    if (!token || !channelId) return;

    setIsLoadingMessages(true);

    try {
      const response = await fetch("/api/discord/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, channelId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("This channel is private");
        }
        throw new Error(data.error || "Failed to fetch messages");
      }

      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Fetch new messages for a channel
  const fetchNewMessages = async (channelId: string, lastMessageId: string) => {
    if (!token || !channelId) return;

    try {
      const response = await fetch("/api/discord/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, channelId, after: lastMessageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("This channel is private");
        }
        throw new Error(data.error || "Failed to fetch new messages");
      }

      // Filter out duplicate messages
      setMessages((prevMessages) => {
        const existingMessageIds = new Set(prevMessages.map((msg) => msg.id));
        const newMessages = data.messages.filter(
          (msg: Message) => !existingMessageIds.has(msg.id),
        );
        return [...prevMessages, ...newMessages];
      });
    } catch (err) {
      console.error("Error fetching new messages:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch new messages",
      );
    }
  };

  // Send a message to a channel
  const sendMessage = async (content: string) => {
    if (!token || !selectedChannel || !content) return;

    setIsSendingMessage(true);

    try {
      const response = await fetch("/api/discord/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          channelId: selectedChannel.id,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Append the new message to the existing list
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.message.id,
          content: data.message.content,
          author: data.message.author,
          timestamp: data.message.timestamp,
          attachments: data.message.attachments || [],
        },
      ]);

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Select a server and fetch its channels
  const selectServer = async (server: Server) => {
    setSelectedServer(server);
    setSelectedChannel(null);
    setMessages([]);
    await fetchChannels(server.id);
  };

  // Select a channel and fetch its messages
  const selectChannel = async (channel: Channel) => {
    setSelectedChannel(channel);
    setError(null); // Clear any existing error when selecting a new channel
    await fetchMessages(channel.id);
  };

  return {
    token,
    isConnected,
    isConnecting,
    error,
    servers,
    selectedServer,
    channels,
    selectedChannel,
    messages,
    isLoadingMessages,
    isSendingMessage,
    connect,
    disconnect,
    fetchServers,
    fetchChannels,
    fetchMessages,
    fetchNewMessages,
    sendMessage,
    selectServer,
    selectChannel,
    setSelectedChannel, // Add this to expose the setter function
  };
}

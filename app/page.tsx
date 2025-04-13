"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Hash,
  Users,
  AtSign,
  Bell,
  HelpCircle,
  PlusCircle,
  Gift,
  Smile,
  Paperclip,
  Send,
  Megaphone,
  Volume2
} from "lucide-react"
import { useDiscord, type Channel } from "@/lib/hooks/use-discord"
import { formatDistanceToNow } from "date-fns"
import Image from 'next/image';

export default function ChatInterface() {
  const {
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
    selectServer,
    selectChannel,
    sendMessage,
    fetchNewMessages,
    setSelectedChannel, // Add this to destructure the setter function
  } = useDiscord()

  const [botToken, setBotToken] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom when messages are updated
  }, [messages]); // Ensure this runs when the messages array changes

  // Periodically fetch messages for the selected channel
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChannel && messages.length > 0) {
        const lastMessageId = messages[messages.length - 1].id;
        fetchNewMessages(selectedChannel.id, lastMessageId);
      }
    }, 1000); // Fetch new messages every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [selectedChannel, messages, fetchNewMessages]);

  // Handle connect button click
  const handleConnect = () => {
    if (botToken.trim()) {
      connect(botToken.trim())
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChannel) {
      const success = await sendMessage(messageInput)
      if (success) {
        setMessageInput("")
      }
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return timestamp
    }
  }

  // Group channels by category
  const groupedChannels = channels.reduce((acc, channel) => {
    if (channel.type === "category") {
      acc[channel.id] = {
        ...channel,
        children: [],
      };
    }
    return acc;
  }, {} as Record<string, Channel & { children: Channel[] }>);

  channels.forEach((channel) => {
    if (channel.type !== "category" && channel.parentId) {
      if (groupedChannels[channel.parentId]) {
        groupedChannels[channel.parentId].children.push(channel);
      }
    }
  });

  // Maintain the order as it appears in Discord
  const sortedCategories = Object.values(groupedChannels);

  // Include all uncategorized channels
  const uncategorizedChannels = channels.filter(
    (channel) => channel.type !== "category" && !channel.parentId
  );

  // Login screen
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-800">
        <div className="w-full max-w-md p-6 bg-zinc-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-center mb-6 text-white">Connect to Discord Bot</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-white text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Bot Token</label>
              <Input
                type="password"
                placeholder="Enter your bot token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="mt-1 text-xs text-zinc-400">Your token is stored locally and never sent to our servers</p>
            </div>
            <Button
              onClick={handleConnect}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isConnecting || !botToken.trim()}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Chat interface with sidebars
  return (
    <div className="flex h-full">
      {/* Server List Sidebar */}
      <div className="w-[72px] bg-zinc-950 flex flex-col items-center py-3 gap-3">
        {servers.map((server) => (
          <div
            key={server.id}
            onClick={() => selectServer(server)}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all ${
              selectedServer?.id === server.id ? "bg-indigo-600" : "bg-zinc-800 hover:bg-indigo-500"
            }`}
          >
            {server.icon ? (
              <Image
                src={server.icon || "/placeholder.svg"}
                alt={server.name}
                className="h-12 w-12 rounded-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              server.name.substring(0, 2).toUpperCase()
            )}
          </div>
        ))}
      </div>

      {/* Channel List Sidebar */}
      <div className="w-60 bg-zinc-800 flex flex-col">
        <div className="h-12 border-b border-zinc-900 px-4 flex items-center">
          <h2 className="font-semibold text-white">{selectedServer?.name || "Select a Server"}</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {sortedCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                <h3 className="text-sm font-semibold uppercase text-zinc-400 mb-2">{category.name}</h3>
                <div className="space-y-1 pl-2">
                  {category.children.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => selectChannel(channel)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                          selectedChannel?.id === channel.id ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        {channel.type === "text" && <Hash className="h-5 w-5" />}
                        {channel.type === "voice" && <Volume2 className="h-5 w-5" />}
                        {channel.type === "announcement" && <Megaphone className="h-5 w-5" />}
                        <span>{channel.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {uncategorizedChannels.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold uppercase text-zinc-400 mb-2">Channels</h3>
                <div className="space-y-1 pl-2">
                  {uncategorizedChannels
                    .filter((channel) => channel.type === "text")
                    .map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => selectChannel(channel)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                          selectedChannel?.id === channel.id ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        <Hash className="h-5 w-5" />
                        <span>{channel.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-700">
        {/* Channel Header */}
        <header className="h-12 border-b border-zinc-900 px-4 flex items-center justify-between bg-zinc-800">
          <div className="flex items-center">
            <Hash className="h-5 w-5 text-zinc-400 mr-2" />
            <h2 className="font-semibold text-white">{selectedChannel?.name || "Select a Channel"}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedChannel(null)} className="text-zinc-400 hover:text-white">
              Back to Channels
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <AtSign className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error === "This channel is private" ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-red-900/50 border border-red-700 rounded text-white text-center">
                <h2 className="text-lg font-bold">Private Channel</h2>
                <p>You do not have access to view this channel.</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">No messages in this channel</div>
          ) : (
            <div className="space-y-4">
              {messages
                .slice() // Create a shallow copy to avoid mutating the original array
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by timestamp
                .map((message) => (
                  <div key={message.id} className="flex gap-3">
                    {message.author.avatar ? (
                      <Image
                        src={message.author.avatar || "/placeholder.svg"}
                        alt={message.author.username}
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                        {message.author.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {message.author.username}
                          {message.author.bot && (
                            <span className="ml-1 text-xs bg-indigo-600 text-white px-1 rounded">BOT</span>
                          )}
                        </span>
                        <span className="text-xs text-zinc-400">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      <p className="text-zinc-200 whitespace-pre-wrap">{message.content}</p>

                      {/* Render attachments if any */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="inline-block">
                              {attachment.contentType?.startsWith("image/") ? (
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <Image
                                    src={attachment.url || "/placeholder.svg"}
                                    alt={attachment.name}
                                    className="max-w-xs max-h-60 rounded-md"
                                    width={240}
                                    height={240}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-zinc-800 rounded-md text-zinc-200 hover:bg-zinc-700"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  <span>{attachment.name}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-zinc-800">
          <div className="flex items-center gap-2 bg-zinc-700 rounded-lg p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Textarea
              placeholder={`Message #${selectedChannel?.name || ""}`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[44px] max-h-32 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white resize-none flex-1"
              disabled={isSendingMessage}
            />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                <Gift className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                disabled={isSendingMessage || !messageInput.trim()}
              >
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatRoomProps {
  room: string;
}

export default function ChatRoom({ room }: ChatRoomProps) {
  const { user } = useAuth();
  const { sendMessage, subscribe } = useWebSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages for the current room
  const { data: initialMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", room],
    enabled: !!room,
  });

  // Reset messages when room changes
  useEffect(() => {
    console.log(`Switching to room: ${room}`);
    if (initialMessages) {
      console.log(`Loading ${initialMessages.length} messages for room ${room}`);
      setMessages(initialMessages);
    } else {
      setMessages([]); // Clear messages while loading new room
    }
  }, [initialMessages, room]);

  useEffect(() => {
    console.log(`Setting up WebSocket subscription for room: ${room}`);
    const unsubscribe = subscribe((data) => {
      if (data.type === "chat" && data.payload.room === room) {
        console.log(`Received message for room ${room}:`, data.payload);
        setMessages((prev) => [...prev, data.payload]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [subscribe, room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !user) return;

    console.log(`Sending message to room ${room}`);
    sendMessage("chat", {
      room,
      content: message.trim(),
      userId: user.id,
      username: user.username,
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to participate in chat.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        <h2 className="text-lg font-semibold capitalize">#{room}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.userId === user?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {msg.username
                    ? msg.username.slice(0, 2).toUpperCase()
                    : "UN"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.userId === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">{msg.username}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-4 p-4 border-t">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message #${room}`}
          className="flex-1"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
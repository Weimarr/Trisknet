import { useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";

export function useWebSocket() {
  const { toast } = useToast();
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<{ type: string; payload: any }[]>([]);

  const connect = useCallback(() => {
    if (!user) {
      console.log("No user authenticated, skipping WebSocket connection");
      return null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      console.log("Attempting WebSocket connection...");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
        }

        // Send any queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          if (msg) {
            ws.send(JSON.stringify(msg));
          }
        }

        toast({
          title: "Connected",
          description: "Successfully connected to chat server",
        });
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server. Retrying...",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log("WebSocket closed. Reconnecting...");
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      return ws;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      return null;
    }
  }, [toast, user]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    const message = { type, payload };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message to be sent when connection is established
      messageQueueRef.current.push(message);
      toast({
        title: "Connection Error",
        description: "Reconnecting to chat server...",
        variant: "destructive",
      });
      connect();
    }
  }, [toast, connect, user]);

  const subscribe = useCallback((callback: (data: any) => void) => {
    if (!wsRef.current) return;

    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    wsRef.current.addEventListener('message', messageHandler);

    return () => {
      wsRef.current?.removeEventListener('message', messageHandler);
    };
  }, []);

  return { sendMessage, subscribe };
}
import { useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";

export function useWebSocket() {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
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
  }, [toast]);

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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      toast({
        title: "Connection Error",
        description: "Cannot send message. Please try again in a moment.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
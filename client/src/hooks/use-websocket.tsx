import { useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";

export function useWebSocket() {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      toast({
        title: "Connected",
        description: "Successfully connected to chat server",
      });
    };

    ws.onerror = (error) => {
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const subscribe = useCallback((callback: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
    }
  }, []);

  return { sendMessage, subscribe };
}

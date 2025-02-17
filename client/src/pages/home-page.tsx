import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import TradePanel from "@/components/trade-panel";
import ChatRoom from "@/components/chat-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HomePage() {
  const [activeRoom, setActiveRoom] = useState("general");

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trading</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradePanel />
                </CardContent>
              </Card>

              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  <ChatRoom room={activeRoom} />
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
import { useParams } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import TradePanel from "@/components/trade-panel";
import ChatRoom from "@/components/chat-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function TradeRoom() {
  const { symbol } = useParams();
  const { user } = useAuth();

  return (
    <AppLayout showChannels symbol={symbol}>
      <div className="flex-1 flex">
        <div className="flex-1">
          <ScrollArea className="h-full p-4">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading {symbol}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradePanel symbol={symbol} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ChatRoom room={`${symbol?.toLowerCase()}-general`} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Members Sidebar */}
        <div className="w-60 bg-background/95 backdrop-blur border-l py-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase">Online — 1</h3>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-3 rounded-none h-11"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground">Trading</span>
            </div>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
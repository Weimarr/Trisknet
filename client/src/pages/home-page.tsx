import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import TradePanel from "@/components/trade-panel";
import ChatRoom from "@/components/chat-room";
import Leaderboard from "@/components/leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [activeRoom, setActiveRoom] = useState("general");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Social Trading</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Balance:</span>{" "}
              <span className="font-medium">${parseFloat(user.balance).toFixed(2)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Level:</span>{" "}
              <span className="font-medium">{user.level}</span>
            </div>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <TradePanel />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeRoom} onValueChange={setActiveRoom}>
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  <TabsTrigger value="stocks">Stocks</TabsTrigger>
                </TabsList>
                <TabsContent value={activeRoom}>
                  <ScrollArea className="h-[400px]">
                    <ChatRoom room={activeRoom} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
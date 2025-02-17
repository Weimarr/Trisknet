import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center px-4">
          <h1 className="font-semibold">Profile Settings</h1>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-screen-xl mx-auto">
            <Tabs defaultValue="account">
              <TabsList className="mb-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="trading">Trading</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={user.username} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <div className="text-2xl font-bold">{user.level}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.experience} XP
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Reputation</Label>
                        <div className="text-2xl font-bold">{user.reputation}</div>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => logoutMutation.mutate()}
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trading Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        ${parseFloat(user.balance).toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This is your current trading balance. Use it wisely!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trading">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Confirm trades</Label>
                        <div className="text-sm text-muted-foreground">
                          Show confirmation dialog before executing trades
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Price alerts</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications for price movements
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Trade notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications for executed trades
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Chat notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications for new messages
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Achievement notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications for new achievements
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Market updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications for market news
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}

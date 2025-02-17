import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const DEMO_DATA = [
  { time: "9:30", value: 100 },
  { time: "10:00", value: 105 },
  { time: "10:30", value: 102 },
  { time: "11:00", value: 108 },
  { time: "11:30", value: 106 },
  { time: "12:00", value: 110 },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center px-4">
          <h1 className="font-semibold">Dashboard</h1>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-screen-xl mx-auto space-y-6">
            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-3xl font-bold">
                    ${parseFloat(user?.balance || "0").toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +$5.23 (0.47%) Today
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DEMO_DATA}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[
                      { symbol: "AAPL", name: "Apple Inc.", price: 180.5, change: 2.5 },
                      { symbol: "NVDA", name: "NVIDIA Corporation", price: 721.2, change: 15.2 },
                      { symbol: "TSLA", name: "Tesla, Inc.", price: 193.5, change: -1.2 },
                    ].map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${stock.price.toFixed(2)}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              stock.change > 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {stock.change > 0 ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Crypto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[
                      { symbol: "BTC", name: "Bitcoin", price: 52145.32, change: 1.2 },
                      { symbol: "ETH", name: "Ethereum", price: 2821.45, change: -0.5 },
                      { symbol: "SOL", name: "Solana", price: 108.92, change: 3.2 },
                    ].map((crypto) => (
                      <div key={crypto.symbol} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {crypto.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${crypto.price.toFixed(2)}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              crypto.change > 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {crypto.change > 0 ? "+" : ""}
                            {crypto.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
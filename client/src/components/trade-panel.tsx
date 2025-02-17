import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trade } from "@shared/schema";

interface TradePanelProps {
  symbol?: string;
}

const MOCK_PRICES = {
  "AAPL": 180.5,
  "GOOGL": 140.2,
  "TSLA": 250.8,
  "BTC": 42000,
  "ETH": 2200,
  "NVDA": 721.2,
};

export default function TradePanel({ symbol = "AAPL" }: TradePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState("");

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades", user?.id],
    enabled: !!user,
  });

  const tradeMutation = useMutation({
    mutationFn: async (data: { symbol: string; quantity: number; price: number; type: string }) => {
      const res = await apiRequest("POST", "/api/trades", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades", user?.id] });
      toast({
        title: "Trade Executed",
        description: "Your trade has been successfully executed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeTrade = (type: "buy" | "sell") => {
    const price = MOCK_PRICES[symbol as keyof typeof MOCK_PRICES];
    const qty = parseFloat(quantity);

    if (!price || isNaN(qty)) {
      toast({
        title: "Invalid Trade",
        description: "Please enter valid quantity",
        variant: "destructive",
      });
      return;
    }

    tradeMutation.mutate({
      symbol,
      quantity: qty,
      price,
      type,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => executeTrade("buy")}
          disabled={tradeMutation.isPending}
        >
          Buy
        </Button>
        <Button
          className="flex-1"
          variant="destructive"
          onClick={() => executeTrade("sell")}
          disabled={tradeMutation.isPending}
        >
          Sell
        </Button>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Recent Trades</h3>
        <div className="space-y-2">
          {trades?.slice(-5).reverse().map((trade) => (
            <div
              key={trade.id}
              className={`p-2 rounded-md border ${
                trade.type === "buy" ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
              }`}
            >
              <div className="flex justify-between text-sm">
                <span>{trade.symbol}</span>
                <span>
                  {trade.type === "buy" ? "+" : "-"}
                  {trade.quantity} @ ${trade.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
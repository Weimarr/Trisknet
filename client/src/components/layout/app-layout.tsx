import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash,
  Volume2,
  Settings,
  Search,
  Home,
  TrendingUp,
  ChevronDown,
  UserCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  showChannels?: boolean;
  symbol?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: "stock" | "crypto";
}

const DEMO_SEARCH_RESULTS: SearchResult[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "stock" },
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
];

const DEMO_CHANNELS = [
  { id: "general", name: "general", type: "text" },
  { id: "analysis", name: "analysis", type: "text" },
  { id: "news", name: "news", type: "text" },
  { id: "voice-chat", name: "Voice Chat", type: "voice" },
];

export default function AppLayout({ children, showChannels = false, symbol }: AppLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannel, setActiveChannel] = useState("general");

  if (!user) return null;

  const filteredResults = searchQuery
    ? DEMO_SEARCH_RESULTS.filter(
        result =>
          result.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <div className="w-[72px] bg-zinc-900 flex flex-col items-center py-3 gap-2">
        <Button
          className="h-12 w-12 rounded-[24px] bg-zinc-700 hover:bg-primary hover:rounded-[16px] transition-all"
          variant="ghost"
          onClick={() => {
            setIsSearching(false);
            setLocation("/");
          }}
        >
          <Home className="h-5 w-5" />
        </Button>
        <div className="w-8 h-[2px] bg-zinc-800 my-2 rounded-full" />
        <Button
          className={cn(
            "h-12 w-12 rounded-[24px] bg-zinc-700 hover:bg-primary hover:rounded-[16px] transition-all",
            isSearching && "bg-primary rounded-[16px]"
          )}
          variant="ghost"
          onClick={() => setIsSearching(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          className="h-12 w-12 rounded-[24px] bg-zinc-700 hover:bg-primary hover:rounded-[16px] transition-all"
          variant="ghost"
          onClick={() => setLocation("/profile")}
        >
          <UserCircle2 className="h-5 w-5" />
        </Button>
      </div>

      {isSearching ? (
        // Search Panel
        <div className="w-60 bg-zinc-800 flex flex-col">
          <div className="p-3">
            <Input
              placeholder="Search stocks, crypto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/50"
            />
          </div>
          <ScrollArea className="flex-1">
            {filteredResults.map((result) => (
              <Button
                key={result.symbol}
                variant="ghost"
                className="w-full justify-start gap-2 px-3 h-12"
                onClick={() => {
                  setLocation(`/room/${result.symbol}`);
                  setIsSearching(false);
                  setSearchQuery("");
                }}
              >
                <TrendingUp className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{result.symbol}</span>
                  <span className="text-xs text-zinc-400">{result.name}</span>
                </div>
              </Button>
            ))}
          </ScrollArea>
        </div>
      ) : null}

      {/* Channel Sidebar - Only shown for stock/crypto rooms */}
      {showChannels && (
        <div className="w-60 bg-zinc-800 flex flex-col">
          <div className="h-12 px-4 flex items-center justify-between shadow-sm">
            <h2 className="font-semibold">{symbol}</h2>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="mt-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase">Text Channels</span>
              </div>
              {DEMO_CHANNELS.filter(c => c.type === "text").map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 px-2 rounded-sm h-8",
                    channel.id === activeChannel && "bg-zinc-700/50"
                  )}
                  onClick={() => setActiveChannel(channel.id)}
                >
                  <Hash className="h-4 w-4" />
                  {channel.name}
                </Button>
              ))}

              <div className="flex items-center justify-between px-2 mb-1 mt-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase">Voice Channels</span>
              </div>
              {DEMO_CHANNELS.filter(c => c.type === "voice").map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2 rounded-sm h-8"
                >
                  <Volume2 className="h-4 w-4" />
                  {channel.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b flex items-center px-4 gap-4 bg-background/95 backdrop-blur">
          <div className="ml-auto flex items-center gap-4">
          </div>
        </div>
        <div className="flex-1 flex">
          {children}
        </div>
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  if (!users) return null;

  const sortedUsers = [...users].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="space-y-4">
      {sortedUsers.map((user, index) => (
        <Card
          key={user.id}
          className="p-4 flex items-center gap-4"
        >
          {index < 3 && (
            <Trophy
              className={`h-5 w-5 ${
                index === 0
                  ? "text-yellow-500"
                  : index === 1
                  ? "text-gray-400"
                  : "text-amber-600"
              }`}
            />
          )}
          <div className="flex-1">
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-muted-foreground">
              Level {user.level} • {user.reputation} points
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">${user.balance.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Balance</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

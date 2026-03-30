import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { MessageCircle, MapPin } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Profile {
  _id: Id<"profiles">;
  userId: Id<"users">;
  name: string;
  skillLevel: number;
  bio?: string;
  location: string;
  playStyle: "aggressive" | "defensive" | "all-court";
  availability: string[];
  lookingFor: "casual" | "competitive" | "practice" | "any";
  imageUrl?: string;
  createdAt: number;
}

interface Match {
  _id: Id<"matches">;
  user1Id: Id<"users">;
  user2Id: Id<"users">;
  createdAt: number;
  lastMessageAt?: number;
  otherProfile: Profile | null;
}

interface MatchesScreenProps {
  onOpenChat: (matchId: Id<"matches">) => void;
}

export function MatchesScreen({ onOpenChat }: MatchesScreenProps) {
  const matches = useQuery(api.matches.list);

  if (matches === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a3a5c]/50 flex items-center justify-center mb-6">
          <MessageCircle className="text-gray-500" size={36} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">No matches yet</h3>
        <p className="text-gray-400 max-w-xs text-sm md:text-base">
          Keep swiping to find your tennis partners. When someone likes you back, they&apos;ll appear here!
        </p>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Your Matches</h2>

        <div className="space-y-3">
          {matches.map((match: Match, index: number) => (
            <motion.button
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onOpenChat(match._id)}
              className="w-full bg-[#0f1f38] rounded-2xl p-4 border border-[#1a3a5c] hover:border-[#00ff88]/30 hover:bg-[#1a3a5c]/20 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0f1f38] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl md:text-3xl">🎾</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base md:text-lg font-semibold text-white truncate">
                      {match.otherProfile?.name || "Player"}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(match.lastMessageAt || match.createdAt)}
                    </span>
                  </div>

                  {match.otherProfile && (
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {match.otherProfile.location}
                      </span>
                      <span className="bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded-full text-xs font-medium">
                        {match.otherProfile.skillLevel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Chat indicator */}
                <div className="w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-[#00ff88]" size={18} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

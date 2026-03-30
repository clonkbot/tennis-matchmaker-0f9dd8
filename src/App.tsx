import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ProfileSetup } from "./components/ProfileSetup";
import { SwipeScreen } from "./components/SwipeScreen";
import { MatchesScreen } from "./components/MatchesScreen";
import { ChatScreen } from "./components/ChatScreen";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageCircle, User, LogOut } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

type Screen = "swipe" | "matches" | "profile" | "chat";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const [screen, setScreen] = useState<Screen>("swipe");
  const [activeChatMatchId, setActiveChatMatchId] = useState<Id<"matches"> | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Profile loading state
  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  const openChat = (matchId: Id<"matches">) => {
    setActiveChatMatchId(matchId);
    setScreen("chat");
  };

  const closeChat = () => {
    setActiveChatMatchId(null);
    setScreen("matches");
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <header className="bg-[#0f1f38]/80 backdrop-blur-md border-b border-[#1a3a5c] px-4 md:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center">
              <span className="text-[#0a1628] font-bold text-sm md:text-lg">🎾</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Tennis<span className="text-[#00ff88]">Match</span>
            </h1>
          </motion.div>
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-400 hover:text-[#00ff88] transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === "swipe" && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-full"
            >
              <SwipeScreen />
            </motion.div>
          )}
          {screen === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-full"
            >
              <MatchesScreen onOpenChat={openChat} />
            </motion.div>
          )}
          {screen === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-full"
            >
              <ProfileSetup existingProfile={profile} />
            </motion.div>
          )}
          {screen === "chat" && activeChatMatchId && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-full"
            >
              <ChatScreen matchId={activeChatMatchId} onBack={closeChat} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Credit */}
      <div className="text-center py-2 text-xs text-gray-600 bg-[#0a1628]">
        Requested by @web-user · Built by @clonkbot
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#0f1f38]/90 backdrop-blur-md border-t border-[#1a3a5c] px-6 py-3 sticky bottom-0 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { id: "swipe", icon: Home, label: "Discover" },
            { id: "matches", icon: MessageCircle, label: "Matches" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                screen === item.id
                  ? "text-[#00ff88] bg-[#00ff88]/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

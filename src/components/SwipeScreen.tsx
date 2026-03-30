import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Target, Zap, X, Heart, RefreshCw } from "lucide-react";

export function SwipeScreen() {
  const potentialMatches = useQuery(api.profiles.getPotentialMatches);
  const swipe = useMutation(api.swipes.swipe);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatchName, setLastMatchName] = useState("");

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  if (potentialMatches === undefined) {
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

  const currentProfile = potentialMatches[currentIndex];

  const handleSwipe = async (action: "like" | "pass") => {
    if (!currentProfile) return;

    try {
      const result = await swipe({
        swipedId: currentProfile.userId,
        action,
      });

      if (result.matched) {
        setLastMatchName(currentProfile.name);
        setShowMatch(true);
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Swipe failed:", error);
    }
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      handleSwipe("like");
    } else if (info.offset.x < -100) {
      handleSwipe("pass");
    }
  };

  const skillLevelLabel = (level: number) => {
    if (level <= 2) return "Beginner";
    if (level <= 3) return "Intermediate";
    if (level <= 4) return "Advanced";
    if (level <= 5) return "Tournament";
    return "Expert";
  };

  const playStyleEmoji = (style: string) => {
    switch (style) {
      case "aggressive":
        return "⚡";
      case "defensive":
        return "🛡️";
      case "all-court":
        return "🎯";
      default:
        return "🎾";
    }
  };

  if (!currentProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a3a5c]/50 flex items-center justify-center mb-6">
          <RefreshCw className="text-gray-500" size={36} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">No more players nearby</h3>
        <p className="text-gray-400 max-w-xs text-sm md:text-base">
          We&apos;ve shown you all players matching your skill level. Check back later for new players!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 md:py-6 relative">
      {/* Match Celebration Modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a1628]/95 z-50 flex items-center justify-center p-6"
            onClick={() => setShowMatch(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
                className="text-7xl md:text-8xl mb-6"
              >
                🎾
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#00ff88] mb-4">It&apos;s a Match!</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-2">
                You and <span className="text-white font-semibold">{lastMatchName}</span>
              </p>
              <p className="text-gray-400 mb-8">both want to play together</p>
              <button
                onClick={() => setShowMatch(false)}
                className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a1628] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00ff88]/25 transition-all min-h-[48px]"
              >
                Keep Swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="relative w-full max-w-[340px] md:max-w-sm h-[420px] md:h-[500px]">
        {/* Background card */}
        {potentialMatches[currentIndex + 1] && (
          <div className="absolute inset-0 scale-[0.95] opacity-50">
            <div className="w-full h-full bg-[#0f1f38] rounded-3xl border border-[#1a3a5c]" />
          </div>
        )}

        {/* Main card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate, opacity }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-full h-full bg-gradient-to-b from-[#0f1f38] to-[#0a1628] rounded-3xl border border-[#1a3a5c] overflow-hidden shadow-2xl relative">
            {/* Like/Nope Indicators */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 right-6 z-20 px-4 py-2 rounded-lg border-4 border-[#00ff88] rotate-12"
            >
              <span className="text-[#00ff88] font-black text-2xl">LIKE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-6 left-6 z-20 px-4 py-2 rounded-lg border-4 border-red-500 -rotate-12"
            >
              <span className="text-red-500 font-black text-2xl">NOPE</span>
            </motion.div>

            {/* Profile Image Placeholder */}
            <div className="h-[45%] md:h-1/2 bg-gradient-to-br from-[#1a3a5c] to-[#0f1f38] flex items-center justify-center relative">
              <div className="text-6xl md:text-7xl">🎾</div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f1f38] to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white">{currentProfile.name}</h3>
                <span className="text-lg md:text-xl bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded-full font-semibold">
                  {currentProfile.skillLevel}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <MapPin size={16} />
                <span className="text-sm md:text-base">{currentProfile.location}</span>
              </div>

              {currentProfile.bio && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{currentProfile.bio}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[#1a3a5c]/50 rounded-full text-xs md:text-sm text-gray-300 flex items-center gap-1">
                  <Target size={14} />
                  {skillLevelLabel(currentProfile.skillLevel)}
                </span>
                <span className="px-3 py-1.5 bg-[#1a3a5c]/50 rounded-full text-xs md:text-sm text-gray-300 flex items-center gap-1">
                  {playStyleEmoji(currentProfile.playStyle)}
                  {currentProfile.playStyle}
                </span>
                <span className="px-3 py-1.5 bg-[#1a3a5c]/50 rounded-full text-xs md:text-sm text-gray-300 flex items-center gap-1">
                  <Zap size={14} />
                  {currentProfile.lookingFor}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-6 md:mt-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("pass")}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0f1f38] border-2 border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all shadow-lg"
        >
          <X size={28} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("like")}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] flex items-center justify-center text-[#0a1628] hover:shadow-lg hover:shadow-[#00ff88]/25 transition-all"
        >
          <Heart size={32} fill="currentColor" />
        </motion.button>
      </div>

      {/* Swipe Hint */}
      <p className="text-gray-500 text-xs md:text-sm mt-4 text-center">
        Swipe right to like, left to pass
      </p>
    </div>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MapPin, Target, Trash2 } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { useConvexAuth } from "convex/react";

interface Message {
  _id: Id<"messages">;
  matchId: Id<"matches">;
  senderId: Id<"users">;
  text: string;
  createdAt: number;
}

interface ChatScreenProps {
  matchId: Id<"matches">;
  onBack: () => void;
}

export function ChatScreen({ matchId, onBack }: ChatScreenProps) {
  const match = useQuery(api.matches.getMatch, { matchId });
  const messages = useQuery(api.messages.list, { matchId });
  const sendMessage = useMutation(api.messages.send);
  const unmatch = useMutation(api.matches.unmatch);
  const { isAuthenticated } = useConvexAuth();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user for comparing message senders
  const myProfile = useQuery(api.profiles.get);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({ matchId, text: newMessage.trim() });
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUnmatch = async () => {
    try {
      await unmatch({ matchId });
      onBack();
    } catch (error) {
      console.error("Failed to unmatch:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!isAuthenticated || match === undefined || messages === undefined || myProfile === undefined) {
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

  if (!match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
        <p className="text-gray-400">Match not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-[#00ff88] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const otherProfile = match.otherProfile;

  // Group messages by date
  const messagesByDate: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((msg: Message) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      messagesByDate.push({ date: msgDate, messages: [] });
    }
    messagesByDate[messagesByDate.length - 1].messages.push(msg);
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#0f1f38]/90 backdrop-blur-md border-b border-[#1a3a5c] px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0f1f38] flex items-center justify-center">
          <span className="text-xl">🎾</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {otherProfile?.name || "Player"}
          </h3>
          {otherProfile && (
            <p className="text-xs text-gray-500 truncate">
              {otherProfile.skillLevel} • {otherProfile.location}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowUnmatchConfirm(true)}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Unmatch"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Unmatch Confirmation */}
      {showUnmatchConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#0a1628]/95 z-50 flex items-center justify-center p-6"
        >
          <div className="bg-[#0f1f38] rounded-2xl p-6 border border-[#1a3a5c] max-w-xs w-full text-center">
            <h3 className="text-xl font-bold text-white mb-3">Unmatch?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will remove your match and delete all messages. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnmatchConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-[#1a3a5c] text-gray-400 font-medium hover:bg-[#1a3a5c]/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnmatch}
                className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-medium hover:bg-red-500/30 transition-all"
              >
                Unmatch
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile Card (shown when no messages) */}
      {messages.length === 0 && otherProfile && (
        <div className="p-4 md:p-6">
          <div className="bg-[#0f1f38] rounded-2xl p-5 border border-[#1a3a5c]">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0f1f38] flex items-center justify-center mb-3">
                <span className="text-4xl">🎾</span>
              </div>
              <h3 className="text-xl font-bold text-white">{otherProfile.name}</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} />
                <span>{otherProfile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Target size={14} />
                <span>NTRP {otherProfile.skillLevel} • {otherProfile.playStyle}</span>
              </div>
            </div>

            {otherProfile.bio && (
              <p className="text-gray-300 text-sm mt-4 pt-4 border-t border-[#1a3a5c]">
                {otherProfile.bio}
              </p>
            )}

            <p className="text-center text-gray-500 text-sm mt-4">
              Start a conversation to set up a match! 🎾
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messagesByDate.map((group) => (
          <div key={group.date}>
            {/* Date Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#1a3a5c]" />
              <span className="text-xs text-gray-500 font-medium">{group.date}</span>
              <div className="flex-1 h-px bg-[#1a3a5c]" />
            </div>

            {/* Messages */}
            <div className="space-y-2">
              {group.messages.map((message: Message) => {
                const isMe = myProfile && message.senderId === myProfile.userId;
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? "bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a1628]"
                          : "bg-[#1a3a5c] text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe ? "text-[#0a1628]/60" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#0f1f38]/90 backdrop-blur-md border-t border-[#1a3a5c] p-3 md:p-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-[#0a1628] border border-[#1a3a5c] rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] flex items-center justify-center text-[#0a1628] disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#00ff88]/25"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 md:w-96 md:h-96 bg-[#00ff88]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 md:w-96 md:h-96 bg-[#00cc6a]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] border border-[#1a3a5c]/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] border border-[#1a3a5c]/20 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center shadow-lg shadow-[#00ff88]/20">
            <span className="text-3xl md:text-4xl">🎾</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Tennis<span className="text-[#00ff88]">Match</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">Find your perfect playing partner</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm md:max-w-md"
        >
          <div className="bg-[#0f1f38]/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-[#1a3a5c] shadow-2xl">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 text-center">
              {flow === "signIn" ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full bg-[#0a1628] border border-[#1a3a5c] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-base"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full bg-[#0a1628] border border-[#1a3a5c] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-base"
                />
              </div>

              <input name="flow" type="hidden" value={flow} />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a1628] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00ff88]/25 transition-all disabled:opacity-50 min-h-[48px]"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-[#0a1628] border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {flow === "signIn" ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1a3a5c]" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-[#1a3a5c]" />
            </div>

            <button
              onClick={() => signIn("anonymous")}
              className="w-full mt-6 bg-[#0a1628] border border-[#1a3a5c] text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 hover:border-[#00ff88]/50 hover:bg-[#1a3a5c]/20 transition-all min-h-[48px]"
            >
              <Sparkles size={18} className="text-[#00ff88]" />
              Continue as Guest
            </button>

            <p className="text-center mt-6 text-gray-400 text-sm md:text-base">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-[#00ff88] font-medium hover:underline"
              >
                {flow === "signIn" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-600 relative z-10">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}

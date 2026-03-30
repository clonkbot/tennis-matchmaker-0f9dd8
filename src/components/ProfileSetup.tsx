import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Target, Calendar, Zap, ChevronRight, Check } from "lucide-react";

type PlayStyle = "aggressive" | "defensive" | "all-court";
type LookingFor = "casual" | "competitive" | "practice" | "any";

interface ProfileData {
  name: string;
  skillLevel: number;
  bio?: string;
  location: string;
  playStyle: PlayStyle;
  availability: string[];
  lookingFor: LookingFor;
}

interface ExistingProfile extends ProfileData {
  _id: string;
  userId: string;
  createdAt: number;
}

interface ProfileSetupProps {
  existingProfile?: ExistingProfile | null;
}

export function ProfileSetup({ existingProfile }: ProfileSetupProps) {
  const createProfile = useMutation(api.profiles.create);
  const updateProfile = useMutation(api.profiles.update);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    name: existingProfile?.name || "",
    skillLevel: existingProfile?.skillLevel || 3.5,
    bio: existingProfile?.bio || "",
    location: existingProfile?.location || "",
    playStyle: existingProfile?.playStyle || "all-court",
    availability: existingProfile?.availability || [],
    lookingFor: existingProfile?.lookingFor || "casual",
  });

  const skillLevels = [
    { value: 1.5, label: "1.5", desc: "New to tennis" },
    { value: 2.0, label: "2.0", desc: "Beginner" },
    { value: 2.5, label: "2.5", desc: "Beginner+" },
    { value: 3.0, label: "3.0", desc: "Intermediate" },
    { value: 3.5, label: "3.5", desc: "Intermediate+" },
    { value: 4.0, label: "4.0", desc: "Advanced" },
    { value: 4.5, label: "4.5", desc: "Advanced+" },
    { value: 5.0, label: "5.0", desc: "Tournament" },
    { value: 5.5, label: "5.5+", desc: "Expert" },
  ];

  const playStyles: { value: PlayStyle; label: string; icon: string }[] = [
    { value: "aggressive", label: "Aggressive", icon: "⚡" },
    { value: "defensive", label: "Defensive", icon: "🛡️" },
    { value: "all-court", label: "All-Court", icon: "🎯" },
  ];

  const availabilityOptions = [
    { value: "weekday_morning", label: "Weekday Mornings" },
    { value: "weekday_afternoon", label: "Weekday Afternoons" },
    { value: "weekday_evening", label: "Weekday Evenings" },
    { value: "weekend_morning", label: "Weekend Mornings" },
    { value: "weekend_afternoon", label: "Weekend Afternoons" },
    { value: "weekend_evening", label: "Weekend Evenings" },
  ];

  const lookingForOptions: { value: LookingFor; label: string; desc: string }[] = [
    { value: "casual", label: "Casual Hits", desc: "Relaxed practice sessions" },
    { value: "competitive", label: "Competitive", desc: "Serious match play" },
    { value: "practice", label: "Drilling", desc: "Focused skill work" },
    { value: "any", label: "Any", desc: "Open to everything" },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || formData.availability.length === 0) return;

    setIsSubmitting(true);
    try {
      if (existingProfile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter((a) => a !== value)
        : [...prev.availability, value],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return formData.location.trim().length >= 2;
      case 3:
        return true;
      case 4:
        return formData.availability.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Progress Bar */}
      <div className="bg-[#0f1f38]/80 backdrop-blur-md border-b border-[#1a3a5c] px-4 md:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              {existingProfile ? "Edit Profile" : "Create Profile"}
            </h2>
            <span className="text-sm text-[#00ff88]">{step} of 5</span>
          </div>
          <div className="h-2 bg-[#1a3a5c] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 md:px-6 py-6 md:py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center">
                    <User className="text-[#00ff88]" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">What&apos;s your name?</h3>
                  <p className="text-gray-400 text-sm md:text-base">This is how other players will see you</p>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full bg-[#0f1f38] border border-[#1a3a5c] rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all"
                  autoFocus
                />
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio (optional)"
                  rows={3}
                  className="w-full bg-[#0f1f38] border border-[#1a3a5c] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all resize-none"
                />
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center">
                    <MapPin className="text-[#00ff88]" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Where do you play?</h3>
                  <p className="text-gray-400 text-sm md:text-base">City or neighborhood name</p>
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full bg-[#0f1f38] border border-[#1a3a5c] rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3: Skill Level & Play Style */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center">
                    <Target className="text-[#00ff88]" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Your skill level</h3>
                  <p className="text-gray-400 text-sm md:text-base">NTRP Rating (be honest!)</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.skillLevel === level.value
                          ? "border-[#00ff88] bg-[#00ff88]/10"
                          : "border-[#1a3a5c] bg-[#0f1f38] hover:border-[#1a3a5c]/80"
                      }`}
                    >
                      <div className={`font-bold text-lg ${formData.skillLevel === level.value ? "text-[#00ff88]" : "text-white"}`}>
                        {level.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{level.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-3 text-center">Play style</p>
                  <div className="flex gap-3">
                    {playStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setFormData({ ...formData, playStyle: style.value })}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          formData.playStyle === style.value
                            ? "border-[#00ff88] bg-[#00ff88]/10"
                            : "border-[#1a3a5c] bg-[#0f1f38] hover:border-[#1a3a5c]/80"
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className={`font-medium text-sm ${formData.playStyle === style.value ? "text-[#00ff88]" : "text-white"}`}>
                          {style.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center">
                    <Calendar className="text-[#00ff88]" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">When can you play?</h3>
                  <p className="text-gray-400 text-sm md:text-base">Select all that apply</p>
                </div>

                <div className="space-y-2">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleAvailability(option.value)}
                      className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        formData.availability.includes(option.value)
                          ? "border-[#00ff88] bg-[#00ff88]/10"
                          : "border-[#1a3a5c] bg-[#0f1f38] hover:border-[#1a3a5c]/80"
                      }`}
                    >
                      <span className={formData.availability.includes(option.value) ? "text-[#00ff88]" : "text-white"}>
                        {option.label}
                      </span>
                      {formData.availability.includes(option.value) && (
                        <Check className="text-[#00ff88]" size={20} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Looking For */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center">
                    <Zap className="text-[#00ff88]" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">What are you looking for?</h3>
                  <p className="text-gray-400 text-sm md:text-base">Type of tennis sessions</p>
                </div>

                <div className="space-y-3">
                  {lookingForOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, lookingFor: option.value })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.lookingFor === option.value
                          ? "border-[#00ff88] bg-[#00ff88]/10"
                          : "border-[#1a3a5c] bg-[#0f1f38] hover:border-[#1a3a5c]/80"
                      }`}
                    >
                      <div className={`font-medium ${formData.lookingFor === option.value ? "text-[#00ff88]" : "text-white"}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-[#0f1f38]/80 backdrop-blur-md border-t border-[#1a3a5c] px-4 md:px-6 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 rounded-xl border border-[#1a3a5c] text-gray-400 font-medium hover:bg-[#1a3a5c]/20 transition-all min-h-[48px]"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step < 5 ? setStep(step + 1) : handleSubmit())}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a1628] font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00ff88]/25 transition-all disabled:opacity-50 min-h-[48px]"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-[#0a1628] border-t-transparent rounded-full"
              />
            ) : step < 5 ? (
              <>
                Continue
                <ChevronRight size={18} />
              </>
            ) : (
              existingProfile ? "Save Changes" : "Complete Profile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

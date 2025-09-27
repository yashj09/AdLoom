"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  Calendar,
  Upload,
  Eye,
  Brain,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";

// Types
interface Campaign {
  id: string;
  title: string;
  paymentPerPost: number;
  deadline: Date;
  requirements: {
    hashtags: string[];
    minFollowers: number;
    contentGuidelines: string[];
    specialInstructions?: string;
  };
}

interface RequirementItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  required: boolean;
}

interface VerificationStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
  description: string;
  completedAt?: Date;
}

interface PostPreview {
  platform: "instagram" | "twitter" | "tiktok" | "unknown";
  thumbnail?: string;
  caption?: string;
  hashtags: string[];
  valid: boolean;
}

const PostSubmission: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [postUrl, setPostUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [urlError, setUrlError] = useState("");
  const [postPreview, setPostPreview] = useState<PostPreview | null>(null);

  // Requirements checklist
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);

  // Submission state
  const [submissionStatus, setSubmissionStatus] = useState<
    "form" | "processing" | "completed" | "failed"
  >("form");
  const [verificationSteps, setVerificationSteps] = useState<
    VerificationStep[]
  >([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "completed" | "failed"
  >("pending");

  // Mock campaign data
  useEffect(() => {
    const mockCampaign: Campaign = {
      id: (params?.campaignId as string) || "1",
      title: "Summer Fashion Collection 2025",
      paymentPerPost: 250,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requirements: {
        hashtags: ["SustainableFashion", "EcoStyle", "SummerVibes"],
        minFollowers: 10000,
        contentGuidelines: [
          "Include lifestyle shots with natural lighting",
          "Show product in use or styling context",
          "Write authentic caption about the experience",
          "Tag the brand account (@ecostyle)",
        ],
        specialInstructions:
          "Please use natural lighting and authentic styling",
      },
    };

    const mockRequirements: RequirementItem[] = [
      {
        id: "1",
        label: "Required hashtags included",
        description:
          "Post includes all required hashtags: #SustainableFashion, #EcoStyle, #SummerVibes",
        checked: false,
        required: true,
      },
      {
        id: "2",
        label: "Brand account tagged",
        description: "Brand account @ecostyle is tagged in the post",
        checked: false,
        required: true,
      },
      {
        id: "3",
        label: "High-quality visuals",
        description: "Images/videos are high resolution with good lighting",
        checked: false,
        required: true,
      },
      {
        id: "4",
        label: "Authentic caption",
        description: "Caption feels natural and mentions personal experience",
        checked: false,
        required: true,
      },
      {
        id: "5",
        label: "Product clearly visible",
        description: "Fashion items are prominently featured in the content",
        checked: false,
        required: true,
      },
      {
        id: "6",
        label: "Lifestyle context",
        description: "Content shows product in real-life styling situation",
        checked: false,
        required: false,
      },
    ];

    setTimeout(() => {
      setCampaign(mockCampaign);
      setRequirements(mockRequirements);
      setLoading(false);
    }, 1000);
  }, [params?.campaignId]);

  // URL validation
  const validateUrl = useCallback((url: string) => {
    if (!url) {
      setUrlError("");
      setPostPreview(null);
      return;
    }

    const socialMediaPatterns = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/,
      twitter:
        /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/[0-9]+/,
    };

    let platform: PostPreview["platform"] = "unknown";
    let valid = false;

    for (const [key, pattern] of Object.entries(socialMediaPatterns)) {
      if (pattern.test(url)) {
        platform = key as PostPreview["platform"];
        valid = true;
        break;
      }
    }

    if (!valid) {
      setUrlError(
        "Please enter a valid Instagram, Twitter/X, or TikTok post URL"
      );
      setPostPreview(null);
      return;
    }

    setUrlError("");

    // Mock post preview data
    const mockPreview: PostPreview = {
      platform,
      thumbnail: "/api/placeholder/300/300",
      caption:
        "Loving this sustainable summer collection! The quality is amazing and the styling options are endless. Perfect for those warm days when you want to look good and feel good about your choices! 🌱✨",
      hashtags: ["SustainableFashion", "EcoStyle", "SummerVibes", "OOTD"],
      valid: true,
    };

    setPostPreview(mockPreview);

    // Auto-check some requirements based on preview
    setRequirements((prev) =>
      prev.map((req) => {
        if (
          req.id === "1" &&
          mockPreview.hashtags.some((tag) =>
            ["SustainableFashion", "EcoStyle", "SummerVibes"].includes(tag)
          )
        ) {
          return { ...req, checked: true };
        }
        return req;
      })
    );
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      validateUrl(postUrl);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [postUrl, validateUrl]);

  // Handle requirement toggle
  const toggleRequirement = (id: string) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, checked: !req.checked } : req
      )
    );
  };

  // Submission process
  const handleSubmit = async () => {
    if (!postUrl || urlError) {
      setUrlError("Please enter a valid post URL");
      return;
    }

    const unmetRequiredRequirements = requirements.filter(
      (req) => req.required && !req.checked
    );
    if (unmetRequiredRequirements.length > 0) {
      return; // Don't submit if required requirements aren't met
    }

    setSubmissionStatus("processing");
    const mockSubmissionId = `SUB_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    setSubmissionId(mockSubmissionId);

    // Initialize verification steps
    const steps: VerificationStep[] = [
      {
        id: "1",
        label: "Content Analysis",
        status: "processing",
        description: "AI analyzing post content, hashtags, and mentions",
      },
      {
        id: "2",
        label: "Requirement Verification",
        status: "pending",
        description: "Checking compliance with campaign requirements",
      },
      {
        id: "3",
        label: "Quality Assessment",
        status: "pending",
        description: "Evaluating content quality and authenticity",
      },
      {
        id: "4",
        label: "Final Review",
        status: "pending",
        description: "Generating verification result and payment authorization",
      },
    ];

    setVerificationSteps(steps);

    // Simulate verification process
    setTimeout(() => {
      setVerificationSteps((prev) =>
        prev.map((step, index) =>
          index === 0
            ? { ...step, status: "completed", completedAt: new Date() }
            : index === 1
            ? { ...step, status: "processing" }
            : step
        )
      );
    }, 2000);

    setTimeout(() => {
      setVerificationSteps((prev) =>
        prev.map((step, index) =>
          index <= 1
            ? { ...step, status: "completed", completedAt: new Date() }
            : index === 2
            ? { ...step, status: "processing" }
            : step
        )
      );
    }, 4000);

    setTimeout(() => {
      setVerificationSteps((prev) =>
        prev.map((step, index) =>
          index <= 2
            ? { ...step, status: "completed", completedAt: new Date() }
            : index === 3
            ? { ...step, status: "processing" }
            : step
        )
      );
    }, 6000);

    setTimeout(() => {
      setVerificationSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: "completed",
          completedAt: new Date(),
        }))
      );
      setSubmissionStatus("completed");
      setPaymentStatus("processing");
    }, 8000);

    setTimeout(() => {
      setPaymentStatus("completed");
    }, 10000);
  };

  const getStepIcon = (status: VerificationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-green-400" />;
      case "processing":
        return <Loader2 size={20} className="text-purple-400 animate-spin" />;
      case "failed":
        return <XCircle size={20} className="text-red-400" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 flex items-center gap-3">
          <Loader2 className="animate-spin text-purple-400" size={24} />
          <span className="text-white">Loading campaign details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Campaign
        </button>

        {/* Campaign Context */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                {campaign?.title}
              </h1>
              <div className="flex items-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Due {campaign?.deadline.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>
                    {campaign?.requirements.minFollowers.toLocaleString()}+
                    followers
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">
                ${campaign?.paymentPerPost} PYUSD
              </div>
              <div className="text-white/70 text-sm">upon verification</div>
            </div>
          </div>
        </div>

        {submissionStatus === "form" && (
          <>
            {/* Submission Form */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload size={20} className="text-purple-400" />
                Submit Your Post
              </h2>

              <div className="space-y-6">
                {/* Post URL Input */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Post URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://instagram.com/p/your-post-id"
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border transition-all duration-300 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                      urlError
                        ? "border-red-400/60"
                        : "border-white/20 hover:border-white/30"
                    }`}
                  />
                  {urlError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {urlError}
                    </p>
                  )}
                </div>

                {/* Post Preview */}
                {postPreview && (
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Eye size={16} />
                      Post Preview
                    </h3>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {postPreview.platform.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm line-clamp-3 mb-2">
                          {postPreview.caption}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {postPreview.hashtags
                            .slice(0, 3)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="text-purple-300 text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          {postPreview.hashtags.length > 3 && (
                            <span className="text-white/60 text-xs">
                              +{postPreview.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Notes */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context about your post or creative choices..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/20 hover:border-white/30 transition-all duration-300 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target size={20} className="text-blue-400" />
                Requirements Checklist
              </h2>

              <div className="space-y-4">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      req.checked
                        ? "bg-green-500/10 border-green-400/30"
                        : req.required
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => toggleRequirement(req.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        req.checked
                          ? "bg-green-500 border-green-500"
                          : "border-white/30 hover:border-white/50"
                      }`}
                    >
                      {req.checked && (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium ${
                            req.checked ? "text-green-300" : "text-white"
                          }`}
                        >
                          {req.label}
                        </span>
                        {req.required && (
                          <span className="text-red-400 text-xs font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
                <p className="text-purple-300 text-sm">
                  <strong>Note:</strong> All required items must be checked
                  before submission. Our AI will verify these requirements
                  automatically.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={
                  !postUrl ||
                  !!urlError ||
                  requirements.filter((req) => req.required && !req.checked)
                    .length > 0
                }
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <Brain size={20} />
                Submit for AI Verification
              </button>
              <p className="text-white/60 text-sm mt-3">
                Your post will be verified by AI agents within 30 seconds
              </p>
            </div>
          </>
        )}

        {submissionStatus === "processing" && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Verification in Progress
              </h2>
              <p className="text-white/70">
                Submission ID:{" "}
                <span className="font-mono text-purple-300">
                  {submissionId}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    step.status === "completed"
                      ? "bg-green-500/10 border-green-400/30"
                      : step.status === "processing"
                      ? "bg-purple-500/10 border-purple-400/30"
                      : step.status === "failed"
                      ? "bg-red-500/10 border-red-400/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {getStepIcon(step.status)}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium ${
                          step.status === "completed"
                            ? "text-green-300"
                            : step.status === "processing"
                            ? "text-purple-300"
                            : step.status === "failed"
                            ? "text-red-300"
                            : "text-white/70"
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.completedAt && (
                        <span className="text-xs text-white/60">
                          {step.completedAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {paymentStatus === "processing" && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="text-blue-400 animate-spin" />
                  <span className="text-blue-300 font-medium">
                    Processing PYUSD payment...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {submissionStatus === "completed" && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {paymentStatus === "completed"
                  ? "Success! Payment Sent"
                  : "Post Verified!"}
              </h2>

              <p className="text-white/80 mb-8 max-w-md mx-auto">
                {paymentStatus === "completed"
                  ? `Your post has been verified and ${campaign?.paymentPerPost} PYUSD has been sent to your wallet.`
                  : "Your post has been verified by our AI agents. Payment is being processed."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-green-400" />
                    <span className="text-white font-medium">
                      Verification Score
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    98/100
                  </div>
                  <p className="text-white/60 text-sm">Excellent compliance</p>
                </div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-blue-400" />
                    <span className="text-white font-medium">
                      Payment Status
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      paymentStatus === "completed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {paymentStatus === "completed" ? "Paid" : "Processing"}
                  </div>
                  <p className="text-white/60 text-sm">
                    ${campaign?.paymentPerPost} PYUSD
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/creator/dashboard")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <TrendingUp size={18} />
                  View Dashboard
                </button>

                <button
                  onClick={() => router.push("/creator/campaigns")}
                  className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Target size={18} />
                  Find More Campaigns
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostSubmission;

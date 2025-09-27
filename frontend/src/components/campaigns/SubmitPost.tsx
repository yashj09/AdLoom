// frontend/src/components/campaigns/SubmitPost.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePlatformCore,
  useUserProfile,
  useCampaign,
  formatPYUSD,
} from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Link,
  Hash,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface SubmissionFormData {
  postUrl: string;
  hashtags: string[];
  description: string;
  contentType: string;
  platform: string;
  additionalNotes: string;
}

interface SubmissionFormErrors {
  postUrl?: string;
  hashtags?: string;
  description?: string;
  contentType?: string;
  platform?: string;
  additionalNotes?: string;
}

const initialFormData: SubmissionFormData = {
  postUrl: "",
  hashtags: [],
  description: "",
  contentType: "",
  platform: "",
  additionalNotes: "",
};

export const SubmitPost: React.FC = () => {
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData);
  const [errors, setErrors] = useState<SubmissionFormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const { address, isConnected } = useAccount();
  const { isRegisteredCreator } = useUserProfile(address);
  const { submitPost, isPending, isSuccess, hash } = usePlatformCore();
  const { campaign } = useCampaign(
    campaignId ? parseInt(campaignId) : undefined
  );

  // Redirect if not connected or not a creator
  useEffect(() => {
    if (!isConnected) {
      router.push("/register");
      return;
    }

    if (!campaignId) {
      router.push("/creator/campaigns");
      return;
    }
  }, [isConnected, campaignId, router]);

  // Handle successful submission
  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Post submitted successfully! AI verification in progress..."
      );
      router.push(`/creator/submissions/${hash}`);
    }
  }, [isSuccess, router, hash]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SubmissionFormErrors = {};

    if (!formData.postUrl.trim()) {
      newErrors.postUrl = "Post URL is required";
    } else if (!isValidUrl(formData.postUrl)) {
      newErrors.postUrl = "Please enter a valid URL";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.contentType) {
      newErrors.contentType = "Content type is required";
    }

    if (!formData.platform) {
      newErrors.platform = "Platform is required";
    }

    // Check if required hashtags are included
    if (
      (campaign as any)?.requiredHashtags &&
      (campaign as any).requiredHashtags.length > 0
    ) {
      const missingHashtags = (campaign as any).requiredHashtags.filter(
        (required: string) =>
          !formData.hashtags.some(
            (tag) => tag.toLowerCase() === required.toLowerCase()
          )
      );

      if (missingHashtags.length > 0) {
        newErrors.hashtags = `Missing required hashtags: ${missingHashtags.join(
          ", "
        )}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !campaignId) return;

    setIsValidating(true);

    try {
      // Construct requirements array for verification
      const requirements = [
        `description:${formData.description}`,
        `contentType:${formData.contentType}`,
        `platform:${formData.platform}`,
        `hashtags:${formData.hashtags.join(",")}`,
        ...(formData.additionalNotes
          ? [`notes:${formData.additionalNotes}`]
          : []),
      ];

      await submitPost(parseInt(campaignId), formData.postUrl, requirements);
    } catch (error: any) {
      console.error("Post submission failed:", error);
      toast.error(error.message || "Failed to submit post");
    } finally {
      setIsValidating(false);
    }
  };

  const addHashtag = () => {
    const cleanTag = newHashtag.trim().replace("#", "");
    if (cleanTag && !formData.hashtags.includes(cleanTag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanTag],
      }));
      setNewHashtag("");

      // Clear hashtag error if it exists
      if (errors.hashtags) {
        setErrors((prev) => ({ ...prev, hashtags: undefined }));
      }
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((h) => h !== hashtag),
    }));
  };

  const updateFormData = (field: keyof SubmissionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof SubmissionFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof SubmissionFormErrors]: undefined,
      }));
    }
  };

  // Loading state
  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-purple-400 mx-auto mb-4"
            size={40}
          />
          <p className="text-white/70">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  // Not registered state
  if (!isRegisteredCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold text-white mb-2">
            Creator Registration Required
          </h2>
          <p className="text-white/70 mb-6">
            You need to register as a creator to submit posts.
          </p>
          <Button onClick={() => router.push("/register")}>
            Register as Creator
          </Button>
        </div>
      </div>
    );
  }

  const campaignData = campaign as any; // Type assertion for demo

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submit Post</h1>
            <p className="text-muted-foreground mt-1">
              Campaign #{campaignId} • Earn $
              {formatPYUSD(campaignData.paymentPerPost)} PYUSD
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Campaign Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">Payment</p>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-400" />
                    <span className="text-white font-semibold">
                      ${formatPYUSD(campaignData.paymentPerPost)} PYUSD
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-white/60 text-sm">Deadline</p>
                  <p className="text-white">
                    {new Date(
                      Number(campaignData.deadline) * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">Min Followers</p>
                  <p className="text-white">
                    {Number(campaignData.minFollowers).toLocaleString()}
                  </p>
                </div>

                {campaignData.requiredHashtags &&
                  campaignData.requiredHashtags.length > 0 && (
                    <div>
                      <p className="text-white/60 text-sm">Required Hashtags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaignData.requiredHashtags.map(
                          (hashtag: string) => (
                            <span
                              key={hashtag}
                              className="inline-block px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                            >
                              #{hashtag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                <div>
                  <p className="text-white/60 text-sm">Requirements</p>
                  <p className="text-white text-sm">
                    {campaignData.requirements || "Follow campaign guidelines"}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-400 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">
                      AI Verification
                    </h4>
                    <p className="text-blue-300/80 text-xs mt-1">
                      Your post will be automatically verified by AI agents.
                      Payment will be released instantly upon approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-lg p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Post Submission
              </h2>

              {/* Post URL */}
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Post URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Link
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                    size={18}
                  />
                  <input
                    type="url"
                    value={formData.postUrl}
                    onChange={(e) => updateFormData("postUrl", e.target.value)}
                    placeholder="https://instagram.com/p/your-post"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {errors.postUrl && (
                  <p className="text-red-400 text-sm">{errors.postUrl}</p>
                )}
              </div>

              {/* Platform & Content Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-white font-medium">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => updateFormData("platform", e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Pinterest">Pinterest</option>
                  </select>
                  {errors.platform && (
                    <p className="text-red-400 text-sm">{errors.platform}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-white font-medium">
                    Content Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      updateFormData("contentType", e.target.value)
                    }
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select content type</option>
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Story">Story</option>
                    <option value="Reel">Reel</option>
                    <option value="Review">Review</option>
                    <option value="Unboxing">Unboxing</option>
                  </select>
                  {errors.contentType && (
                    <p className="text-red-400 text-sm">{errors.contentType}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="Describe your post and how it meets the campaign requirements..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  Hashtags
                  {campaignData.requiredHashtags &&
                    campaignData.requiredHashtags.length > 0 && (
                      <span className="text-red-400"> *</span>
                    )}
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                      size={18}
                    />
                    <input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      placeholder="Enter hashtag"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addHashtag())
                      }
                    />
                  </div>
                  <Button type="button" onClick={addHashtag} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                    >
                      #{hashtag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(hashtag)}
                        className="text-purple-300 hover:text-white ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {errors.hashtags && (
                  <p className="text-red-400 text-sm">{errors.hashtags}</p>
                )}
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block text-white font-medium">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    updateFormData("additionalNotes", e.target.value)
                  }
                  placeholder="Any additional information about your submission..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-white/10">
                <Button
                  type="submit"
                  disabled={isPending || isValidating}
                  className="w-full py-4 text-lg font-semibold"
                  style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  {isPending || isValidating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      {isValidating ? "Validating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={20} />
                      Submit for AI Verification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Submission transaction:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View on Etherscan
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

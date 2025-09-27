// frontend/src/components/campaigns/CreateCampaign.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  usePlatformCore,
  useUserProfile,
  usePlatformConfig,
} from "@/hooks/useContracts";
import {
  CATEGORY_OPTIONS,
  PLATFORM_OPTIONS,
  CONTENT_TYPE_OPTIONS,
} from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Hash,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CampaignFormData {
  title: string;
  description: string;
  requirements: string;
  paymentPerPost: string;
  maxPosts: number;
  deadline: string;
  requiredHashtags: string[];
  minFollowers: number;
  category: string;
  platforms: string[];
  contentTypes: string[];
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface CampaignFormErrors {
  title?: string;
  description?: string;
  requirements?: string;
  paymentPerPost?: string;
  maxPosts?: string;
  deadline?: string;
  requiredHashtags?: string;
  minFollowers?: string;
  category?: string;
  platforms?: string;
  contentTypes?: string;
  location?: string;
  difficulty?: string;
}

const initialFormData: CampaignFormData = {
  title: "",
  description: "",
  requirements: "",
  paymentPerPost: "",
  maxPosts: 1,
  deadline: "",
  requiredHashtags: [],
  minFollowers: 1000,
  category: "",
  platforms: [],
  contentTypes: [],
  location: "Remote",
  difficulty: "Easy",
};

export const CreateCampaign = () => {
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [errors, setErrors] = useState<CampaignFormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [newHashtag, setNewHashtag] = useState("");

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isRegisteredBrand, userType, brandData } = useUserProfile(address);
  const { createCampaign, isPending, isSuccess, hash } = usePlatformCore();
  const { platformFeeRate, minCampaignDuration, maxCampaignDuration } =
    usePlatformConfig();

  // Calculate total budget
  const totalBudget =
    (parseFloat(formData.paymentPerPost) || 0) * formData.maxPosts;
  const platformFee = totalBudget * ((platformFeeRate || 250) / 10000);
  const finalBudget = totalBudget + platformFee;

  // Redirect if not connected or not a brand
  useEffect(() => {
    if (!isConnected) {
      router.push("/register");
      return;
    }

    if (isConnected && userType !== undefined && userType !== 1) {
      if (userType === 2) {
        router.push("/creator/dashboard");
      } else {
        router.push("/register");
      }
    }
  }, [isConnected, userType, router]);

  // Handle successful campaign creation
  useEffect(() => {
    if (isSuccess) {
      toast.success("Campaign created successfully!");
      router.push("/brand/campaigns");
    }
  }, [isSuccess, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: CampaignFormErrors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title.trim())
          newErrors.title = "Campaign title is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (formData.platforms.length === 0)
          newErrors.platforms = "Select at least one platform";
        break;

      case 2: // Requirements
        if (!formData.requirements.trim())
          newErrors.requirements = "Requirements are required";
        if (formData.contentTypes.length === 0)
          newErrors.contentTypes = "Select at least one content type";
        if (formData.minFollowers < 0)
          newErrors.minFollowers = "Minimum followers must be positive";
        break;

      case 3: // Budget & Timeline
        if (
          !formData.paymentPerPost ||
          parseFloat(formData.paymentPerPost) <= 0
        ) {
          newErrors.paymentPerPost = "Payment per post must be greater than 0";
        }
        if (formData.maxPosts <= 0)
          newErrors.maxPosts = "Max posts must be greater than 0";
        if (!formData.deadline) newErrors.deadline = "Deadline is required";

        // Validate deadline
        if (formData.deadline) {
          const deadlineDate = new Date(formData.deadline);
          const now = new Date();
          const minDate = new Date(
            now.getTime() + (minCampaignDuration || 86400) * 1000
          );
          const maxDate = new Date(
            now.getTime() + (maxCampaignDuration || 31536000) * 1000
          );

          if (deadlineDate <= minDate) {
            newErrors.deadline = "Deadline must be at least 24 hours from now";
          } else if (deadlineDate >= maxDate) {
            newErrors.deadline = "Deadline cannot be more than 1 year from now";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      // Construct requirements string (in a real app, this would be JSON)
      const requirementsObj = {
        description: formData.description,
        requirements: formData.requirements,
        category: formData.category,
        platforms: formData.platforms,
        contentTypes: formData.contentTypes,
        location: formData.location,
        difficulty: formData.difficulty,
      };

      const requirementsString = JSON.stringify(requirementsObj);
      const deadlineTimestamp = Math.floor(
        new Date(formData.deadline).getTime() / 1000
      );

      await createCampaign(
        requirementsString,
        formData.paymentPerPost,
        formData.maxPosts,
        deadlineTimestamp,
        formData.requiredHashtags,
        formData.minFollowers,
        finalBudget.toString()
      );
    } catch (error: any) {
      console.error("Campaign creation failed:", error);
      toast.error(error.message || "Failed to create campaign");
    }
  };

  const addHashtag = () => {
    if (
      newHashtag.trim() &&
      !formData.requiredHashtags.includes(newHashtag.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requiredHashtags: [...prev.requiredHashtags, newHashtag.trim()],
      }));
      setNewHashtag("");
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredHashtags: prev.requiredHashtags.filter((h) => h !== hashtag),
    }));
  };

  const updateFormData = (field: keyof CampaignFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CampaignFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof CampaignFormErrors]: undefined,
      }));
    }
  };

  // Loading state
  if (!isConnected || userType === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-purple-400 mx-auto mb-4"
            size={40}
          />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Not registered state
  if (!isRegisteredBrand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold text-white mb-2">
            Brand Registration Required
          </h2>
          <p className="text-white/70 mb-6">
            You need to register as a brand to create campaigns.
          </p>
          <Button onClick={() => router.push("/register")}>
            Register as Brand
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">
              Create Campaign
            </h1>
            <p className="text-muted-foreground mt-1">
              Launch your next influencer marketing campaign
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: 1, title: "Basic Info", icon: Target },
            { step: 2, title: "Requirements", icon: Users },
            { step: 3, title: "Budget & Timeline", icon: DollarSign },
            { step: 4, title: "Review", icon: CheckCircle },
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span
                className={`ml-2 text-sm ${
                  currentStep >= step
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {title}
              </span>
              {step < 4 && (
                <div
                  className={`w-16 h-0.5 ml-4 ${
                    currentStep > step ? "bg-purple-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="glass-card rounded-xl p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Campaign Details
              </h2>

              <FormInput
                label="Campaign Title"
                value={formData.title}
                onChange={(value) => updateFormData("title", value)}
                placeholder="Enter a compelling campaign title"
                error={errors.title}
                required
              />

              <FormInput
                label="Description"
                value={formData.description}
                onChange={(value) => updateFormData("description", value)}
                placeholder="Describe your campaign and what you're looking for..."
                type="textarea"
                error={errors.description}
                required
              />

              <FormSelect
                label="Category"
                value={formData.category}
                onChange={(value) => updateFormData("category", value)}
                options={CATEGORY_OPTIONS}
                placeholder="Select campaign category"
                error={errors.category}
                required
              />

              <FormMultiSelect
                label="Platforms"
                values={formData.platforms}
                onChange={(values) => updateFormData("platforms", values)}
                options={PLATFORM_OPTIONS}
                error={errors.platforms}
                required
              />

              <FormSelect
                label="Location"
                value={formData.location}
                onChange={(value) => updateFormData("location", value)}
                options={[
                  "Remote",
                  "New York",
                  "Los Angeles",
                  "London",
                  "Paris",
                  "Tokyo",
                ]}
                placeholder="Select location requirement"
              />
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Content Requirements
              </h2>

              <FormInput
                label="Detailed Requirements"
                value={formData.requirements}
                onChange={(value) => updateFormData("requirements", value)}
                placeholder="Specify exactly what content you want creators to produce..."
                type="textarea"
                error={errors.requirements}
                required
              />

              <FormMultiSelect
                label="Content Types"
                values={formData.contentTypes}
                onChange={(values) => updateFormData("contentTypes", values)}
                options={CONTENT_TYPE_OPTIONS}
                error={errors.contentTypes}
                required
              />

              <FormInput
                label="Minimum Followers"
                value={formData.minFollowers.toString()}
                onChange={(value) =>
                  updateFormData("minFollowers", parseInt(value) || 0)
                }
                placeholder="1000"
                type="number"
                error={errors.minFollowers}
              />

              {/* Hashtags */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  Required Hashtags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    placeholder="Enter hashtag"
                    className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addHashtag())
                    }
                  />
                  <Button onClick={addHashtag} variant="outline">
                    <Hash size={16} className="mr-1" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredHashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                    >
                      #{hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="text-purple-300 hover:text-white ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <FormSelect
                label="Difficulty Level"
                value={formData.difficulty}
                onChange={(value) => updateFormData("difficulty", value)}
                options={["Easy", "Medium", "Hard"]}
              />
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Budget & Timeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Payment per Post (PYUSD)"
                  value={formData.paymentPerPost}
                  onChange={(value) => updateFormData("paymentPerPost", value)}
                  placeholder="100"
                  type="number"
                  step="0.01"
                  error={errors.paymentPerPost}
                  required
                />

                <FormInput
                  label="Maximum Posts"
                  value={formData.maxPosts.toString()}
                  onChange={(value) =>
                    updateFormData("maxPosts", parseInt(value) || 1)
                  }
                  placeholder="10"
                  type="number"
                  error={errors.maxPosts}
                  required
                />
              </div>

              <FormInput
                label="Campaign Deadline"
                value={formData.deadline}
                onChange={(value) => updateFormData("deadline", value)}
                type="datetime-local"
                error={errors.deadline}
                required
              />

              {/* Budget Summary */}
              <div className="bg-white/5 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Budget Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Payment per post:</span>
                    <span className="text-white">
                      ${formData.paymentPerPost || 0} PYUSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Maximum posts:</span>
                    <span className="text-white">{formData.maxPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Subtotal:</span>
                    <span className="text-white">
                      ${totalBudget.toFixed(2)} PYUSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Platform fee (2.5%):</span>
                    <span className="text-white">
                      ${platformFee.toFixed(2)} PYUSD
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total budget required:</span>
                      <span className="text-white">
                        ${finalBudget.toFixed(2)} PYUSD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Review Campaign
              </h2>

              <div className="space-y-4">
                <ReviewSection title="Basic Information">
                  <ReviewItem label="Title" value={formData.title} />
                  <ReviewItem label="Category" value={formData.category} />
                  <ReviewItem
                    label="Platforms"
                    value={formData.platforms.join(", ")}
                  />
                </ReviewSection>

                <ReviewSection title="Requirements">
                  <ReviewItem
                    label="Content Types"
                    value={formData.contentTypes.join(", ")}
                  />
                  <ReviewItem
                    label="Min Followers"
                    value={formData.minFollowers.toLocaleString()}
                  />
                  <ReviewItem
                    label="Hashtags"
                    value={formData.requiredHashtags
                      .map((h) => `#${h}`)
                      .join(" ")}
                  />
                </ReviewSection>

                <ReviewSection title="Budget & Timeline">
                  <ReviewItem
                    label="Payment per Post"
                    value={`$${formData.paymentPerPost} PYUSD`}
                  />
                  <ReviewItem
                    label="Max Posts"
                    value={formData.maxPosts.toString()}
                  />
                  <ReviewItem
                    label="Total Budget"
                    value={`$${finalBudget.toFixed(2)} PYUSD`}
                  />
                  <ReviewItem
                    label="Deadline"
                    value={new Date(formData.deadline).toLocaleString()}
                  />
                </ReviewSection>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-400 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-amber-400 font-medium">
                      Important Notice
                    </h4>
                    <p className="text-amber-300/80 text-sm mt-1">
                      Once you create this campaign, the total budget ($
                      {finalBudget.toFixed(2)} PYUSD) will be locked in smart
                      contract escrow. Make sure you have sufficient PYUSD
                      balance and have approved the platform to spend your
                      tokens.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="min-w-[150px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Transaction submitted:{" "}
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

// Helper Components
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  step?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required,
  step,
}) => {
  const isTextarea = type === "textarea";
  const Component = isTextarea ? "textarea" : "input";

  return (
    <div className="space-y-2">
      <label className="block text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Component
        type={isTextarea ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className={`w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          isTextarea ? "min-h-[120px] resize-none" : ""
        }`}
        {...(isTextarea && { rows: 4 })}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}) => (
  <div className="space-y-2">
    <label className="block text-white font-medium">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option} value={option} className="bg-gray-800">
          {option}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-sm">{error}</p>}
  </div>
);

interface FormMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  error?: string;
  required?: boolean;
}

const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  label,
  values,
  onChange,
  options,
  error,
  required,
}) => {
  const toggleOption = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={`p-3 rounded-lg text-sm transition-all ${
              values.includes(option)
                ? "bg-purple-500/30 border-purple-400 text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            } border`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

const ReviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white/5 rounded-lg p-4">
    <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const ReviewItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-white/70">{label}:</span>
    <span className="text-white">{value}</span>
  </div>
);

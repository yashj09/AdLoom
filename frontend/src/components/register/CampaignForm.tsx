"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  DollarSign,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import GlassInput from "./GlassInput";
import TagInput from "./TagInput";
import CategorySelector from "./CategorySelector";

interface CampaignData {
  // Step 1
  title: string;
  description: string;
  hashtags: string[];
  contentRequirements: string;
  deadline: string;

  // Step 2
  paymentPerPost: string;
  maxPosts: string;

  // Step 3
  minFollowers: string;
  targetCategories: string[];

  // Step 4
  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CampaignForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pyusdBalance] = useState(5000); // Mock balance
  const [pyusdRate] = useState(1.0); // 1 PYUSD = 1 USD

  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: "",
    description: "",
    hashtags: [],
    contentRequirements: "",
    deadline: "",
    paymentPerPost: "",
    maxPosts: "",
    minFollowers: "",
    targetCategories: [],
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const stepTitles = [
    "Campaign Details",
    "Budget & Payments",
    "Target Audience",
    "Review & Deploy",
  ];

  const creatorCategories = [
    "Fashion",
    "Technology",
    "Gaming",
    "Lifestyle",
    "Food",
    "Travel",
    "Fitness",
    "Beauty",
    "Education",
    "Entertainment",
    "Business",
    "Art",
  ];

  const updateCampaignData = (field: string, value: any) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!campaignData.title.trim())
          newErrors.title = "Campaign title is required";
        if (!campaignData.description.trim())
          newErrors.description = "Campaign description is required";
        if (campaignData.hashtags.length === 0)
          newErrors.hashtags = "At least one hashtag is required";
        if (!campaignData.contentRequirements.trim())
          newErrors.contentRequirements = "Content requirements are required";
        if (!campaignData.deadline)
          newErrors.deadline = "Campaign deadline is required";
        break;

      case 2:
        if (
          !campaignData.paymentPerPost ||
          parseFloat(campaignData.paymentPerPost) <= 0
        ) {
          newErrors.paymentPerPost = "Payment per post must be greater than 0";
        }
        if (!campaignData.maxPosts || parseInt(campaignData.maxPosts) <= 0) {
          newErrors.maxPosts = "Maximum posts must be greater than 0";
        }

        const totalBudget =
          parseFloat(campaignData.paymentPerPost || "0") *
          parseInt(campaignData.maxPosts || "0");
        if (totalBudget > pyusdBalance) {
          newErrors.budget = "Total budget exceeds your PYUSD balance";
        }
        break;

      case 3:
        if (
          !campaignData.minFollowers ||
          parseInt(campaignData.minFollowers) < 0
        ) {
          newErrors.minFollowers = "Minimum followers must be 0 or greater";
        }
        if (campaignData.targetCategories.length === 0) {
          newErrors.targetCategories = "Select at least one target category";
        }
        break;

      case 4:
        if (!campaignData.acceptTerms) {
          newErrors.acceptTerms = "You must accept the terms and conditions";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);

    try {
      // Simulate smart contract deployment
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsSuccess(true);
    } catch (error) {
      console.error("Campaign deployment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBudget =
    parseFloat(campaignData.paymentPerPost || "0") *
    parseInt(campaignData.maxPosts || "0");
  const totalBudgetUSD = totalBudget * pyusdRate;

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">
          Campaign Deployed Successfully!
        </h3>
        <p className="text-white/70 mb-6">
          Your campaign is now live on the blockchain and visible to creators.
        </p>
        <div className="space-y-2 text-sm text-white/60">
          <p>
            Campaign ID: #CM
            {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <p>Total Budget: {totalBudget.toFixed(2)} PYUSD</p>
          <p>Maximum Posts: {campaignData.maxPosts}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
        {/* Step 1: Campaign Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Campaign Details
                </h2>
                <p className="text-white/70 text-sm">
                  Define your campaign objectives and requirements
                </p>
              </div>
            </div>

            <GlassInput
              label="Campaign Title"
              value={campaignData.title}
              onChange={(value) => updateCampaignData("title", value)}
              placeholder="e.g., Summer Fashion Collection Launch"
              error={errors.title}
              required
            />

            <GlassInput
              label="Campaign Description"
              type="textarea"
              value={campaignData.description}
              onChange={(value) => updateCampaignData("description", value)}
              placeholder="Describe your campaign goals, brand message, and what you're looking for..."
              error={errors.description}
              required
            />

            <TagInput
              label="Required Hashtags"
              tags={campaignData.hashtags}
              onTagsChange={(tags) => updateCampaignData("hashtags", tags)}
              placeholder="Enter hashtags (without #)"
              error={errors.hashtags}
              required
            />

            <GlassInput
              label="Content Requirements"
              type="textarea"
              value={campaignData.contentRequirements}
              onChange={(value) =>
                updateCampaignData("contentRequirements", value)
              }
              placeholder="Specify content format, style guidelines, deliverables, etc..."
              error={errors.contentRequirements}
              required
            />

            <GlassInput
              label="Campaign Deadline"
              type="date"
              value={campaignData.deadline}
              onChange={(value) => updateCampaignData("deadline", value)}
              error={errors.deadline}
              required
            />
          </div>
        )}

        {/* Step 2: Budget & Payments */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Budget & Payments
                </h2>
                <p className="text-white/70 text-sm">
                  Set your payment structure and budget limits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput
                label="Payment per Post (PYUSD)"
                type="number"
                value={campaignData.paymentPerPost}
                onChange={(value) =>
                  updateCampaignData("paymentPerPost", value)
                }
                placeholder="0.00"
                error={errors.paymentPerPost}
                required
              />

              <GlassInput
                label="Maximum Posts"
                type="number"
                value={campaignData.maxPosts}
                onChange={(value) => updateCampaignData("maxPosts", value)}
                placeholder="10"
                error={errors.maxPosts}
                required
              />
            </div>

            {/* Budget Summary */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Budget Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Payment per post:</span>
                  <span className="text-white font-medium">
                    {parseFloat(campaignData.paymentPerPost || "0").toFixed(2)}{" "}
                    PYUSD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Maximum posts:</span>
                  <span className="text-white font-medium">
                    {campaignData.maxPosts || "0"}
                  </span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">
                      Total Budget:
                    </span>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {totalBudget.toFixed(2)} PYUSD
                      </div>
                      <div className="text-white/60 text-sm">
                        ≈ ${totalBudgetUSD.toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Your PYUSD Balance:</span>
                  <span
                    className={`font-medium ${
                      pyusdBalance >= totalBudget
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {pyusdBalance.toFixed(2)} PYUSD
                  </span>
                </div>
              </div>

              {errors.budget && (
                <p className="text-red-400 text-sm mt-3">{errors.budget}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Target Audience */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Target Audience
                </h2>
                <p className="text-white/70 text-sm">
                  Define your ideal creator criteria
                </p>
              </div>
            </div>

            <GlassInput
              label="Minimum Followers"
              type="number"
              value={campaignData.minFollowers}
              onChange={(value) => updateCampaignData("minFollowers", value)}
              placeholder="1000"
              error={errors.minFollowers}
              required
            />

            <CategorySelector
              label="Target Creator Categories"
              categories={creatorCategories}
              selectedCategories={campaignData.targetCategories}
              onCategoriesChange={(categories) =>
                updateCampaignData("targetCategories", categories)
              }
              error={errors.targetCategories}
              required
            />
          </div>
        )}

        {/* Step 4: Review & Deploy */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Review & Deploy
                </h2>
                <p className="text-white/70 text-sm">
                  Review your campaign details before deployment
                </p>
              </div>
            </div>

            {/* Campaign Summary */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Campaign Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-white/60 text-sm">Title:</span>
                    <p className="text-white font-medium">
                      {campaignData.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Hashtags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaignData.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Deadline:</span>
                    <p className="text-white font-medium">
                      {new Date(campaignData.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-white/60 text-sm">Budget:</span>
                    <p className="text-white font-medium">
                      {totalBudget.toFixed(2)} PYUSD
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">
                      Min. Followers:
                    </span>
                    <p className="text-white font-medium">
                      {parseInt(campaignData.minFollowers).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Categories:</span>
                    <p className="text-white font-medium">
                      {campaignData.targetCategories.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={campaignData.acceptTerms}
                onChange={(e) =>
                  updateCampaignData("acceptTerms", e.target.checked)
                }
                className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-white/30 rounded focus:ring-purple-500"
              />
              <label htmlFor="acceptTerms" className="text-sm text-white/80">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Terms and Conditions
                </a>{" "}
                and understand that campaign funds will be locked in a smart
                contract until completion.
              </label>
            </div>

            {errors.acceptTerms && (
              <p className="text-red-400 text-sm">{errors.acceptTerms}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
              ${
                currentStep === 1
                  ? "text-white/40 cursor-not-allowed"
                  : "text-white hover:text-purple-300 hover:bg-white/5"
              }
            `}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Next
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Deploying Campaign...
                </>
              ) : (
                "Deploy Campaign"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;

"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Loader2, Check, ArrowRight, AlertCircle } from "lucide-react";
import { useUserRegistry } from "@/hooks/useContracts";
import { toast } from "sonner";
import GlassInput from "./GlassInput";

interface RegistrationFormProps {
  selectedRole: "brand" | "creator";
}

interface FormData {
  // Brand fields
  companyName: string;
  description: string;
  website: string;
  logoUrl: string;
  industry: string;
  contactEmail: string;

  // Creator fields
  username: string;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  twitterHandle: string;
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  linkedinHandle: string;
  personalWebsite: string;
  totalFollowers: number;
  categories: string[];
  languages: string[];
}

interface FormErrors {
  [key: string]: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedRole,
}) => {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    description: "",
    website: "",
    logoUrl: "",
    industry: "",
    contactEmail: "",
    username: "",
    displayName: "",
    bio: "",
    profileImageUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    tiktokHandle: "",
    youtubeHandle: "",
    linkedinHandle: "",
    personalWebsite: "",
    totalFollowers: 0,
    categories: [],
    languages: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Wallet and smart contract integration
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const {
    registerBrand,
    registerCreator,
    isPending,
    isSuccess: contractSuccess,
    hash,
  } = useUserRegistry();

  // Handle successful registration
  useEffect(() => {
    if (contractSuccess) {
      setIsSuccess(true);
      toast.success("Registration successful! Welcome to the platform!");

      setTimeout(() => {
        if (selectedRole === "brand") {
          router.push("/brand/dashboard");
        } else {
          router.push("/creator/dashboard");
        }
      }, 2000);
    }
  }, [contractSuccess, selectedRole, router]);

  // Check wallet connection
  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="text-amber-400 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold text-white mb-3">
          Wallet Connection Required
        </h3>
        <p className="text-white/70 mb-6">
          Please connect your wallet to register on the platform.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

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

  const availableLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Russian",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (selectedRole === "brand") {
      if (!formData.companyName.trim())
        newErrors.companyName = "Company name is required";
      if (!formData.description.trim())
        newErrors.description = "Company description is required";
      if (!formData.contactEmail.trim())
        newErrors.contactEmail = "Contact email is required";
      if (!formData.industry.trim())
        newErrors.industry = "Industry is required";

      if (
        formData.contactEmail &&
        !/\S+@\S+\.\S+/.test(formData.contactEmail)
      ) {
        newErrors.contactEmail = "Please enter a valid email address";
      }

      if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    } else {
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.displayName.trim())
        newErrors.displayName = "Display name is required";
      if (!formData.bio.trim()) newErrors.bio = "Bio is required";
      if (formData.totalFollowers < 0)
        newErrors.totalFollowers = "Followers count cannot be negative";
      if (formData.categories.length === 0)
        newErrors.categories = "Select at least one category";
      if (formData.languages.length === 0)
        newErrors.languages = "Select at least one language";

      if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username =
          "Username can only contain letters, numbers, and underscores";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (selectedRole === "brand") {
        await registerBrand(
          formData.companyName,
          formData.description,
          formData.website || "",
          formData.logoUrl || "",
          [formData.industry], // industries as array
          formData.contactEmail
        );
      } else {
        // Construct social media object
        const socialMedia = {
          twitter: formData.twitterHandle || "",
          instagram: formData.instagramHandle || "",
          tiktok: formData.tiktokHandle || "",
          youtube: formData.youtubeHandle || "",
          linkedin: formData.linkedinHandle || "",
          website: formData.personalWebsite || "",
        };

        await registerCreator(
          formData.username,
          formData.displayName,
          formData.bio,
          formData.profileImageUrl || "",
          socialMedia,
          formData.totalFollowers || 0,
          formData.categories,
          formData.languages.length > 0 ? formData.languages : ["English"]
        );
      }

      toast.success("Transaction submitted! Please wait for confirmation...");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: "" }));
    }
  };

  const toggleLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
    if (errors.languages) {
      setErrors((prev) => ({ ...prev, languages: "" }));
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">
          Registration Successful!
        </h3>
        <p className="text-white/70 mb-6">
          Your profile has been created on the blockchain!
        </p>
        {hash && (
          <p className="text-blue-400 text-sm mb-4">
            Transaction:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              View on Etherscan
            </a>
          </p>
        )}
        <div className="animate-pulse text-purple-400">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          {selectedRole === "brand"
            ? "Brand Registration"
            : "Creator Registration"}
        </h2>
        <p className="text-white/70 text-lg">
          {selectedRole === "brand"
            ? "Connect with top creators for your campaigns"
            : "Start monetizing your influence on Web3"}
        </p>
      </div>

      {selectedRole === "brand" ? (
        <>
          <GlassInput
            label="Company Name"
            value={formData.companyName}
            onChange={(value) => updateFormData("companyName", value)}
            placeholder="Enter your company name"
            error={errors.companyName}
            required
          />

          <GlassInput
            label="Company Description"
            type="textarea"
            value={formData.description}
            onChange={(value) => updateFormData("description", value)}
            placeholder="Describe your company and what you do..."
            error={errors.description}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Website"
              type="url"
              value={formData.website}
              onChange={(value) => updateFormData("website", value)}
              placeholder="https://yourcompany.com"
              error={errors.website}
            />

            <GlassInput
              label="Logo URL"
              type="url"
              value={formData.logoUrl}
              onChange={(value) => updateFormData("logoUrl", value)}
              placeholder="https://yoursite.com/logo.png"
              error={errors.logoUrl}
            />
          </div>

          <GlassInput
            label="Industry"
            value={formData.industry}
            onChange={(value) => updateFormData("industry", value)}
            placeholder="e.g., Fashion, Technology, Food"
            error={errors.industry}
            required
          />

          <GlassInput
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(value) => updateFormData("contactEmail", value)}
            placeholder="contact@yourcompany.com"
            error={errors.contactEmail}
            required
          />
        </>
      ) : (
        <>
          <GlassInput
            label="Username"
            value={formData.username}
            onChange={(value) => updateFormData("username", value)}
            placeholder="@yourusername"
            error={errors.username}
            required
          />

          <GlassInput
            label="Display Name"
            value={formData.displayName}
            onChange={(value) => updateFormData("displayName", value)}
            placeholder="Your display name"
            error={errors.displayName}
            required
          />

          <GlassInput
            label="Bio"
            type="textarea"
            value={formData.bio}
            onChange={(value) => updateFormData("bio", value)}
            placeholder="Tell us about yourself and your content..."
            error={errors.bio}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Profile Image URL"
              type="url"
              value={formData.profileImageUrl}
              onChange={(value) => updateFormData("profileImageUrl", value)}
              placeholder="https://yoursite.com/profile.jpg"
              error={errors.profileImageUrl}
            />

            <GlassInput
              label="Total Followers"
              type="number"
              value={formData.totalFollowers.toString()}
              onChange={(value) =>
                updateFormData("totalFollowers", parseInt(value) || 0)
              }
              placeholder="0"
              error={errors.totalFollowers}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Twitter Handle"
              value={formData.twitterHandle}
              onChange={(value) => updateFormData("twitterHandle", value)}
              placeholder="@twitter"
            />

            <GlassInput
              label="Instagram Handle"
              value={formData.instagramHandle}
              onChange={(value) => updateFormData("instagramHandle", value)}
              placeholder="@instagram"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="TikTok Handle"
              value={formData.tiktokHandle}
              onChange={(value) => updateFormData("tiktokHandle", value)}
              placeholder="@tiktok"
            />

            <GlassInput
              label="LinkedIn Handle"
              value={formData.linkedinHandle}
              onChange={(value) => updateFormData("linkedinHandle", value)}
              placeholder="@linkedin"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="YouTube Channel"
              value={formData.youtubeHandle}
              onChange={(value) => updateFormData("youtubeHandle", value)}
              placeholder="Channel URL or @handle"
            />

            <GlassInput
              label="Personal Website"
              type="url"
              value={formData.personalWebsite}
              onChange={(value) => updateFormData("personalWebsite", value)}
              placeholder="https://yoursite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Content Categories{" "}
              <span style={{ color: "hsl(var(--primary))" }}>*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {creatorCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`
                    px-3 py-2 rounded-lg text-sm transition-all duration-200
                    backdrop-blur-md border interactive-scale
                    ${
                      formData.categories.includes(category)
                        ? "text-purple-300"
                        : "text-white/70 hover:border-white/40 hover:bg-white/10"
                    }
                  `}
                  style={{
                    background: formData.categories.includes(category)
                      ? "hsla(var(--primary), 0.2)"
                      : "hsla(255, 255, 255, 0.05)",
                    borderColor: formData.categories.includes(category)
                      ? "hsl(var(--primary))"
                      : "hsla(255, 255, 255, 0.2)",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-400 text-sm mt-2">{errors.categories}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Languages <span style={{ color: "hsl(var(--primary))" }}>*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableLanguages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`
                    px-3 py-2 rounded-lg text-sm transition-all duration-200
                    backdrop-blur-md border interactive-scale
                    ${
                      formData.languages.includes(language)
                        ? "text-purple-300"
                        : "text-white/70 hover:border-white/40 hover:bg-white/10"
                    }
                  `}
                  style={{
                    background: formData.languages.includes(language)
                      ? "hsla(var(--primary), 0.2)"
                      : "hsla(255, 255, 255, 0.05)",
                    borderColor: formData.languages.includes(language)
                      ? "hsl(var(--primary))"
                      : "hsla(255, 255, 255, 0.2)",
                  }}
                >
                  {language}
                </button>
              ))}
            </div>
            {errors.languages && (
              <p className="text-red-400 text-sm mt-2">{errors.languages}</p>
            )}
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading || isPending}
        className={`
          w-full py-4 rounded-xl font-semibold text-white transition-all duration-300
          backdrop-blur-md focus:ring-2 focus:ring-purple-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 interactive-scale
        `}
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        {isLoading || isPending ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {isPending
              ? "Confirming on Blockchain..."
              : "Preparing Transaction..."}
          </>
        ) : (
          <>
            Register & Join Platform
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
};

export default RegistrationForm;

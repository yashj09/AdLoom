"use client";
import React, { useState } from "react";
import { Loader2, Check, ArrowRight } from "lucide-react";
import GlassInput from "./GlassInput";

interface RegistrationFormProps {
  selectedRole: "brand" | "creator";
}

interface FormData {
  // Brand fields
  companyName: string;
  website: string;
  industry: string;
  contactEmail: string;

  // Creator fields
  username: string;
  displayName: string;
  bio: string;
  twitterHandle: string;
  instagramHandle: string;
  youtubeHandle: string;
  categories: string[];
}

interface FormErrors {
  [key: string]: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedRole,
}) => {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    website: "",
    industry: "",
    contactEmail: "",
    username: "",
    displayName: "",
    bio: "",
    twitterHandle: "",
    instagramHandle: "",
    youtubeHandle: "",
    categories: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (selectedRole === "brand") {
      if (!formData.companyName.trim())
        newErrors.companyName = "Company name is required";
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
      if (formData.categories.length === 0)
        newErrors.categories = "Select at least one category";

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

    // Simulate smart contract interaction
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
      setTimeout(() => {
        console.log("Redirecting to dashboard...", {
          role: selectedRole,
          data: formData,
        });
      }, 1000);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
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
          Your profile is being set up on the blockchain...
        </p>
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
            label="Website"
            type="url"
            value={formData.website}
            onChange={(value) => updateFormData("website", value)}
            placeholder="https://yourcompany.com"
            error={errors.website}
          />

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

          <GlassInput
            label="YouTube Channel"
            value={formData.youtubeHandle}
            onChange={(value) => updateFormData("youtubeHandle", value)}
            placeholder="Channel URL or @handle"
          />

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
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
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
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Registering on Blockchain...
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

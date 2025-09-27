"use client";
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import RoleCard from "@/components/register/RoleCard";
import RegistrationForm from "@/components/register/RegistrationForm";
const page = () => {
  const [selectedRole, setSelectedRole] = useState<"brand" | "creator" | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<
    "registration" | "create-campaign"
  >("registration");
  return (
    <div>
      {" "}
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: "var(--gradient-background)" }}
      >
        {/* Background texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        {/* Gradient orbs for extra depth */}
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ background: "hsl(var(--primary-glow))" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"
          style={{ background: "hsl(var(--accent))" }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Sparkles size={24} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                InfluenceChain
              </h1>
            </div>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join the future of influencer marketing on Web3. Connect,
              collaborate, and earn with transparency.
            </p>

            {/* Demo Navigation */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage("registration")}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentPage === "registration"
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:text-white/80"
                }`}
                style={{
                  background:
                    currentPage === "registration"
                      ? "var(--gradient-primary)"
                      : "hsla(255, 255, 255, 0.1)",
                  boxShadow:
                    currentPage === "registration"
                      ? "var(--shadow-glow)"
                      : "none",
                }}
              >
                Registration
              </button>
              <button
                onClick={() => setCurrentPage("create-campaign")}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white/80 transition-all duration-300"
                style={{
                  background: "hsla(255, 255, 255, 0.05)",
                }}
              >
                Create Campaign
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Side - Role Selection */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Choose Your Role
                </h2>
                <p className="text-white/70">
                  Select how you want to participate in our platform
                </p>
              </div>

              <div className="space-y-4">
                <RoleCard
                  role="brand"
                  title="I'm a Brand"
                  description="Launch campaigns, discover creators, and manage partnerships with transparent blockchain-based contracts."
                  isSelected={selectedRole === "brand"}
                  onSelect={setSelectedRole}
                />

                <RoleCard
                  role="creator"
                  title="I'm a Creator"
                  description="Monetize your content, build authentic partnerships, and get paid instantly through smart contracts."
                  isSelected={selectedRole === "creator"}
                  onSelect={setSelectedRole}
                />
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="glass-card rounded-2xl p-8">
              {selectedRole ? (
                <RegistrationForm selectedRole={selectedRole} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-white/60" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Get Started
                  </h3>
                  <p className="text-white/70">
                    Select your role on the left to begin your registration
                    process
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-white/60">
            <p className="mb-2">Powered by blockchain technology</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>Secure</span>
              <span>•</span>
              <span>Transparent</span>
              <span>•</span>
              <span>Decentralized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

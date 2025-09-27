import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import CampaignForm from "@/components/register/CampaignForm";
const page = () => {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Create Campaign
                </h1>
                <p className="text-white/70">
                  Launch your influencer marketing campaign on Web3
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Form */}
          <div className="max-w-4xl mx-auto">
            <CampaignForm />
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-white/60">
            <p className="mb-2">Secured by smart contracts on the blockchain</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>Transparent</span>
              <span>•</span>
              <span>Automated Payments</span>
              <span>•</span>
              <span>Dispute Resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

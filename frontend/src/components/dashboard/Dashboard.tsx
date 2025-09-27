// frontend/src/components/dashboard/Dashboard.tsx
"use client";
import React, { useMemo } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  useUserProfile,
  useUserCampaigns,
  formatPYUSD,
  useActiveCampaigns,
  transformCampaignData,
} from "@/hooks/useContracts";
import { EarningsHeader } from "./EarningsHeader";
import { PerformanceStats } from "./PerformanceStats";
import { CampaignOpportunities } from "./CampaignOpportunities";
import { RecentActivity } from "./RecentActivity";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

export const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Get user profile data
  const { creatorData, isRegisteredCreator, userType } =
    useUserProfile(address);

  // Get user's campaign submissions
  const { creatorSubmissions } = useUserCampaigns(address);

  // Get available campaign opportunities
  const { campaigns: availableCampaigns, loading: campaignsLoading } =
    useActiveCampaigns(5);

  // Redirect if not connected or not a creator
  React.useEffect(() => {
    if (!isConnected) {
      router.push("/register");
      return;
    }

    if (isConnected && userType !== undefined && userType !== 2) {
      if (userType === 1) {
        router.push("/brand/dashboard");
      } else {
        router.push("/register");
      }
    }
  }, [isConnected, userType, router]);

  // Transform contract data for dashboard components
  const dashboardData = useMemo(() => {
    if (!creatorData || !creatorSubmissions) {
      return null;
    }

    // Calculate earnings data from real contract data
    const totalEarned = parseFloat(
      formatPYUSD((creatorData as any)?.totalEarned || 0)
    );
    const pendingPayment = 0; // TODO: Calculate from pending submissions

    // Performance stats from contract
    const performance = {
      campaignsCompleted: Number((creatorData as any)?.completedCampaigns || 0),
      postsVerified: (creatorSubmissions as any)?.length || 0, // Total submissions
      averageRating: Number((creatorData as any)?.averageRating || 0), // Already in basis points
    };

    // Campaigns are already formatted by the API
    const topCampaigns =
      availableCampaigns?.slice(0, 3)?.map((campaign: any) => ({
        id: campaign.id,
        title: campaign.title,
        brand: campaign.brand,
        reward: campaign.payment,
        deadline: campaign.deadline,
        participants: campaign.participants,
        maxParticipants: campaign.maxParticipants,
        difficulty: campaign.difficulty,
      })) || [];

    const campaigns = {
      availableCount: availableCampaigns?.length || 0,
      topCampaigns,
    };

    // Create activities based on actual submissions
    const activities =
      (creatorSubmissions as any[])?.map(
        (submissionId: bigint, index: number) => ({
          id: submissionId.toString(),
          type: "post_submitted" as const,
          title: "Post Submitted",
          description: `Submission #${submissionId} is under review`,
          timestamp: `${index + 1} day${index === 0 ? "" : "s"} ago`,
          isNew: index < 2,
        })
      ) || [];

    // Add earnings activity if user has earned something
    if (totalEarned > 0) {
      activities.unshift({
        id: "earnings",
        type: "post_submitted" as const, // Using available type
        title: "Total Earnings",
        description: `You've earned ${totalEarned} PYUSD from completed campaigns`,
        timestamp: "Overall",
        isNew: false,
      } as any); // Allow additional properties
    }

    return {
      earnings: { totalEarned, pendingPayment },
      performance,
      campaigns,
      activities,
    };
  }, [creatorData, creatorSubmissions, availableCampaigns]);

  const handleWithdraw = () => {
    // TODO: Implement PYUSD withdrawal
    toast("Withdrawal feature coming soon!");
  };

  const handleBrowseCampaigns = () => {
    router.push("/creator/campaigns");
  };

  // Loading state
  if (!isConnected || userType === undefined || !creatorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-purple-400 mx-auto mb-4"
            size={40}
          />
          <p className="text-white/70">Loading your dashboard...</p>
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
          <h2 className="text-xl font-bold text-white mb-2">Not Registered</h2>
          <p className="text-white/70 mb-6">
            You need to register as a creator to access the dashboard.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Register Now
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-purple-400 mx-auto mb-4"
            size={40}
          />
          <p className="text-white/70">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {(creatorData as any)?.displayName || "Creator"}!
          </h1>
          <p className="text-muted-foreground">
            Track your earnings, performance, and discover new opportunities
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-white/60">
            <span>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <span>•</span>
            <span>@{(creatorData as any)?.username || "username"}</span>
          </div>
        </div>

        {/* Earnings Header */}
        <EarningsHeader
          totalEarned={dashboardData.earnings.totalEarned}
          pendingPayment={dashboardData.earnings.pendingPayment}
          onWithdraw={handleWithdraw}
        />

        {/* Performance Stats */}
        <PerformanceStats
          campaignsCompleted={dashboardData.performance.campaignsCompleted}
          postsVerified={dashboardData.performance.postsVerified}
          averageRating={dashboardData.performance.averageRating}
        />

        {/* Campaign Opportunities */}
        <CampaignOpportunities
          availableCount={dashboardData.campaigns.availableCount}
          topCampaigns={dashboardData.campaigns.topCampaigns}
          onBrowseAll={handleBrowseCampaigns}
        />

        {/* Recent Activity */}
        <RecentActivity activities={dashboardData.activities} />

        {/* Creator Profile Summary */}
        <div className="glass-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Profile Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Total Campaigns</p>
              <p className="text-white font-semibold">
                {dashboardData.performance.campaignsCompleted}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Earned</p>
              <p className="text-white font-semibold">
                ${dashboardData.earnings.totalEarned} PYUSD
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Member Since</p>
              <p className="text-white font-semibold">
                {new Date(
                  Number((creatorData as any)?.registeredAt || 0) * 1000
                ).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Verification Level</p>
              <p className="text-white font-semibold">
                {(creatorData as any)?.verificationLevel === 0
                  ? "Unverified"
                  : (creatorData as any)?.verificationLevel === 1
                  ? "Basic"
                  : (creatorData as any)?.verificationLevel === 2
                  ? "Premium"
                  : "Enterprise"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

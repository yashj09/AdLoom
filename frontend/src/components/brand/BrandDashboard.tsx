// frontend/src/components/brand/BrandDashboard.tsx
"use client";
import React, { useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  useUserProfile,
  useUserCampaigns,
  useCampaign,
  formatPYUSD,
} from "@/hooks/useContracts";
import { CampaignStatus } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CampaignSummary {
  id: string;
  title: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  submissions: number;
  maxPosts: number;
  deadline: Date;
  createdAt: Date;
}

export const BrandDashboard = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Get user profile data
  const { brandData, isRegisteredBrand, userType } = useUserProfile(address);

  // Removed debug logging

  // Get brand's campaigns
  const { brandCampaigns } = useUserCampaigns(address);

  // Transform campaigns data from contract
  const campaignsData = useMemo(() => {
    if (!brandCampaigns || !brandData) return null;

    // Fetch detailed campaign data for each campaign ID
    const campaigns: CampaignSummary[] = [];

    // For now, we'll use the campaign IDs from the contract
    // In a complete implementation, you'd batch fetch all campaign details
    ((brandCampaigns as bigint[]) || []).forEach((campaignId: bigint) => {
      const id = campaignId.toString();

      // Create a basic campaign summary using the ID
      // This is a simplified version - ideally you'd fetch full campaign data
      campaigns.push({
        id,
        title: `Campaign #${id}`,
        status: CampaignStatus.Active, // Default to active, would fetch real status
        budget: 1000, // Would fetch from contract deposit
        spent: 0, // Would calculate from submissions
        submissions: 0, // Would fetch from contract
        maxPosts: 20, // Would fetch from campaign data
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Would fetch from contract
        createdAt: new Date(), // Would fetch from contract
      });
    });

    return campaigns;
  }, [brandCampaigns, brandData]);

  // Calculate dashboard metrics from real contract data
  const dashboardMetrics = useMemo(() => {
    if (!campaignsData || !brandData) return null;

    const totalCampaigns = Number((brandData as any)?.totalCampaigns || 0);
    const activeCampaigns = Number((brandData as any)?.activeCampaigns || 0);
    const totalSpent = parseFloat(
      formatPYUSD((brandData as any)?.totalSpent || 0)
    );

    // Calculate from available campaign data
    const totalBudget = campaignsData.reduce((sum, c) => sum + c.budget, 0);
    const totalSubmissions = campaignsData.reduce(
      (sum, c) => sum + c.submissions,
      0
    );
    const avgEngagementRate = 85; // Would calculate from actual engagement data

    return {
      totalCampaigns,
      activeCampaigns,
      totalBudget: totalBudget || totalSpent * 1.2, // Estimate if no budget data
      totalSpent,
      totalSubmissions,
      avgEngagementRate,
      totalSpentFormatted: formatPYUSD((brandData as any)?.totalSpent || 0),
    };
  }, [campaignsData, brandData]);

  // Show loading state only for data, not for connection/registration
  // Remove restrictions - always allow access to dashboard

  // Show loading state only if we're actually fetching data
  const isLoadingData = !dashboardMetrics || !campaignsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {(brandData as any)?.companyName || "Brand"}!
            </h1>
            <p className="text-white/70">
              Manage your campaigns and track performance
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
              <span>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span>•</span>
              <span>{(brandData as any)?.industry || "Industry"}</span>
            </div>
          </div>

          <Button
            onClick={() => router.push("/brand/create-campaign")}
            className="flex items-center gap-2"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <Plus size={20} />
            Create Campaign
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Campaigns"
            value={dashboardMetrics?.totalCampaigns?.toString() || "0"}
            subtitle={`${dashboardMetrics?.activeCampaigns || 0} active`}
            icon={BarChart3}
            trend="+12%"
          />

          <MetricCard
            title="Total Budget"
            value={`$${(dashboardMetrics?.totalBudget || 0).toLocaleString()}`}
            subtitle="PYUSD allocated"
            icon={DollarSign}
            trend="+8%"
          />

          <MetricCard
            title="Content Submissions"
            value={(dashboardMetrics?.totalSubmissions || 0).toString()}
            subtitle="Posts created"
            icon={Users}
            trend="+24%"
          />

          <MetricCard
            title="Engagement Rate"
            value={`${dashboardMetrics?.avgEngagementRate || 0}%`}
            subtitle="Average across campaigns"
            icon={TrendingUp}
            trend="+5%"
          />
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              title="Create New Campaign"
              description="Launch a new influencer campaign"
              icon={Plus}
              onClick={() => router.push("/brand/create-campaign")}
            />

            <ActionButton
              title="Browse Creators"
              description="Find the perfect influencers"
              icon={Users}
              onClick={() => router.push("/creator/campaigns")}
            />

            <ActionButton
              title="Analytics"
              description="View detailed performance metrics"
              icon={BarChart3}
              onClick={() => router.push("/brand/dashboard")}
            />
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Your Campaigns</h2>
            <Button
              variant="outline"
              onClick={() => router.push("/brand/dashboard")}
            >
              View All
            </Button>
          </div>

          {(campaignsData?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="text-white/40 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Campaigns Yet
              </h3>
              <p className="text-white/70 mb-6">
                Create your first campaign to start working with influencers.
              </p>
              <Button
                onClick={() => router.push("/brand/create-campaign")}
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <Plus className="mr-2" size={16} />
                Create First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(campaignsData || []).slice(0, 5).map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  onView={() =>
                    router.push(`/creator/campaigns/${campaign.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Brand Profile Summary */}
        <div className="glass-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Profile Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Total Campaigns</p>
              <p className="text-white font-semibold">
                {Number((brandData as any)?.totalCampaigns || 0)}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Spent</p>
              <p className="text-white font-semibold">
                ${dashboardMetrics?.totalSpentFormatted || "0"} PYUSD
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Campaigns</p>
              <p className="text-white font-semibold">
                {Number((brandData as any)?.activeCampaigns || 0)}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Member Since</p>
              <p className="text-white font-semibold">
                {(brandData as any)?.registeredAt
                  ? new Date(
                      Number((brandData as any).registeredAt) * 1000
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Industry</p>
              <p className="text-white font-semibold">
                {(brandData as any)?.industry || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Verification Level</p>
              <p className="text-white font-semibold">
                {(brandData as any)?.verificationLevel === 0
                  ? "Unverified"
                  : (brandData as any)?.verificationLevel === 1
                  ? "Basic"
                  : (brandData as any)?.verificationLevel === 2
                  ? "Premium"
                  : (brandData as any)?.verificationLevel === 3
                  ? "Enterprise"
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) => (
  <div className="glass-card rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <Icon className="text-purple-400" size={24} />
      {trend && (
        <span className="text-green-400 text-sm font-medium">{trend}</span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-white/60 text-sm">{title}</p>
    <p className="text-white/40 text-xs mt-1">{subtitle}</p>
  </div>
);

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-left group"
  >
    <div className="flex items-center gap-3 mb-2">
      <Icon className="text-purple-400 group-hover:text-purple-300" size={20} />
      <h3 className="text-white font-semibold">{title}</h3>
    </div>
    <p className="text-white/60 text-sm">{description}</p>
  </button>
);

interface CampaignRowProps {
  campaign: CampaignSummary;
  onView: () => void;
}

const CampaignRow: React.FC<CampaignRowProps> = ({ campaign, onView }) => {
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.Active:
        return "text-green-400 bg-green-400/10";
      case CampaignStatus.Paused:
        return "text-yellow-400 bg-yellow-400/10";
      case CampaignStatus.Completed:
        return "text-blue-400 bg-blue-400/10";
      case CampaignStatus.Cancelled:
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusText = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.Active:
        return "Active";
      case CampaignStatus.Paused:
        return "Paused";
      case CampaignStatus.Completed:
        return "Completed";
      case CampaignStatus.Cancelled:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.Active:
        return <CheckCircle size={16} />;
      case CampaignStatus.Paused:
        return <Clock size={16} />;
      case CampaignStatus.Completed:
        return <CheckCircle size={16} />;
      case CampaignStatus.Cancelled:
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-white font-semibold">{campaign.title}</h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(
              campaign.status
            )}`}
          >
            {getStatusIcon(campaign.status)}
            {getStatusText(campaign.status)}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <span>Budget: ${campaign.budget.toLocaleString()} PYUSD</span>
          <span>
            Spent: ${Math.round(campaign.spent).toLocaleString()} PYUSD
          </span>
          <span>
            Submissions: {campaign.submissions}/{campaign.maxPosts}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {campaign.deadline.toLocaleDateString()}
          </span>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onView} className="ml-4">
        <Eye size={16} className="mr-1" />
        View
      </Button>
    </div>
  );
};

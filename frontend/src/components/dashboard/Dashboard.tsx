import { EarningsHeader } from "./EarningsHeader";
import { PerformanceStats } from "./PerformanceStats";
import { CampaignOpportunities } from "./CampaignOpportunities";
import { RecentActivity } from "./RecentActivity";
import { toast } from "sonner";
// Mock data - In a real app, this would come from APIs
const mockData = {
  earnings: {
    totalEarned: 12847.65,
    pendingPayment: 234.5,
  },
  performance: {
    campaignsCompleted: 28,
    postsVerified: 156,
    averageRating: 9250, // 92.5% in basis points
  },
  campaigns: {
    availableCount: 47,
    topCampaigns: [
      {
        id: "1",
        title: "Summer Fashion Collection",
        brand: "StyleCo",
        reward: 250,
        deadline: "3 days left",
        participants: 45,
        maxParticipants: 100,
        difficulty: "Easy" as const,
      },
      {
        id: "2",
        title: "Tech Product Review",
        brand: "TechCorp",
        reward: 500,
        deadline: "1 week left",
        participants: 23,
        maxParticipants: 50,
        difficulty: "Medium" as const,
      },
      {
        id: "3",
        title: "Luxury Watch Showcase",
        brand: "TimeKeeper",
        reward: 750,
        deadline: "5 days left",
        participants: 12,
        maxParticipants: 25,
        difficulty: "Hard" as const,
      },
    ],
  },
  activities: [
    {
      id: "1",
      type: "payment_received" as const,
      title: "Payment Received",
      description: "StyleCo campaign payment processed",
      timestamp: "2 min ago",
      amount: 250,
      isNew: true,
    },
    {
      id: "2",
      type: "post_verified" as const,
      title: "Post Verification",
      description: "Your tech review post has been approved",
      timestamp: "1 hour ago",
      status: "approved" as const,
      isNew: true,
    },
    {
      id: "3",
      type: "campaign_matched" as const,
      title: "New Campaign Match",
      description: "You qualify for the Fitness Gear campaign",
      timestamp: "3 hours ago",
      isNew: false,
    },
    {
      id: "4",
      type: "post_submitted" as const,
      title: "Post Submitted",
      description: "Fashion showcase post submitted for review",
      timestamp: "1 day ago",
      status: "pending" as const,
      isNew: false,
    },
    {
      id: "5",
      type: "post_verified" as const,
      title: "Post Verification",
      description: "Travel content post was rejected - needs better lighting",
      timestamp: "2 days ago",
      status: "rejected" as const,
      isNew: false,
    },
  ],
};

export const Dashboard = () => {
  const handleWithdraw = () => {
    toast("Withdrawal Initiated");
  };

  const handleBrowseCampaigns = () => {
    // Navigate to campaign browse page instead of showing toast
    window.location.href = "/campaigns";
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your earnings, performance, and discover new opportunities
          </p>
        </div>

        {/* Earnings Header */}
        <EarningsHeader
          totalEarned={mockData.earnings.totalEarned}
          pendingPayment={mockData.earnings.pendingPayment}
          onWithdraw={handleWithdraw}
        />

        {/* Performance Stats */}
        <PerformanceStats
          campaignsCompleted={mockData.performance.campaignsCompleted}
          postsVerified={mockData.performance.postsVerified}
          averageRating={mockData.performance.averageRating}
        />

        {/* Campaign Opportunities */}
        <CampaignOpportunities
          availableCount={mockData.campaigns.availableCount}
          topCampaigns={mockData.campaigns.topCampaigns}
          onBrowseAll={handleBrowseCampaigns}
        />

        {/* Recent Activity */}
        <RecentActivity activities={mockData.activities} />
      </div>
    </div>
  );
};

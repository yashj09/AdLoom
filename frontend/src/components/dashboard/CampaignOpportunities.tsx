import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, DollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
interface Campaign {
  id: string;
  title: string;
  brand: string;
  reward: number;
  deadline: string;
  participants: number;
  maxParticipants: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface CampaignOpportunitiesProps {
  availableCount: number;
  topCampaigns: Campaign[];
  onBrowseAll: () => void;
}

const DifficultyBadge = ({
  difficulty,
}: {
  difficulty: Campaign["difficulty"];
}) => {
  const variants = {
    Easy: "bg-success/10 text-success border-success/30",
    Medium: "bg-warning/10 text-warning border-warning/30",
    Hard: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <Badge variant="outline" className={variants[difficulty]}>
      {difficulty}
    </Badge>
  );
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const participationRate =
    (campaign.participants / campaign.maxParticipants) * 100;

  return (
    <div className="glass-card glass-card-hover rounded-lg p-4 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {campaign.title}
          </h4>
          <p className="text-sm text-muted-foreground">{campaign.brand}</p>
        </div>
        <DifficultyBadge difficulty={campaign.difficulty} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="font-medium">${campaign.reward}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{campaign.deadline}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {campaign.participants}/{campaign.maxParticipants} participants
          </span>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${participationRate}%` }}
        />
      </div>

      <Button variant="outline" size="sm" className="w-full interactive-scale">
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Button>
    </div>
  );
};

export const CampaignOpportunities = ({
  availableCount,
  topCampaigns,
}: CampaignOpportunitiesProps) => {
  const router = useRouter();

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Campaign Opportunities
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-primary">{availableCount}</span>{" "}
            available campaigns
          </p>
        </div>

        <Button
          onClick={() => router.push("/creator/campaigns")}
          className="interactive-scale"
        >
          Browse All Campaigns
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

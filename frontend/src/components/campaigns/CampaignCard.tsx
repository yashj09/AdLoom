import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  DollarSign,
  Users,
  MapPin,
  Star,
  Eye,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  description: string;
  payment: number;
  currency: "PYUSD" | "USD";
  deadline: string;
  location?: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  requirements: {
    minFollowers: number;
    platforms: string[];
    contentType: string[];
  };
  matchScore: number; // 0-100
  participants: number;
  maxParticipants: number;
  status: "Open" | "Closing Soon" | "Full";
  postedDate: string;
  engagement: {
    views?: number;
    applications: number;
  };
}

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (campaignId: string) => void;
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

const StatusBadge = ({ status }: { status: Campaign["status"] }) => {
  const variants = {
    Open: "bg-success/10 text-success border-success/30",
    "Closing Soon": "bg-warning/10 text-warning border-warning/30",
    Full: "bg-muted/20 text-muted-foreground border-muted/30",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status}
    </Badge>
  );
};

const MatchScore = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-2">
      <Target className={`h-4 w-4 ${getColor(score)}`} />
      <span className={`text-sm font-medium ${getColor(score)}`}>
        {score}% Match
      </span>
    </div>
  );
};

export const CampaignCard = ({
  campaign,
  onViewDetails,
}: CampaignCardProps) => {
  const participationRate =
    (campaign.participants / campaign.maxParticipants) * 100;
  const formatFollowers = (count: number) =>
    count >= 1000000
      ? `${(count / 1000000).toFixed(1)}M`
      : count >= 1000
      ? `${(count / 1000).toFixed(0)}K`
      : count.toString();

  return (
    <div className="glass-card glass-card-hover rounded-lg p-6 cursor-pointer group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-purple-900 group-hover:text-primary transition-colors line-clamp-1">
              {campaign.title}
            </h3>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-purple-700 mb-1">{campaign.brand}</p>
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <Calendar className="h-3 w-3" />
            <span>Posted {campaign.postedDate}</span>
          </div>
        </div>
        <DifficultyBadge difficulty={campaign.difficulty} />
      </div>

      {/* Description */}
      <p className="text-sm text-purple-700 mb-4 line-clamp-2">
        {campaign.description}
      </p>

      {/* Payment & Match Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-purple-900">
            ${campaign.payment.toLocaleString()}
          </span>
          <span className="text-sm text-purple-600">{campaign.currency}</span>
        </div>
        <MatchScore score={campaign.matchScore} />
      </div>

      {/* Requirements Preview */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <span className="text-purple-600">
            {formatFollowers(campaign.requirements.minFollowers)}+ followers
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          <span className="text-purple-600">{campaign.deadline}</span>
        </div>
        {campaign.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-purple-600">{campaign.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-purple-600" />
          <span className="text-purple-600">
            {campaign.engagement.applications} applied
          </span>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex flex-wrap gap-1 mb-4">
        {campaign.requirements.platforms.slice(0, 3).map((platform) => (
          <Badge key={platform} variant="secondary" className="text-xs">
            {platform}
          </Badge>
        ))}
        {campaign.requirements.platforms.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{campaign.requirements.platforms.length - 3} more
          </Badge>
        )}
      </div>

      {/* Progress & Action */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-purple-600 mb-1">
            <span>Applications</span>
            <span>
              {campaign.participants}/{campaign.maxParticipants}
            </span>
          </div>
          <Progress value={participationRate} className="h-1.5" />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full interactive-scale border-purple-400 text-purple-900 hover:bg-purple-100"
          onClick={() => onViewDetails(campaign.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Camera,
  Award,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "post_submitted"
    | "payment_received"
    | "campaign_matched"
    | "post_verified";
  title: string;
  description: string;
  timestamp: string;
  status?: "pending" | "approved" | "rejected";
  amount?: number;
  isNew?: boolean;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ActivityIcon = ({
  type,
  status,
}: {
  type: ActivityItem["type"];
  status?: ActivityItem["status"];
}) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case "post_submitted":
      return <Camera className={iconClass} />;
    case "payment_received":
      return <DollarSign className={`${iconClass} text-success`} />;
    case "campaign_matched":
      return <Award className={`${iconClass} text-primary`} />;
    case "post_verified":
      if (status === "approved")
        return <CheckCircle className={`${iconClass} text-success`} />;
      if (status === "rejected")
        return <XCircle className={`${iconClass} text-destructive`} />;
      return <Clock className={`${iconClass} text-warning`} />;
    default:
      return <Clock className={iconClass} />;
  }
};

const StatusBadge = ({ status }: { status?: ActivityItem["status"] }) => {
  if (!status) return null;

  const statusConfig = {
    pending: { class: "status-pending", label: "Pending" },
    approved: { class: "status-approved", label: "Approved" },
    rejected: { class: "status-rejected", label: "Rejected" },
  };

  const config = statusConfig[status];
  return <span className={config.class}>{config.label}</span>;
};

const ActivityCard = ({ activity }: { activity: ActivityItem }) => {
  return (
    <div
      className={`glass-card rounded-lg p-4 ${
        activity.isNew ? "pulse-new" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted/50 backdrop-blur-sm">
          <ActivityIcon type={activity.type} status={activity.status} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-foreground truncate">
              {activity.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {activity.timestamp}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {activity.description}
          </p>

          <div className="flex items-center justify-between">
            <StatusBadge status={activity.status} />

            {activity.amount && (
              <span className="text-sm font-semibold text-success">
                +${activity.amount.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30"
        >
          {activities.filter((a) => a.isNew).length} New
        </Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { Skeleton } from "@/components/ui/skeleton";

export const CampaignCardSkeleton = () => {
  return (
    <div className="glass-card rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Description */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />

      {/* Payment & Match */}
      <div className="flex justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Platforms */}
      <div className="flex gap-1 mb-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>

      {/* Progress */}
      <Skeleton className="h-2 w-full mb-3" />

      {/* Button */}
      <Skeleton className="h-8 w-full" />
    </div>
  );
};

export const CampaignGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CampaignCardSkeleton key={index} />
      ))}
    </div>
  );
};

// frontend/src/components/campaigns/CampaignBrowse.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  useCampaignManager,
  useUserProfile,
  useCampaign,
  formatPYUSD,
  useActiveCampaigns,
  transformCampaignData,
} from "@/hooks/useContracts";
import { useReadContract } from "wagmi";
import {
  CONTRACT_ADDRESSES,
  CampaignStatus,
  CATEGORY_OPTIONS,
} from "@/lib/contracts";
import { SearchHeader } from "@/components/campaigns/SearchHeader";
import { FilterSidebar } from "@/components/campaigns/FilterSidebar";
import {
  CampaignCard,
  type Campaign,
} from "@/components/campaigns/CampaignCard";
import { Pagination } from "@/components/campaigns/Pagination";
import { CampaignGridSkeleton } from "@/components/campaigns/CampaignSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Import campaign manager ABI
import CampaignManagerABI from "@/abis/CampaignManager.json";

interface FilterState {
  search: string;
  category: string;
  difficulty: string;
  location: string;
  minReward: number;
  maxReward: number;
  sortBy: string;
}

const initialFilters: FilterState = {
  search: "",
  category: "",
  difficulty: "",
  location: "",
  minReward: 0,
  maxReward: 10000,
  sortBy: "newest",
};

export const CampaignBrowse = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isRegisteredCreator } = useUserProfile(address);
  const { acceptCampaign, isPending, isSuccess } = useCampaignManager();

  // Use the new hook to get active campaigns from the contract
  const {
    campaigns: contractCampaigns,
    loading: isLoading,
    totalCampaigns,
  } = useActiveCampaigns(50);

  // The campaigns are already transformed by the API, so we can use them directly
  const campaigns = contractCampaigns || [];

  // Remove the mock data and transformation function - now handled by the hook

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      if (
        filters.search &&
        !campaign.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !campaign.brand.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(campaign.category)
      ) {
        return false;
      }

      if (filters.difficulty && campaign.difficulty !== filters.difficulty) {
        return false;
      }

      if (
        campaign.payment < filters.minReward ||
        campaign.payment > filters.maxReward
      ) {
        return false;
      }

      return true;
    });
  }, [campaigns, filters, selectedCategories]);

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle campaign acceptance
  const handleAcceptCampaign = async (campaignId: string) => {
    if (!isConnected || !isRegisteredCreator) {
      toast.error("Please connect wallet and register as creator first");
      return;
    }

    try {
      await acceptCampaign(parseInt(campaignId));
      toast.success("Campaign accepted! You can now submit content.");
    } catch (error: any) {
      console.error("Failed to accept campaign:", error);
      toast.error(error.message || "Failed to accept campaign");
    }
  };

  // Check authentication
  useEffect(() => {
    if (!isConnected) {
      router.push("/register");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-white/70 mb-6">
            Please connect your wallet to browse campaigns.
          </p>
          <Button onClick={() => router.push("/register")}>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Campaign Opportunities
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover campaigns that match your profile and start earning
            </p>
          </div>
        </div>

        {/* Search Header */}
        <SearchHeader
          searchQuery={filters.search}
          onSearchChange={(search) =>
            setFilters((prev) => ({ ...prev, search }))
          }
          resultsCount={filteredCampaigns.length}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
          onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
          showMobileFilters={isFilterOpen}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar
              paymentRange={[filters.minReward, filters.maxReward]}
              onPaymentRangeChange={([min, max]) =>
                setFilters((prev) => ({
                  ...prev,
                  minReward: min,
                  maxReward: max,
                }))
              }
              selectedCategories={selectedCategories}
              onCategoryChange={(category, checked) =>
                setSelectedCategories((prev) =>
                  checked
                    ? [...prev, category]
                    : prev.filter((c) => c !== category)
                )
              }
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              minFollowers={0}
              onMinFollowersChange={() => {}}
              onClearFilters={() => {
                setFilters(initialFilters);
                setSelectedCategories([]);
                setDateRange({});
              }}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>

          {/* Campaign Grid */}
          <div className="flex-1">
            {isLoading ? (
              <CampaignGridSkeleton />
            ) : paginatedCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle
                  className="text-muted-foreground mx-auto mb-4"
                  size={48}
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Campaigns Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or check back later for new
                  opportunities.
                </p>
                <Button
                  onClick={() => setFilters(initialFilters)}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedCampaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewDetails={(campaignId) =>
                        router.push(`/creator/submit/${campaignId}`)
                      }
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

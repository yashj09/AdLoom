"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchHeader } from "@/components/campaigns/SearchHeader";
import { FilterSidebar } from "@/components/campaigns/FilterSidebar";
import {
  CampaignCard,
  type Campaign,
} from "@/components/campaigns/CampaignCard";
import { Pagination } from "@/components/campaigns/Pagination";
import { CampaignGridSkeleton } from "@/components/campaigns/CampaignSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Mock campaign data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Summer Fashion Collection Launch",
    brand: "StyleCo",
    description:
      "Showcase our new summer collection with vibrant photos and styling tips. Perfect for fashion influencers who love bold colors and trendy outfits.",
    payment: 750,
    currency: "PYUSD",
    deadline: "5 days left",
    location: "Remote",
    category: "Fashion & Beauty",
    difficulty: "Easy",
    requirements: {
      minFollowers: 10000,
      platforms: ["Instagram", "TikTok", "Pinterest"],
      contentType: ["Photo", "Story", "Reel"],
    },
    matchScore: 92,
    participants: 45,
    maxParticipants: 100,
    status: "Open",
    postedDate: "2 days ago",
    engagement: {
      views: 12500,
      applications: 45,
    },
  },
  {
    id: "2",
    title: "Revolutionary Smart Watch Review",
    brand: "TechCorp",
    description:
      "Comprehensive review of our latest smartwatch featuring health tracking, fitness monitoring, and lifestyle integration.",
    payment: 1200,
    currency: "PYUSD",
    deadline: "1 week left",
    location: "San Francisco, CA",
    category: "Technology",
    difficulty: "Medium",
    requirements: {
      minFollowers: 50000,
      platforms: ["YouTube", "Instagram", "Twitter"],
      contentType: ["Video", "Unboxing", "Review"],
    },
    matchScore: 85,
    participants: 23,
    maxParticipants: 50,
    status: "Open",
    postedDate: "1 week ago",
    engagement: {
      views: 8900,
      applications: 23,
    },
  },
  {
    id: "3",
    title: "Luxury Travel Experience Documentation",
    brand: "ExploreMore",
    description:
      "Document an exclusive 5-day luxury resort experience in Maldives. Create content that inspires wanderlust and showcases premium travel.",
    payment: 2500,
    currency: "PYUSD",
    deadline: "3 days left",
    location: "Maldives",
    category: "Travel & Lifestyle",
    difficulty: "Hard",
    requirements: {
      minFollowers: 100000,
      platforms: ["Instagram", "YouTube", "Blog"],
      contentType: ["Video", "Photo", "Blog Post"],
    },
    matchScore: 78,
    participants: 12,
    maxParticipants: 25,
    status: "Closing Soon",
    postedDate: "5 days ago",
    engagement: {
      views: 15600,
      applications: 12,
    },
  },
  {
    id: "4",
    title: "Organic Skincare Routine Challenge",
    brand: "NaturalGlow",
    description:
      "Try our 30-day organic skincare routine and document your journey. Share before/after results and daily skincare tips.",
    payment: 400,
    currency: "PYUSD",
    deadline: "2 weeks left",
    category: "Fashion & Beauty",
    difficulty: "Easy",
    requirements: {
      minFollowers: 5000,
      platforms: ["Instagram", "TikTok"],
      contentType: ["Story", "Reel", "Photo"],
    },
    matchScore: 88,
    participants: 78,
    maxParticipants: 150,
    status: "Open",
    postedDate: "3 days ago",
    engagement: {
      applications: 78,
    },
  },
  {
    id: "5",
    title: "Gaming Setup Showcase",
    brand: "GameRig Pro",
    description:
      "Build and showcase the ultimate gaming setup using our latest components. Create content for fellow gamers and tech enthusiasts.",
    payment: 900,
    currency: "PYUSD",
    deadline: "1 week left",
    category: "Gaming",
    difficulty: "Medium",
    requirements: {
      minFollowers: 25000,
      platforms: ["Twitch", "YouTube", "Instagram"],
      contentType: ["Stream", "Video", "Photo"],
    },
    matchScore: 91,
    participants: 34,
    maxParticipants: 60,
    status: "Open",
    postedDate: "4 days ago",
    engagement: {
      applications: 34,
    },
  },
  {
    id: "6",
    title: "Healthy Meal Prep Series",
    brand: "NutriLife",
    description:
      "Create a week-long healthy meal prep series using our organic ingredients and meal planning guides.",
    payment: 550,
    currency: "PYUSD",
    deadline: "10 days left",
    category: "Food & Beverage",
    difficulty: "Easy",
    requirements: {
      minFollowers: 8000,
      platforms: ["Instagram", "TikTok", "Pinterest"],
      contentType: ["Video", "Recipe", "Photo"],
    },
    matchScore: 83,
    participants: 67,
    maxParticipants: 80,
    status: "Open",
    postedDate: "1 day ago",
    engagement: {
      applications: 67,
    },
  },
];

const ITEMS_PER_PAGE = 9;

const CampaignBrowse = () => {
  const router = useRouter();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match_desc");
  const [paymentRange, setPaymentRange] = useState<[number, number]>([
    50, 5000,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [minFollowers, setMinFollowers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search logic
  const filteredCampaigns = useMemo(() => {
    let filtered = mockCampaigns.filter((campaign) => {
      // Search filter
      const searchTerms = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        campaign.title.toLowerCase().includes(searchTerms) ||
        campaign.brand.toLowerCase().includes(searchTerms) ||
        campaign.description.toLowerCase().includes(searchTerms) ||
        campaign.category.toLowerCase().includes(searchTerms);

      // Payment range filter
      const matchesPayment =
        campaign.payment >= paymentRange[0] &&
        campaign.payment <= paymentRange[1];

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(campaign.category);

      // Followers filter
      const matchesFollowers =
        campaign.requirements.minFollowers >= minFollowers;

      return (
        matchesSearch && matchesPayment && matchesCategory && matchesFollowers
      );
    });

    // Sort logic
    switch (sortBy) {
      case "payment_desc":
        filtered.sort((a, b) => b.payment - a.payment);
        break;
      case "payment_asc":
        filtered.sort((a, b) => a.payment - b.payment);
        break;
      case "match_desc":
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case "deadline_asc":
        filtered.sort((a, b) => {
          const getDeadlineDays = (deadline: string) => {
            const match = deadline.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          return getDeadlineDays(a.deadline) - getDeadlineDays(b.deadline);
        });
        break;
      case "newest":
        filtered.sort((a, b) => {
          const getDaysAgo = (posted: string) => {
            const match = posted.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          return getDaysAgo(a.postedDate) - getDaysAgo(b.postedDate);
        });
        break;
    }

    return filtered;
  }, [searchQuery, sortBy, paymentRange, selectedCategories, minFollowers]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setPaymentRange([50, 5000]);
    setSelectedCategories([]);
    setDateRange({});
    setMinFollowers(0);
    setCurrentPage(1);
  };

  const handleViewDetails = (campaignId: string) => {
    toast(`Opening detailed view for campaign ${campaignId}...`);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    sortBy,
    paymentRange,
    selectedCategories,
    dateRange,
    minFollowers,
  ]);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(280, 40%, 75%), hsl(270, 35%, 80%))",
      }}
    >
      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Gradient orbs for extra depth */}
      <div
        className="absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{ background: "hsl(var(--primary-glow))" }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"
        style={{ background: "hsl(var(--accent))" }}
      ></div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-purple-900 hover:text-purple-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Search Header */}
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultsCount={filteredCampaigns.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onToggleFilters={() => setShowMobileFilters(!showMobileFilters)}
            showMobileFilters={showMobileFilters}
          />

          <div className="flex gap-8">
            {/* Unified Filter Sidebar (Desktop) */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <FilterSidebar
                paymentRange={paymentRange}
                onPaymentRangeChange={setPaymentRange}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                minFollowers={minFollowers}
                onMinFollowersChange={setMinFollowers}
                onClearFilters={handleClearFilters}
                isOpen={false}
                onClose={() => {}}
              />
            </div>

            {/* Mobile Filter Sidebar Overlay */}
            {showMobileFilters && (
              <FilterSidebar
                paymentRange={paymentRange}
                onPaymentRangeChange={setPaymentRange}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                minFollowers={minFollowers}
                onMinFollowersChange={setMinFollowers}
                onClearFilters={handleClearFilters}
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
              />
            )}

            {/* Campaign Grid */}
            <div className="flex-1">
              {isLoading ? (
                <CampaignGridSkeleton count={9} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedCampaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && filteredCampaigns.length === 0 && (
                <div className="glass-card rounded-lg p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      No campaigns found
                    </h3>
                    <p className="text-purple-700 mb-4">
                      Try adjusting your search criteria or filters to find more
                      campaigns.
                    </p>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="border-purple-400 text-purple-900 hover:bg-purple-200"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && filteredCampaigns.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBrowse;

import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onToggleFilters: () => void;
  showMobileFilters: boolean;
}

export const SearchHeader = ({
  searchQuery,
  onSearchChange,
  resultsCount,
  sortBy,
  onSortChange,
  onToggleFilters,
  showMobileFilters,
}: SearchHeaderProps) => {
  return (
    <div className="glass-card rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Available Campaigns
          </h1>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns, brands, or keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 glass-card border-white/20 bg-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{resultsCount}</span>
            <span>campaigns found</span>
          </div>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40 glass-card border-white/20 bg-white/10 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-md border-white/20">
              <SelectItem value="payment_desc">Highest Payment</SelectItem>
              <SelectItem value="payment_asc">Lowest Payment</SelectItem>
              <SelectItem value="deadline_asc">Deadline Soon</SelectItem>
              <SelectItem value="match_desc">Best Match</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="lg:hidden glass-card border-white/20 bg-white/10"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

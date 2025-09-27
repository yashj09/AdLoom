import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Users, DollarSign, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  paymentRange: [number, number];
  onPaymentRangeChange: (range: [number, number]) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  minFollowers: number;
  onMinFollowersChange: (followers: number) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Fashion & Beauty",
  "Technology",
  "Food & Beverage",
  "Travel & Lifestyle",
  "Fitness & Health",
  "Gaming",
  "Home & Garden",
  "Automotive",
  "Entertainment",
  "Education",
];

export const FilterSidebar = ({
  paymentRange,
  onPaymentRangeChange,
  selectedCategories,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  minFollowers,
  onMinFollowersChange,
  onClearFilters,
  isOpen,
  onClose,
}: FilterSidebarProps) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatFollowers = (value: number) =>
    value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `${(value / 1000).toFixed(0)}K`
      : value.toString();

  const activeFiltersCount =
    (paymentRange[0] > 50 || paymentRange[1] < 5000 ? 1 : 0) +
    selectedCategories.length +
    (dateRange.from || dateRange.to ? 1 : 0) +
    (minFollowers > 0 ? 1 : 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={cn(
          "glass-card rounded-lg p-6 space-y-6 transition-transform duration-300",
          "lg:sticky lg:top-6 lg:h-fit",
          isOpen
            ? "fixed top-4 left-4 right-4 z-50 lg:relative lg:top-auto lg:left-auto lg:right-auto"
            : "hidden lg:block"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-purple-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-purple-700 hover:text-purple-900"
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-purple-700 hover:text-purple-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Payment Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <label className="text-sm font-medium text-purple-900">
              Payment Range (PYUSD)
            </label>
          </div>
          <Slider
            value={paymentRange}
            onValueChange={(value) =>
              onPaymentRangeChange(value as [number, number])
            }
            max={5000}
            min={50}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-purple-600">
            <span>{formatCurrency(paymentRange[0])}</span>
            <span>{formatCurrency(paymentRange[1])}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-purple-900">
            Categories
          </label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-3">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) =>
                    onCategoryChange(category, !!checked)
                  }
                />
                <label
                  htmlFor={category}
                  className="text-sm text-purple-800 cursor-pointer flex-1 hover:text-primary transition-colors"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <label className="text-sm font-medium text-purple-900">
              Deadline Range
            </label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal glass-card border-purple/30 bg-purple/10 text-purple-900",
                  !dateRange.from && !dateRange.to && "text-purple-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick deadline range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-card/95 backdrop-blur-md border-white/20"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={
                  dateRange.from && dateRange.to
                    ? { from: dateRange.from, to: dateRange.to }
                    : undefined
                }
                onSelect={(range) => onDateRangeChange(range || {})}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Minimum Followers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <label className="text-sm font-medium text-purple-900">
              Minimum Followers
            </label>
          </div>
          <Slider
            value={[minFollowers]}
            onValueChange={(value) => onMinFollowersChange(value[0])}
            max={10000000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="text-xs text-center">
            <span className="text-purple-600">Current: </span>
            <span className="font-medium text-purple-900">
              {formatFollowers(minFollowers)} followers
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

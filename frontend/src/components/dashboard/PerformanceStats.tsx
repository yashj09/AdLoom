"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle, Star } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

const StatCard = ({
  icon,
  label,
  value,
  suffix = "",
  delay = 0,
}: StatCardProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 40;
      const increment = value / steps;

      let currentStep = 0;
      const counter = setInterval(() => {
        currentStep++;
        setAnimatedValue(Math.min(increment * currentStep, value));

        if (currentStep >= steps) {
          clearInterval(counter);
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="glass-card glass-card-hover rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground counter-animate">
          {Math.round(animatedValue).toLocaleString()}
          {suffix}
        </p>
      </div>
    </div>
  );
};

interface PerformanceStatsProps {
  campaignsCompleted: number;
  postsVerified: number;
  averageRating: number; // in basis points (e.g., 9250 = 92.5%)
}

export const PerformanceStats = ({
  campaignsCompleted,
  postsVerified,
  averageRating,
}: PerformanceStatsProps) => {
  const ratingPercentage = averageRating / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<Trophy className="h-5 w-5 text-primary" />}
        label="Campaigns Completed"
        value={campaignsCompleted}
        delay={0}
      />

      <StatCard
        icon={<CheckCircle className="h-5 w-5 text-success" />}
        label="Posts Verified"
        value={postsVerified}
        delay={200}
      />

      <StatCard
        icon={<Star className="h-5 w-5 text-warning" />}
        label="Average Rating"
        value={ratingPercentage}
        suffix="%"
        delay={400}
      />
    </div>
  );
};

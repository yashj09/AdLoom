"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp } from "lucide-react";

interface EarningsHeaderProps {
  totalEarned: number;
  pendingPayment: number;
  onWithdraw?: () => void;
}

export const EarningsHeader = ({
  totalEarned,
  pendingPayment,
  onWithdraw,
}: EarningsHeaderProps) => {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedPending, setAnimatedPending] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const totalIncrement = totalEarned / steps;
    const pendingIncrement = pendingPayment / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedTotal(Math.min(totalIncrement * currentStep, totalEarned));
      setAnimatedPending(
        Math.min(pendingIncrement * currentStep, pendingPayment)
      );

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalEarned, pendingPayment]);

  return (
    <div className="glass-card glass-card-earnings rounded-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-sm font-medium opacity-90">Total PYUSD Earned</h1>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold counter-animate">
              $
              {animatedTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <TrendingUp className="h-6 w-6 text-green-300" />
          </div>
        </div>
        <Wallet className="h-8 w-8 opacity-80" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-75">Pending Payments</p>
          <p className="text-xl font-semibold counter-animate">
            $
            {animatedPending.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {pendingPayment > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onWithdraw}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 interactive-scale"
          >
            Withdraw Earnings
          </Button>
        )}
      </div>
    </div>
  );
};

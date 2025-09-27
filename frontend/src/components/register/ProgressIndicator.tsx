import React from "react";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 backdrop-blur-md border
                    ${
                      isCompleted
                        ? "bg-purple-500/20 border-purple-400/60 text-purple-300"
                        : isCurrent
                        ? "bg-purple-500/30 border-purple-400/80 text-purple-200 ring-2 ring-purple-500/50"
                        : "bg-white/5 border-white/20 text-white/50"
                    }
                  `}
                >
                  {isCompleted ? <Check size={16} /> : stepNumber}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${
                      isCurrent
                        ? "text-purple-300"
                        : isCompleted
                        ? "text-purple-400"
                        : "text-white/50"
                    }
                  `}
                >
                  {title}
                </span>
              </div>

              {index < totalSteps - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-4 transition-colors duration-300
                    ${isCompleted ? "bg-purple-400/60" : "bg-white/20"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;

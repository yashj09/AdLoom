import React from "react";
import { Building2, User, ChevronRight } from "lucide-react";

interface RoleCardProps {
  role: "brand" | "creator";
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (role: "brand" | "creator") => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  const Icon = role === "brand" ? Building2 : User;

  return (
    <div
      onClick={() => onSelect(role)}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300 group
        glass-card glass-card-hover
        ${
          isSelected
            ? "border-opacity-60 shadow-glow"
            : "hover:border-opacity-40"
        }
      `}
      style={{
        borderColor: isSelected
          ? "hsl(var(--primary))"
          : "hsla(255, 255, 255, 0.2)",
        background: isSelected ? "var(--gradient-card)" : undefined,
        boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-glass)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={`
            w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors duration-300
            ${
              isSelected
                ? "text-purple-300"
                : "text-white/60 group-hover:text-purple-400"
            }
          `}
            style={{
              background: isSelected
                ? "hsla(var(--primary), 0.2)"
                : "hsla(255, 255, 255, 0.1)",
            }}
          >
            <Icon size={24} />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </div>

        <ChevronRight
          size={20}
          className={`
            transition-all duration-300 mt-1
            ${
              isSelected
                ? "transform rotate-90"
                : "text-white/40 group-hover:text-white/60"
            }
          `}
          style={{
            color: isSelected ? "hsl(var(--primary))" : undefined,
          }}
        />
      </div>

      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--accent), 0.1))",
          }}
        />
      )}
    </div>
  );
};

export default RoleCard;

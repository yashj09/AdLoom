import React from "react";

interface GlassInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/90">
        {label}
        {required && (
          <span className="ml-1" style={{ color: "hsl(var(--primary))" }}>
            *
          </span>
        )}
      </label>

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`
            w-full px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300
            text-white placeholder-white/40 resize-none
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
            ${error ? "focus:border-red-400/80" : "hover:border-white/30"}
          `}
          style={{
            background: "hsla(255, 255, 255, 0.05)",
            borderColor: error
              ? "hsl(var(--destructive))"
              : "hsla(255, 255, 255, 0.2)",
            boxShadow: "var(--shadow-glass)",
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300
            text-white placeholder-white/40
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
            ${error ? "focus:border-red-400/80" : "hover:border-white/30"}
          `}
          style={{
            background: "hsla(255, 255, 255, 0.05)",
            borderColor: error
              ? "hsl(var(--destructive))"
              : "hsla(255, 255, 255, 0.2)",
            boxShadow: "var(--shadow-glass)",
          }}
        />
      )}

      {error && (
        <p
          className="text-sm mt-1"
          style={{ color: "hsl(var(--destructive))" }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default GlassInput;

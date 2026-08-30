import type { ReactNode } from "react";

type CardStatProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  color?: "cyan" | "green" | "orange" | "purple";
};

const styles = {
  cyan: {
    icon: "from-cyan-500 to-teal-500",
    soft: "bg-cyan-50",
  },

  green: {
    icon: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-50",
  },

  orange: {
    icon: "from-amber-500 to-orange-500",
    soft: "bg-amber-50",
  },

  purple: {
    icon: "from-violet-500 to-purple-500",
    soft: "bg-violet-50",
  },
};

export default function CardStat({
  title,
  value,
  icon,
  description,
  color = "cyan",
}: CardStatProps) {
  const style = styles[color];

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        sm:p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-200
        hover:shadow-xl
        hover:shadow-cyan-100/60
      "
    >
      <div
        className={`
          absolute
          right-0
          top-0
          h-28
          w-28
          rounded-full
          ${style.soft}
          blur-3xl
          opacity-70
        `}
      />

      <div
        className={`
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          ${style.icon}
          text-white
          shadow-lg
          transition-transform
          duration-300
          group-hover:scale-105
        `}
      >
        {icon}
      </div>

      <p className="relative mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="relative mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </h2>

      {description && (
        <p className="relative mt-2 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
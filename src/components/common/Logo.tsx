import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', collapsed = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Hex prism brand mark */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] via-[#64748B] to-[#2563EB] rounded-xl rotate-6 opacity-95 shadow-md shadow-[#2563EB]/30 group-hover:rotate-12 transition-transform" />
        <div className="absolute inset-0.5 bg-[#2563EB] rounded-[10px] flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#64748B] to-[#FFFFFF] rounded-sm" />
        </div>
      </div>

      {!collapsed && (
        <div className="flex items-baseline tracking-tight">
          <span className={`font-display font-extrabold text-white ${textSizes[size]}`}>
            ATS
          </span>
          <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full ml-1" />
        </div>
      )}
    </div>
  );
};

import React from 'react';

export const SpatialCard = ({ children, className = '', padding = 'p-6' }: { children: React.ReactNode; className?: string; padding?: string }) => (
  <div className={`relative overflow-hidden glass-panel-3d rounded-[2.5rem] ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    <div className="absolute -top-32 -left-20 w-72 h-72 bg-blue-500/15 blur-[80px] rounded-full pointer-events-none ambient-drift" />
    <div className="absolute -bottom-32 -right-20 w-72 h-72 bg-red-500/15 blur-[80px] rounded-full pointer-events-none ambient-drift" style={{ animationDelay: '-7.5s' }} />
    <div className={`relative z-10 ${padding}`}>
      {children}
    </div>
  </div>
);

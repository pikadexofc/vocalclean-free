import React from 'react';
import { LucideIcon } from 'lucide-react';

export const SettingsRow = ({ icon: Icon, label, description, rightControl }: { icon: LucideIcon; label: string; description: string; rightControl: React.ReactNode }) => (
  <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-4 flex-1 pr-4">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className="w-4 h-4 text-neutral-300" />
      </div>
      <div>
        <p className="text-[14px] font-display font-medium text-white">{label}</p>
        <p className="text-[11px] font-body text-neutral-500 font-light mt-0.5">{description}</p>
      </div>
    </div>
    {rightControl}
  </div>
);

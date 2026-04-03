import React from 'react';
import { motion } from "motion/react";

export const Switch3D = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div 
    onClick={onChange} 
    className={`w-12 h-[26px] rounded-full relative cursor-pointer flex items-center px-0.5 transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-800'}`}
  >
    <motion.div 
      className="h-5 w-5 bg-white rounded-full shadow-lg"
      animate={{ x: checked ? 22 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </div>
);

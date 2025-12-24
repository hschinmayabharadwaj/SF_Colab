
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, color = 'blue' }) => {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 p-5 rounded-xl hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <span className={`text-xl p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;

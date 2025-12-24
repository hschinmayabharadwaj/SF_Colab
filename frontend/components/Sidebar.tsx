
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'merit', name: 'Merit & XP', icon: '🏆' },
    { id: 'economy', name: 'Economy', icon: '💰' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '🎟️' },
    { id: 'prd', name: 'PRD Assistant', icon: '🤖' }
  ];

  return (
    <div className="w-64 bg-[#121212] border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-500 tracking-tight">SF ECOSYSTEM</h1>
        <p className="text-[10px] text-gray-500 uppercase mt-1">Management Portal v1.0</p>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Logged in as</p>
          <p className="text-sm font-semibold truncate">Alex Rivera</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-gray-400">Contributor Plus</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

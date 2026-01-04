import React, { useState, useMemo } from 'react';
import { LEAGUE_CONFIG } from '../constants';

interface XPPageProps {
  xp: number;
  onXPChange: (newXP: number) => void;
  onBack: () => void;
}

const XPPage: React.FC<XPPageProps> = ({ xp, onXPChange, onBack }) => {
  const [inputXP, setInputXP] = useState(xp.toString());

  const leagueData = useMemo(() => {
    let current = LEAGUE_CONFIG[0];
    let next = LEAGUE_CONFIG[1];
    for (let i = 0; i < LEAGUE_CONFIG.length; i++) {
      if (xp >= LEAGUE_CONFIG[i].minXp) {
        current = LEAGUE_CONFIG[i];
        next = LEAGUE_CONFIG[i + 1] || null;
      } else {
        break;
      }
    }
    const progress = next 
      ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 
      : 100;
    return { current, next, progress };
  }, [xp]);

  const handleAddXP = () => {
    const amount = parseInt(prompt('Enter XP to add:') || '0');
    if (amount > 0) {
      onXPChange(xp + amount);
    }
  };

  const handleSetXP = () => {
    const newXP = parseInt(inputXP) || xp;
    if (newXP >= 0) {
      onXPChange(newXP);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Merit & XP</h1>

      {/* Current XP Display */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-8 mb-8">
        <p className="text-gray-300 text-lg mb-2">Current XP</p>
        <p className="text-5xl font-bold mb-4">{xp.toLocaleString()}</p>
        <p className="text-xl text-gray-300">Level {leagueData.current.name}</p>
      </div>

      {/* Progress to Next League */}
      {leagueData.next && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Progress to {leagueData.next.name}</h2>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(leagueData.progress, 100)}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm">
            {xp - leagueData.current.minXp} / {leagueData.next.minXp - leagueData.current.minXp} XP
          </p>
        </div>
      )}

      {/* League Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2">Current League</h3>
          <p className="text-2xl mb-2">{leagueData.current.name}</p>
          <p className="text-gray-400">Min XP: {leagueData.current.minXp.toLocaleString()}</p>
          {leagueData.current.benefits && (
            <div className="mt-3">
              <p className="text-sm text-gray-300 font-medium">Benefits:</p>
              {leagueData.current.benefits.map((benefit, idx) => (
                <p key={idx} className="text-sm text-gray-400">• {benefit}</p>
              ))}
            </div>
          )}
        </div>

        {leagueData.next && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Next League</h3>
            <p className="text-2xl mb-2">{leagueData.next.name}</p>
            <p className="text-gray-400">Min XP: {leagueData.next.minXp.toLocaleString()}</p>
            {leagueData.next.benefits && (
              <div className="mt-3">
                <p className="text-sm text-gray-300 font-medium">Benefits:</p>
                {leagueData.next.benefits.map((benefit, idx) => (
                  <p key={idx} className="text-sm text-gray-400">• {benefit}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Leagues */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">All Leagues</h2>
        <div className="space-y-2">
          {LEAGUE_CONFIG.map((league, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded ${
                xp >= league.minXp 
                  ? 'bg-green-900 text-green-100' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              <p className="font-medium">{league.name}</p>
              <p className="text-sm">Min XP: {league.minXp.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* XP Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">XP Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleAddXP}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Add XP
          </button>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputXP}
              onChange={(e) => setInputXP(e.target.value)}
              className="flex-1 bg-gray-700 px-4 py-3 rounded text-white"
              placeholder="Enter XP value"
            />
            <button
              onClick={handleSetXP}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPPage;

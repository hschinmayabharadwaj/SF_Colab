import React, { useState } from 'react';
import { addPremiumGems } from '../services/api';

interface CrystalsPageProps {
  userId: string;
  crystals: number;
  onCrystalsChange: (newAmount: number) => void;
  onBack: () => void;
}

const CrystalsPage: React.FC<CrystalsPageProps> = ({ userId, crystals, onCrystalsChange, onBack }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'shop' | 'history'>('balance');

  const packages = [
    { name: 'Starter Pack', gems: 100, price: '$4.99', discount: 0 },
    { name: 'Adventurer Pack', gems: 500, price: '$19.99', discount: 0 },
    { name: 'Champion Pack', gems: 1100, price: '$39.99', discount: 10 },
    { name: 'Legend Pack', gems: 3000, price: '$99.99', discount: 15 },
  ];

  const handlePurchase = async (gems: number, packageName: string) => {
    try {
      const result = await addPremiumGems(userId, gems);
      onCrystalsChange(crystals + gems);
      alert(`Successfully purchased ${packageName}! You now have ${crystals + gems} gems.`);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-2">Premium Gems</h1>
      <p className="text-gray-400 mb-8">Enhance your gameplay with premium currency</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 font-medium ${activeTab === 'balance' ? 'border-b-2 border-purple-500' : ''}`}
        >
          My Gems
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 font-medium ${activeTab === 'shop' ? 'border-b-2 border-purple-500' : ''}`}
        >
          Shop
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-purple-500' : ''}`}
        >
          History
        </button>
      </div>

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 rounded-lg p-12 text-center">
            <p className="text-gray-300 text-lg mb-2">Your Premium Gems</p>
            <p className="text-6xl font-bold mb-4">💎 {crystals}</p>
            <p className="text-gray-300">Premium currency for exclusive items</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Gem Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-medium">Exclusive Items</p>
                  <p className="text-sm text-gray-400">Access premium cosmetics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="font-medium">Battle Pass</p>
                  <p className="text-sm text-gray-400">Unlock premium rewards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-medium">Premium Boosts</p>
                  <p className="text-sm text-gray-400">Faster progression</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎪</span>
                <div>
                  <p className="font-medium">Limited Events</p>
                  <p className="text-sm text-gray-400">Exclusive event access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-purple-500 hover:border-purple-400 transition">
              {pkg.discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                  -{pkg.discount}%
                </div>
              )}
              <h3 className="text-2xl font-bold mb-3">{pkg.name}</h3>
              <div className="mb-4">
                <p className="text-4xl font-bold text-purple-300">{pkg.gems}</p>
                <p className="text-gray-400 text-sm">Gems</p>
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold text-white">{pkg.price}</p>
                <p className="text-gray-400 text-xs">One-time purchase</p>
              </div>
              <button
                onClick={() => handlePurchase(pkg.gems, pkg.name)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg font-bold transition"
              >
                Buy Now
              </button>
              {pkg.discount > 0 && (
                <p className="text-green-400 text-xs text-center mt-2">Save {Math.round(pkg.gems * pkg.discount / 100)} gems!</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Purchase History</h2>
          <p className="text-gray-400">Your purchase history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default CrystalsPage;

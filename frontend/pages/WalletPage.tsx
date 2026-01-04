import React, { useState, useEffect } from 'react';
import { getWalletBalance, getWalletHistory, earnCoins, spendCoins, grantCurrency } from '../services/api';

interface WalletPageProps {
  userId: string;
  onBack: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ userId, onBack }) => {
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'balance' | 'history' | 'actions'>('balance');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceData = await getWalletBalance(userId);
        setBalance(balanceData);
        const historyData = await getWalletHistory(userId);
        setHistory(historyData.transactions || []);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleEarn = async () => {
    try {
      const amount = parseInt(prompt('Enter amount to earn:') || '0');
      if (amount > 0) {
        await earnCoins(userId, amount, 'Manual earn');
        // Refresh balance
        const updatedBalance = await getWalletBalance(userId);
        setBalance(updatedBalance);
      }
    } catch (error) {
      console.error('Failed to earn coins:', error);
    }
  };

  const handleSpend = async () => {
    try {
      const amount = parseInt(prompt('Enter amount to spend:') || '0');
      if (amount > 0) {
        await spendCoins(userId, amount, 'Manual spend');
        // Refresh balance
        const updatedBalance = await getWalletBalance(userId);
        setBalance(updatedBalance);
      }
    } catch (error) {
      console.error('Failed to spend coins:', error);
    }
  };

  const handleGrant = async () => {
    try {
      const amount = parseInt(prompt('Enter amount to grant:') || '0');
      const currencyType = prompt('Enter currency type (sf_coins/premium_gems/event_tokens):') || 'sf_coins';
      if (amount > 0) {
        await grantCurrency(userId, amount, currencyType, 'Admin grant');
        // Refresh balance
        const updatedBalance = await getWalletBalance(userId);
        setBalance(updatedBalance);
      }
    } catch (error) {
      console.error('Failed to grant currency:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          ← Back
        </button>
        <p>Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Wallet Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 font-medium ${activeTab === 'balance' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Balance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500' : ''}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 font-medium ${activeTab === 'actions' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Actions
        </button>
      </div>

      {/* Balance Tab */}
      {activeTab === 'balance' && balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">SF Coins</p>
            <p className="text-3xl font-bold">{balance.sf_coins}</p>
            <p className="text-gray-500 text-xs">Earned: {balance.total_coins_earned}</p>
            <p className="text-gray-500 text-xs">Spent: {balance.total_coins_spent}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Premium Gems</p>
            <p className="text-3xl font-bold">{balance.premium_gems}</p>
            <p className="text-gray-500 text-xs">Premium Currency</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Event Tokens</p>
            <p className="text-3xl font-bold">{balance.event_tokens}</p>
            <p className="text-gray-500 text-xs">Event Currency</p>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-3">{tx.transaction_type}</td>
                  <td className="px-4 py-3">{tx.currency_type}</td>
                  <td className="px-4 py-3 font-mono">{tx.amount}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-400">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleEarn}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Earn Coins
          </button>
          <button
            onClick={handleSpend}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Spend Coins
          </button>
          <button
            onClick={handleGrant}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Grant Currency
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletPage;

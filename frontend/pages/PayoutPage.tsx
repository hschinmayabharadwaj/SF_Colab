import React, { useState } from 'react';

interface PayoutPageProps {
  userId: string;
  pendingPayout: number;
  onBack: () => void;
}

const PayoutPage: React.FC<PayoutPageProps> = ({ userId, pendingPayout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'methods'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= pendingPayout) {
      alert(`Withdrawal of $${amount.toFixed(2)} initiated. Processing...`);
      setWithdrawAmount('');
    } else {
      alert('Invalid withdrawal amount');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-2">Earnings & Payouts</h1>
      <p className="text-gray-400 mb-8">Manage your auditable earnings</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-green-500' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-2 font-medium ${activeTab === 'withdraw' ? 'border-b-2 border-green-500' : ''}`}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-2 font-medium ${activeTab === 'methods' ? 'border-b-2 border-green-500' : ''}`}
        >
          Payment Methods
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-lg p-12 text-center">
            <p className="text-gray-300 text-lg mb-2">Pending Payout</p>
            <p className="text-6xl font-bold mb-4">💰 ${pendingPayout.toFixed(2)}</p>
            <p className="text-gray-300">Ready to withdraw to your account</p>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">This Month</p>
              <p className="text-3xl font-bold">$125.50</p>
              <p className="text-green-400 text-xs mt-2">↑ 15% from last month</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">This Year</p>
              <p className="text-3xl font-bold">$1,250.00</p>
              <p className="text-gray-400 text-xs mt-2">Total earnings</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Withdrawn</p>
              <p className="text-3xl font-bold">$5,000.00</p>
              <p className="text-gray-400 text-xs mt-2">All-time payouts</p>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Earnings Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-300">Achievements</span>
                <span className="font-bold">$45.00</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-300">Daily Streaks</span>
                <span className="font-bold">$35.50</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-300">Event Participation</span>
                <span className="font-bold">$25.00</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-300">Referral Bonuses</span>
                <span className="font-bold">$20.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
            <p className="text-gray-400 mb-6">You can withdraw up to ${pendingPayout.toFixed(2)}</p>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Withdrawal Amount</label>
              <div className="flex gap-2">
                <span className="bg-gray-700 px-4 py-3 rounded-lg text-gray-300">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={pendingPayout}
                  step="0.01"
                  className="flex-1 bg-gray-700 px-4 py-3 rounded-lg text-white placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Processing Fee (5%)</span>
                <span className="font-mono">${(parseFloat(withdrawAmount || '0') * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="font-bold">You'll Receive</span>
                <span className="font-bold text-green-400">${(parseFloat(withdrawAmount || '0') * 0.95).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition"
            >
              Request Withdrawal
            </button>
          </div>

          {/* Recent Withdrawals */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Withdrawals</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <div>
                  <p className="font-medium">Withdrawal #5432</p>
                  <p className="text-sm text-gray-400">Dec 28, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">$100.00</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <div>
                  <p className="font-medium">Withdrawal #5431</p>
                  <p className="text-sm text-gray-400">Dec 15, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">$250.00</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-600">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Primary Payment Method</p>
                  <p className="text-xl font-bold">Bank Account</p>
                </div>
                <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">Active</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Bank of America</p>
              <p className="text-gray-400 text-sm">••••4567</p>
              <button className="mt-4 px-4 py-2 border border-gray-600 rounded hover:border-gray-500 text-sm">Edit</button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-4">Add Another Payment Method</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium">
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              💡 Your payment information is encrypted and secure. We never store full bank details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutPage;

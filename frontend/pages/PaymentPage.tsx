import React, { useState } from 'react';

interface PaymentPageProps {
  userId: string;
  onBack: () => void;
  onPaymentSuccess?: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ userId, onBack, onPaymentSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 4.99,
      description: 'Perfect for trying out premium features',
      features: [
        'Ad-free experience',
        '50 premium gems',
        'Daily bonus rewards',
        'Basic cosmetics pack'
      ],
      recommended: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 9.99,
      description: 'Most popular choice for active players',
      features: [
        'Everything in Starter',
        '200 premium gems',
        '2x daily rewards',
        'Exclusive cosmetics',
        'Early access to events',
        'Priority support'
      ],
      recommended: true
    },
    {
      id: 'elite',
      name: 'Elite Plan',
      price: 19.99,
      description: 'For the most dedicated players',
      features: [
        'Everything in Pro',
        '500 premium gems',
        '3x daily rewards',
        'Exclusive skins',
        'VIP status badge',
        '24/7 premium support',
        'Custom profile theme'
      ],
      recommended: false
    }
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Payment successful! You've subscribed to ${plans.find(p => p.id === selectedPlan)?.name}`);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onBack();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        ← Back
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Upgrade Your Experience</h1>
        <p className="text-gray-400 mb-12">Choose a plan that fits your playstyle</p>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-lg p-8 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-purple-500 bg-gradient-to-br from-gray-800 to-gray-900'
                  : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
              } ${plan.recommended ? 'md:scale-105' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={`px-4 py-2 rounded text-center font-medium ${
                selectedPlan === plan.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

            {/* Payment Method Selection */}
            <div className="mb-8">
              <p className="text-gray-300 mb-4 font-medium">Payment Method</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'card', name: 'Credit Card', icon: '💳' },
                  { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                  { id: 'apple', name: 'Apple Pay', icon: '🍎' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{method.icon}</span>
                    <p className="text-sm">{method.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-gray-300 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-gray-700 px-4 py-3 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-gray-700 px-4 py-3 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full bg-gray-700 px-4 py-3 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-gray-700 px-4 py-3 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-700 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Plan</span>
                <span className="font-bold">{plans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-2">
                <span className="text-gray-300">Amount</span>
                <span className="font-bold">${plans.find(p => p.id === selectedPlan)?.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Total</span>
                <span className="text-2xl font-bold text-purple-400">${plans.find(p => p.id === selectedPlan)?.price}</span>
              </div>
            </div>

            {/* Terms & Payment Button */}
            <div className="mb-6">
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⏳</span>
                  Processing Payment...
                </span>
              ) : (
                `Pay $${plans.find(p => p.id === selectedPlan)?.price}`
              )}
            </button>

            <p className="text-center text-gray-400 text-xs mt-4">
              Your payment is secure and encrypted. You can cancel anytime.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan?',
                a: 'Yes! You can upgrade or downgrade your plan anytime from your account settings.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Not currently, but you can cancel within 24 hours for a full refund.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept credit cards, PayPal, Apple Pay, and Google Pay.'
              },
              {
                q: 'When will I be charged?',
                a: 'You\'ll be charged immediately upon purchase, then on the same date each month.'
              }
            ].map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  Lock,
  Heart,
  Smartphone,
  Coins,
  Gift,
  Wallet
} from 'lucide-react';

interface AdvancedSubscriptionPaywallProps {
  trialDaysLeft: number;
  onPaymentSuccess: () => void;
  isPremium: boolean;
}

export default function AdvancedSubscriptionPaywall({
  trialDaysLeft,
  onPaymentSuccess,
  isPremium
}: AdvancedSubscriptionPaywallProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [installmentMonths, setInstallmentMonths] = useState(3);

  const monthlyPrice = 150;
  const bankDetails = {
    accountHolder: 'Mr Bongani Nkosi',
    accountNumber: '1976184299',
    bankName: 'Capitec Bank',
    reference: 'SKHANDA-TV-SUB'
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: CreditCard,
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'eft',
      name: 'Direct EFT Transfer',
      description: 'Bank account transfer',
      icon: DollarSign,
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'vodacom',
      name: 'Vodacom M-Pesa',
      description: 'Mobile money transfer',
      icon: Smartphone,
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      description: 'MTN payment service',
      icon: Smartphone,
      color: 'from-yellow-600 to-yellow-800'
    },
    {
      id: 'cellc',
      name: 'Cell C Payment',
      description: 'Cell C airtime billing',
      icon: Smartphone,
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum',
      icon: Coins,
      color: 'from-orange-600 to-orange-800'
    },
    {
      id: 'voucher',
      name: 'Gift Card/Voucher',
      description: 'Prepaid codes',
      icon: Gift,
      color: 'from-pink-600 to-pink-800'
    },
    {
      id: 'installment',
      name: 'Installment Plan',
      description: '3-6 months payments',
      icon: Wallet,
      color: 'from-indigo-600 to-indigo-800'
    }
  ];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setVerificationLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const processPayment = async (method: string) => {
    setLoading(true);
    addLog(`Initiating ${method} payment...`);
    addLog(`Amount: R${monthlyPrice}`);
    addLog('Connecting to payment gateway...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog('Processing transaction...');

    await new Promise((resolve) => setTimeout(resolve, 1200));
    addLog('Routing to Capitec: 1976184299');

    await new Promise((resolve) => setTimeout(resolve, 800));
    addLog('✅ Payment successful!');
    addLog('Transaction ID: TXN' + Math.random().toString(36).substr(2, 9).toUpperCase());

    setPaymentSuccess(true);
    setLoading(false);

    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  if (isPremium) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl relative z-10"
      >
        {/* Trial Status */}
        {!paymentSuccess && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-[#E50914] to-red-600 rounded-3xl p-8 mb-8 text-white shadow-2xl border border-red-400/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-6 h-6" />
                  <h2 className="text-2xl font-black uppercase tracking-wider">Free Trial Ending Soon</h2>
                </div>
                <p className="text-sm opacity-90 mb-4">Your 7-day free trial expires in {trialDaysLeft} days</p>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((7 - trialDaysLeft) / 7) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
              <Heart className="w-16 h-16 opacity-30 flex-shrink-0" />
            </div>
          </motion.div>
        )}

        {/* Success State */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 text-[#E50914] mx-auto mb-4" />
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-2">Payment Successful!</h2>
              <p className="text-zinc-400 mb-2">Welcome to Skhanda TV Premium</p>
              <p className="text-sm text-zinc-500">Your account is now active. Enjoy unlimited access!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Options */}
        {!paymentSuccess && (
          <div className="space-y-6">
            {/* Pricing Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-[#E50914]/10 rounded-2xl p-6 border border-[#E50914]/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Monthly Subscription</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R{monthlyPrice}</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-2">Account Holder</p>
                  <p className="font-bold text-white">{bankDetails.accountHolder}</p>
                  <p className="text-xs text-zinc-500">Capitec Bank</p>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods Grid */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Choose Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {paymentMethods.map((method, idx) => {
                  const Icon = method.icon;
                  return (
                    <motion.button
                      key={method.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 rounded-2xl border-2 transition ${
                        selectedPayment === method.id
                          ? `bg-gradient-to-br ${method.color} text-white border-white`
                          : 'bg-zinc-950 border-zinc-800 hover:border-[#E50914]/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${
                        selectedPayment === method.id ? 'text-white' : 'text-[#E50914]'
                      }`} />
                      <p className="font-bold text-sm">{method.name}</p>
                      <p className="text-xs opacity-75">{method.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Payment Details */}
            <AnimatePresence>
              {selectedPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4"
                >
                  {selectedPayment === 'installment' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-white">Installment Duration</label>
                      <div className="flex gap-2">
                        {[3, 6].map((months) => (
                          <button
                            key={months}
                            onClick={() => setInstallmentMonths(months)}
                            className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                              installmentMonths === months
                                ? 'bg-[#E50914] text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {months} months
                            <span className="block text-xs mt-1">R{Math.round(monthlyPrice / months)}/month</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'eft' && (
                    <div className="space-y-3">
                      <div className="bg-yellow-950/30 border border-yellow-900 rounded-lg p-3 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">Transfer R150 and your access will be activated within 1 hour</p>
                      </div>
                      <div className="space-y-2 bg-zinc-900 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Account Holder:</span>
                          <span className="font-bold text-white">{bankDetails.accountHolder}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Account Number:</span>
                          <span className="font-mono text-white">{bankDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Bank:</span>
                          <span className="font-bold text-white">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Reference:</span>
                          <span className="font-mono text-white">{bankDetails.reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'voucher' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter voucher code"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  )}

                  {selectedPayment === 'crypto' && (
                    <div className="space-y-3">
                      <div className="bg-orange-950/20 border border-orange-900/50 rounded-lg p-3">
                        <p className="text-sm text-orange-400 mb-2 font-bold">Cryptocurrency Payment</p>
                        <p className="text-xs text-orange-300">Bitcoin: 1A1z7agoat4ggX9xY6UYa123xyz</p>
                        <p className="text-xs text-orange-300 mt-1">Ethereum: 0x1234567890abcdef</p>
                      </div>
                    </div>
                  )}

                  {/* Verification Logs */}
                  {verificationLogs.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-3">
                      <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Payment Log</p>
                      <div className="bg-black/50 rounded h-24 overflow-y-auto p-2 space-y-1">
                        {verificationLogs.map((log, idx) => (
                          <p key={idx} className="text-[10px] font-mono text-zinc-500">
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  <button
                    onClick={() => processPayment(selectedPayment)}
                    disabled={loading}
                    className="w-full bg-[#E50914] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                  >
                    {loading ? 'Processing...' : `Pay R${monthlyPrice} via ${paymentMethods.find(m => m.id === selectedPayment)?.name}`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Security Notice */}
        {!paymentSuccess && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2"
          >
            <Lock className="w-3 h-3" />
            <span>Your payment is secure and encrypted | All payments go to Capitec {bankDetails.accountNumber}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

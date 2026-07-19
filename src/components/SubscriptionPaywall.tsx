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
  Heart
} from 'lucide-react';

interface SubscriptionPaywallProps {
  trialDaysLeft: number;
  onPaymentSuccess: () => void;
  isPremium: boolean;
}

export default function SubscriptionPaywall({
  trialDaysLeft,
  onPaymentSuccess,
  isPremium
}: SubscriptionPaywallProps) {
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'eft' | 'mobile' | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  const monthlyPrice = 150;
  const bankDetails = {
    accountHolder: 'Mr Bongani Nkosi',
    accountNumber: '1976184299',
    bankName: 'Capitec Bank',
    reference: 'SKHANDA-TV-SUB'
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setVerificationLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog('Initiating card payment...');
    addLog('Validating card details...');

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    addLog('Contacting payment gateway...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog('Processing R150 transaction...');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    addLog('✅ Payment successful!');
    addLog('Routing to Capitec: 1976184299');
    addLog('Transaction ID: TXN' + Math.random().toString(36).substr(2, 9).toUpperCase());

    setPaymentSuccess(true);
    setLoading(false);

    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  const handleEFTPayment = async () => {
    setLoading(true);
    addLog('Initiating EFT payment...');
    addLog('Bank: ' + bankDetails.bankName);
    addLog('Account: ' + bankDetails.accountNumber);
    addLog('Amount: R' + monthlyPrice);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    addLog('Please transfer R150 to the account details above');
    addLog('Use reference: ' + bankDetails.reference);
    addLog('Payment pending verification...');

    await new Promise((resolve) => setTimeout(resolve, 2000));
    addLog('✅ Payment confirmed!');

    setPaymentSuccess(true);
    setLoading(false);

    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  const handleMobilePayment = async () => {
    setLoading(true);
    addLog('Initiating mobile money payment...');
    addLog('Connecting to payment provider...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog('Processing R150 transaction...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog('Verifying payment...');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    addLog('✅ Mobile payment successful!');

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
        className="w-full max-w-4xl relative z-10"
      >
        {/* Trial Status Card */}
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

                {/* Trial Progress */}
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((7 - trialDaysLeft) / 7) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-white"
                  />
                </div>
                <p className="text-xs mt-2 opacity-75">{7 - trialDaysLeft} of 7 days used</p>
              </div>

              <Heart className="w-16 h-16 opacity-30 flex-shrink-0" />
            </div>
          </motion.div>
        )}

        {/* Payment Success State */}
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

        {/* Payment Options Grid */}
        {!paymentSuccess && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Pricing Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-3xl border border-zinc-900"
            >
              <h2 className="text-2xl font-black text-white mb-6">Skhanda TV Premium</h2>

              {/* Price Display */}
              <div className="bg-[#E50914]/10 rounded-2xl p-6 mb-6 border border-[#E50914]/30">
                <p className="text-sm text-zinc-400 mb-1">Monthly Subscription</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">R{monthlyPrice}</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Renews automatically every month</p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">Access all 500+ live channels</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">HD streaming quality</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">Personalized recommendations</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">Ad-free viewing experience</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">Create custom watchlists</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] flex-shrink-0" />
                  <span className="text-sm text-white">Cancel anytime, no lock-in</span>
                </div>
              </div>

              {/* Admin Info */}
              <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Account Details</p>
                <p className="text-sm font-bold text-white">{bankDetails.accountHolder}</p>
                <p className="text-xs text-zinc-400 mt-1">Capitec Bank</p>
              </div>
            </motion.div>

            {/* Right - Payment Methods */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>

              {/* Card Payment */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPayment('card')}
                className={`w-full p-4 rounded-2xl border-2 transition flex items-center gap-4 ${
                  selectedPayment === 'card'
                    ? 'bg-[#E50914]/10 border-[#E50914]'
                    : 'bg-zinc-950 border-zinc-800 hover:border-[#E50914]/50'
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#E50914]" />
                <div className="text-left flex-1">
                  <p className="font-bold text-white">Credit/Debit Card</p>
                  <p className="text-xs text-zinc-500">Visa, Mastercard</p>
                </div>
              </motion.button>

              {/* EFT Payment */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPayment('eft')}
                className={`w-full p-4 rounded-2xl border-2 transition flex items-center gap-4 ${
                  selectedPayment === 'eft'
                    ? 'bg-[#E50914]/10 border-[#E50914]'
                    : 'bg-zinc-950 border-zinc-800 hover:border-[#E50914]/50'
                }`}
              >
                <DollarSign className="w-6 h-6 text-[#E50914]" />
                <div className="text-left flex-1">
                  <p className="font-bold text-white">Direct EFT Transfer</p>
                  <p className="text-xs text-zinc-500">Bank account transfer</p>
                </div>
              </motion.button>

              {/* Mobile Payment */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPayment('mobile')}
                className={`w-full p-4 rounded-2xl border-2 transition flex items-center gap-4 ${
                  selectedPayment === 'mobile'
                    ? 'bg-[#E50914]/10 border-[#E50914]'
                    : 'bg-zinc-950 border-zinc-800 hover:border-[#E50914]/50'
                }`}
              >
                <Lock className="w-6 h-6 text-[#E50914]" />
                <div className="text-left flex-1">
                  <p className="font-bold text-white">Mobile Money</p>
                  <p className="text-xs text-zinc-500">Secure mobile payment</p>
                </div>
              </motion.button>

              {/* Payment Forms */}
              <AnimatePresence>
                {selectedPayment === 'card' && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleCardPayment}
                    className="space-y-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800"
                  >
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      maxLength={16}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#E50914]"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        maxLength={5}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#E50914]"
                        required
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        maxLength={3}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#E50914]"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E50914] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                    >
                      {loading ? 'Processing...' : `Pay R${monthlyPrice}`}
                    </button>
                  </motion.form>
                )}

                {selectedPayment === 'eft' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800"
                  >
                    <div className="bg-yellow-950/30 border border-yellow-900 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">Transfer R150 to the account below and your access will be activated within 1 hour</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Account Holder:</span>
                        <span className="font-bold text-white">{bankDetails.accountHolder}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Bank:</span>
                        <span className="font-bold text-white">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Account Number:</span>
                        <span className="font-bold text-white font-mono">{bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Amount:</span>
                        <span className="font-bold text-white">R{monthlyPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Reference:</span>
                        <span className="font-bold text-white font-mono">{bankDetails.reference}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleEFTPayment}
                      disabled={loading}
                      className="w-full bg-[#E50914] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                    >
                      {loading ? 'Processing...' : 'I have transferred the funds'}
                    </button>
                  </motion.div>
                )}

                {selectedPayment === 'mobile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800"
                  >
                    <p className="text-sm text-zinc-400">Select your mobile network:</p>
                    <div className="space-y-2">
                      {['Vodacom', 'MTN', 'Cell C', 'Telkom'].map((network) => (
                        <button
                          key={network}
                          className="w-full p-2 bg-zinc-900 hover:bg-[#E50914]/10 border border-zinc-800 hover:border-[#E50914] rounded-lg text-white text-sm font-bold transition"
                        >
                          {network}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleMobilePayment}
                      disabled={loading}
                      className="w-full bg-[#E50914] hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition mt-4"
                    >
                      {loading ? 'Processing...' : `Pay R${monthlyPrice} via Mobile`}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verification Logs */}
              {verificationLogs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800"
                >
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Payment Log</p>
                  <div className="bg-black/50 rounded-lg p-2 h-32 overflow-y-auto space-y-1">
                    {verificationLogs.map((log, idx) => (
                      <p key={idx} className="text-xs font-mono text-zinc-500">
                        {log}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
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
            <span>Your payment is secure and encrypted</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

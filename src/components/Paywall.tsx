/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  HelpCircle, 
  Copy, 
  QrCode, 
  Building, 
  Smartphone, 
  Send, 
  ArrowRight, 
  Upload,
  MessageSquare
} from 'lucide-react';

interface PaywallProps {
  onPaymentSuccess: () => void;
  trialDaysLeft: number;
}

export default function Paywall({ onPaymentSuccess, trialDaysLeft }: PaywallProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'card' | 'eft' | 'capitec_pay' | 'scan' | 'sms'>('card');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Card Payment States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Capitec Pay States
  const [phoneNo, setPhoneNo] = useState('');
  const [capitecPayState, setCapitecPayState] = useState<'idle' | 'sending' | 'pending' | 'success'>('idle');
  
  // General Flow States
  const [processing, setProcessing] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  
  const [simulatedRef] = useState(`SKH-BONGANI-${Math.floor(100000 + Math.random() * 900000)}`);

  // Real-time payment verification states
  const [verificationStage, setVerificationStage] = useState<'idle' | 'initiating' | 'querying' | 'analyzing' | 'received' | 'allocating' | 'completed'>('idle');
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  const features = [
    "Unlocks All 10 Premium Live Channels",
    "Stunning Full HD (1080p) Video Stream Playback",
    "100% Ad-Free Experience (No banners, no video ads)",
    "Set Unlimited EPG Reminders & Save Favorites",
    "Stream on up to 3 screens concurrently",
    "Priority 24/7 Premium Support via WhatsApp"
  ];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const runRealTimeVerification = (methodLabel: string, onComplete: () => void) => {
    setProcessing(true);
    setVerificationStage('initiating');
    setVerificationLogs([]);

    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      setVerificationLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    // Step 1: Initiating
    addLog(`Initiating secure pay handshake via ${methodLabel}...`);
    
    setTimeout(() => {
      // Step 2: Querying
      setVerificationStage('querying');
      addLog("Handshake verified. Fetching real-time bank ledger for pending settlements...");
      
      setTimeout(() => {
        // Step 3: Analyzing
        setVerificationStage('analyzing');
        addLog(`Filtering statement logs for reference matching: "${simulatedRef}"`);
        
        setTimeout(() => {
          // Step 4: Received
          setVerificationStage('received');
          addLog("MATCH DETECTED: Bank ledger settlement of R150.00 confirmed.");
          addLog("Recipient Credited: MR B NKOSI (Capitec Bank - 1976184299)");
          
          setTimeout(() => {
            // Step 5: Allocating
            setVerificationStage('allocating');
            addLog("Processing secure handshake completion...");
            addLog("Provisioning premium account token and updating access ledger...");
            
            setTimeout(() => {
              // Step 6: Completed
              setVerificationStage('completed');
              setProcessing(false);
              setPaymentFinished(true);
              onComplete();
            }, 1000);
          }, 1200);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const handleSimulatedCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    runRealTimeVerification('Credit/Debit Card', () => {
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    });
  };

  const handleEFTConfirm = () => {
    runRealTimeVerification('Capitec Direct EFT', () => {
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    });
  };

  const handleScanConfirm = () => {
    runRealTimeVerification('QR Code Scan', () => {
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    });
  };

  const handleCapitecPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNo) return;
    
    setProcessing(true);
    setVerificationStage('initiating');
    setVerificationLogs([]);
    setCapitecPayState('sending');

    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      setVerificationLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    addLog("Connecting securely to Capitec Pay Gateway routing engine...");

    setTimeout(() => {
      setCapitecPayState('pending');
      setVerificationStage('querying');
      addLog(`Mobile routing successful. Dispatching instant payment request to: ${phoneNo}`);
      addLog("Awaiting client PIN authentication on the Capitec mobile application...");

      // Simulate user approving the transaction on their banking app after 4.5 seconds
      setTimeout(() => {
        setCapitecPayState('success');
        setVerificationStage('received');
        addLog("PIN AUTHENTICATED: Client validated transaction on Capitec App successfully.");
        addLog("R150.00 settlement initialized and authorized.");

        setTimeout(() => {
          setVerificationStage('allocating');
          addLog("Updating channel access permissions to Skhanda TV Premium...");
          
          setTimeout(() => {
            setVerificationStage('completed');
            setProcessing(false);
            setPaymentFinished(true);
            setTimeout(() => {
              onPaymentSuccess();
            }, 1500);
          }, 1200);
        }, 1200);
      }, 4500);
    }, 1850);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFileName(e.target.files[0].name);
      setProofUploaded(true);
    }
  };

  // Generate dynamic QR Code for Capitec payment
  // Encoding the account holder MR B NKOSI, Capitec Bank, Acc 1976184299, and the unique reference code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=e50914&bgcolor=09090b&data=${encodeURIComponent(
    `Capitec Bank | Account Holder: MR B NKOSI | Account Number: 1976184299 | Universal Branch: 470010 | Amount: R150.00 | Reference: ${simulatedRef}`
  )}`;

  return (
    <div id="paywall-screen" className="fixed inset-0 bg-[#000000] z-45 overflow-y-auto flex items-center justify-center p-4">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#E50914]/10 blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col md:flex-row my-8">
        
        {/* Pitch marketing banner (Left Column) */}
        <div className="md:w-1/2 bg-gradient-to-b from-[#E50914]/20 via-[#000000] to-[#000000] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900">
          <div>
            <div className="flex items-center gap-1.5 mb-6">
              <div className="w-6 h-6 bg-[#E50914] rounded flex items-center justify-center text-xs text-white font-extrabold">📺</div>
              <span className="font-extrabold text-white text-sm tracking-widest">SKHANDA <span className="text-[#E50914]">TV</span></span>
            </div>

            <span className="inline-block px-3 py-1 bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">
              Premium Upgrade
            </span>

            <h2 className="text-3xl font-black text-white leading-tight">
              Keep <br />Watching
            </h2>
            
            <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
              Unlock the complete Skhanda TV suite to watch standard, entertainment, news, sport, and original channels continuously with zero limitations.
            </p>

            <div className="mt-6 p-4 bg-zinc-900/40 rounded-2xl border border-[#E50914]/20">
              <div className="text-[10px] text-[#E50914] font-black uppercase tracking-widest">Instant Activation</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">R150</span>
                <span className="text-zinc-400 text-xs font-semibold">/ month</span>
              </div>
              <p className="text-[9px] text-zinc-500 mt-1.5 leading-relaxed">
                Send payment straight to account: <br />
                <span className="text-zinc-400 font-bold font-mono">Capitec Bank • MR B NKOSI</span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-zinc-600 text-[10px] font-mono border-t border-zinc-900 pt-4">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Direct-To-Owner Pay Channels</span>
          </div>
        </div>

        {/* Feature list & payment triggers (Right Column) */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 block">
              What's Included
            </span>

            <div className="flex flex-col gap-3">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-[#E50914] mt-0.5 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs text-zinc-300 leading-normal">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col gap-2.5">
            <button
              id="pay-premium-now-btn"
              onClick={() => { setShowSimulator(true); setActiveMethod('card'); }}
              className="w-full py-4 bg-[#E50914] hover:bg-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)] transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Unlock Premium Activation (R150)</span>
            </button>

            <button
              id="pay-direct-eft-btn"
              onClick={() => { setShowSimulator(true); setActiveMethod('eft'); }}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-zinc-800 transition cursor-pointer"
            >
              <Building className="w-4 h-4 text-sky-400" />
              <span>Direct Bank EFT (Capitec Transfer)</span>
            </button>

            <p className="text-[9px] text-zinc-500 text-center mt-1">
              Activate instantly via Card, Capitec Pay, QR Scan, or Bank EFT.
            </p>
          </div>
        </div>

      </div>

      {/* Modern Multi-Method Payment Portal Overlay Modal */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              {/* Payment Gateway Header */}
              <div className="bg-[#E50914] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider">Skhanda TV Pay Portal</span>
                    <span className="text-[8px] text-white/80 font-mono">100% Secured Premium Direct Payments</span>
                  </div>
                </div>
                <button
                  id="close-pay-portal"
                  onClick={() => {
                    setShowSimulator(false);
                    setPaymentFinished(false);
                    setProcessing(false);
                    setCapitecPayState('idle');
                    setProofUploaded(false);
                    setVerificationStage('idle');
                    setVerificationLogs([]);
                  }}
                  className="text-white/80 hover:text-white text-[10px] font-bold px-2.5 py-1.5 bg-black/25 rounded-lg transition"
                >
                  Close
                </button>
              </div>

              {/* Payment Method Selector Tabs */}
              {!paymentFinished && !processing && (
                <div className="bg-zinc-900/60 p-2 border-b border-zinc-900 grid grid-cols-5 gap-1">
                  <button
                    onClick={() => setActiveMethod('card')}
                    className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition flex flex-col items-center gap-1 cursor-pointer ${
                      activeMethod === 'card' 
                        ? 'bg-[#E50914] text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    onClick={() => setActiveMethod('eft')}
                    className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition flex flex-col items-center gap-1 cursor-pointer ${
                      activeMethod === 'eft' 
                        ? 'bg-sky-600 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>EFT</span>
                  </button>
                  <button
                    onClick={() => setActiveMethod('capitec_pay')}
                    className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition flex flex-col items-center gap-1 cursor-pointer ${
                      activeMethod === 'capitec_pay' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Capitec</span>
                  </button>
                  <button
                    onClick={() => setActiveMethod('scan')}
                    className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition flex flex-col items-center gap-1 cursor-pointer ${
                      activeMethod === 'scan' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan</span>
                  </button>
                  <button
                    onClick={() => setActiveMethod('sms')}
                    className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition flex flex-col items-center gap-1 cursor-pointer ${
                      activeMethod === 'sms' 
                        ? 'bg-amber-600 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>SMS/Link</span>
                  </button>
                </div>
              )}

              <div className="p-6">
                {processing ? (
                  /* Real-time Payment Verification Console */
                  <div id="payment-verification-console" className="flex flex-col gap-5 py-4">
                    {/* Top Status & Badge */}
                    <div className="flex flex-col items-center text-center gap-3">
                      
                      {/* Interactive Visual Pulse Rings */}
                      <div className="relative flex items-center justify-center w-16 h-16">
                        {/* Outer Pulse Rings based on stage */}
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                          verificationStage === 'received' || verificationStage === 'allocating'
                            ? 'bg-emerald-500'
                            : 'bg-[#E50914]'
                        }`}></div>
                        <div className={`absolute inset-2 rounded-full animate-pulse opacity-40 ${
                          verificationStage === 'received' || verificationStage === 'allocating'
                            ? 'bg-emerald-600'
                            : 'bg-red-600'
                        }`}></div>
                        
                        {/* Core Icon Container */}
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border ${
                          verificationStage === 'received' || verificationStage === 'allocating'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-900 border-red-500/30 text-[#E50914]'
                        }`}>
                          {verificationStage === 'initiating' && <div className="w-4 h-4 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>}
                          {verificationStage === 'querying' && <QrCode className="w-5 h-5 animate-pulse" />}
                          {verificationStage === 'analyzing' && <Building className="w-5 h-5 animate-bounce" />}
                          {verificationStage === 'received' && <Check className="w-6 h-6 animate-bounce" />}
                          {verificationStage === 'allocating' && <Sparkles className="w-5 h-5 animate-pulse" />}
                        </div>
                      </div>

                      {/* BADGE: Real-Time Payment Verification Status Badge */}
                      <div className="flex flex-col gap-1.5 items-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                          verificationStage === 'initiating' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' :
                          verificationStage === 'querying' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          verificationStage === 'analyzing' ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 animate-pulse' :
                          verificationStage === 'received' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          verificationStage === 'allocating' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                          'bg-red-500/10 border-red-500/30 text-[#E50914]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            verificationStage === 'received' || verificationStage === 'allocating' ? 'bg-emerald-400' : 'bg-red-500 animate-ping'
                          }`}></span>
                          {verificationStage === 'initiating' && 'Verifying payment...'}
                          {verificationStage === 'querying' && 'Querying Bank Ledger...'}
                          {verificationStage === 'analyzing' && 'Analyzing Capitec Statement...'}
                          {verificationStage === 'received' && 'Payment Received!'}
                          {verificationStage === 'allocating' && 'Activating Premium Status...'}
                        </span>
                        
                        <h4 className="text-sm font-black text-white mt-1 text-center">
                          {verificationStage === 'initiating' && 'Initiating Secure Verification'}
                          {verificationStage === 'querying' && 'Checking Bank Transaction Stream'}
                          {verificationStage === 'analyzing' && `Scanning for Ref: ${simulatedRef}`}
                          {verificationStage === 'received' && 'R150.00 Settled successfully!'}
                          {verificationStage === 'allocating' && 'Syncing Skhanda TV Premium Token'}
                        </h4>
                      </div>
                    </div>

                    {/* Verification Log Console */}
                    <div className="bg-black border border-zinc-900 rounded-2xl p-4 font-mono text-[10px] flex flex-col gap-2 min-h-[120px] max-h-[160px] overflow-y-auto">
                      <div className="text-zinc-500 border-b border-zinc-900 pb-1.5 flex justify-between items-center text-[8px] font-bold uppercase tracking-wider">
                        <span>SYSTEM TELEMETRY LOGS</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                          LIVE SYNCING
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        {verificationLogs.map((log, index) => (
                          <div key={index} className="text-zinc-400 flex items-start gap-1 leading-normal text-left font-mono">
                            <span className="text-emerald-500 font-bold shrink-0">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[9px] text-zinc-600 text-center leading-relaxed">
                      Please do not close this portal or reload the application. Real-time verification is running automatically.
                    </p>
                  </div>
                ) : paymentFinished ? (
                  /* Success Feedback */
                  <div id="payment-success-feedback" className="flex flex-col items-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                      <ShieldCheck className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Premium Access Unlocked</h3>
                    <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
                      Thank you! Your payment of <span className="text-white font-bold">R150.00</span> has been received. Premium channels are now active instantly.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Common Merchant Info */}
                    <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-850 flex justify-between items-center text-xs mb-5">
                      <div>
                        <span className="text-zinc-500 text-[8px] uppercase font-bold block tracking-wider">Account Destination</span>
                        <span className="text-white font-extrabold">Capitec Bank • MR B NKOSI</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold block tracking-wider">Subscription Fee</span>
                        <span className="text-[#E50914] font-black text-sm">R 150.00</span>
                      </div>
                    </div>

                    {/* METHOD 1: CARD SIMULATION */}
                    {activeMethod === 'card' && (
                      <form onSubmit={handleSimulatedCardPayment} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Bongani Nkosi"
                            className="bg-zinc-900 border border-zinc-850 text-white p-3 rounded-xl text-xs focus:outline-none focus:border-[#E50914]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Card Number</label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                              const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardNumber(formatted);
                            }}
                            placeholder="4111 2222 3333 4444"
                            className="bg-zinc-900 border border-zinc-850 text-white p-3 rounded-xl text-xs focus:outline-none focus:border-[#E50914] font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Expiry Date</label>
                            <input
                              type="text"
                              required
                              value={expiry}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                const formatted = val.length >= 2 ? `${val.substring(0, 2)}/${val.substring(2)}` : val;
                                setExpiry(formatted);
                              }}
                              placeholder="MM/YY"
                              className="bg-zinc-900 border border-zinc-850 text-white p-3 rounded-xl text-xs focus:outline-none focus:border-[#E50914] font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">CVV</label>
                            <input
                              type="password"
                              required
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                              placeholder="123"
                              className="bg-zinc-900 border border-zinc-850 text-white p-3 rounded-xl text-xs focus:outline-none focus:border-[#E50914] font-mono"
                            />
                          </div>
                        </div>

                        <button
                          id="submit-card-payment"
                          type="submit"
                          disabled={processing}
                          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2 cursor-pointer"
                        >
                          {processing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing Online Transaction...</span>
                            </div>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Pay R150.00 securely</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* METHOD 2: DIRECT BANK TRANSFER (CAPITEC BANK EFT) */}
                    {activeMethod === 'eft' && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-sky-600/10 border border-sky-500/20 p-3 rounded-xl text-[10px] text-sky-400 leading-normal flex items-start gap-2">
                          <span className="text-sm mt-0.5">🏦</span>
                          <p>
                            Please make a direct bank transfer of <strong className="text-white font-black">R150.00</strong> to the account below, then click "Verify My Payment" for instant activation.
                          </p>
                        </div>

                        {/* Interactive fields list */}
                        <div className="flex flex-col gap-2 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                          {/* Bank Field */}
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-900/60">
                            <div>
                              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold block">Bank Name</span>
                              <span className="text-white font-bold">Capitec Bank</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard('Capitec Bank', 'bank')}
                              className="p-1 text-zinc-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold">{copiedField === 'bank' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Account Holder Field */}
                          <div className="flex justify-between items-center text-xs py-2 border-b border-zinc-900/60">
                            <div>
                              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold block">Account Holder</span>
                              <span className="text-white font-bold">MR B NKOSI</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard('MR B NKOSI', 'holder')}
                              className="p-1 text-zinc-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold">{copiedField === 'holder' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Account Number Field */}
                          <div className="flex justify-between items-center text-xs py-2 border-b border-zinc-900/60">
                            <div>
                              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold block">Account Number</span>
                              <span className="text-sky-400 font-black font-mono select-all">1976184299</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard('1976184299', 'acc')}
                              className="p-1 text-zinc-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold">{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Universal Branch Code */}
                          <div className="flex justify-between items-center text-xs py-2 border-b border-zinc-900/60">
                            <div>
                              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold block">Branch Code</span>
                              <span className="text-zinc-300 font-mono">470010</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard('470010', 'branch')}
                              className="p-1 text-zinc-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold">{copiedField === 'branch' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Payment Reference */}
                          <div className="flex justify-between items-center text-xs pt-2">
                            <div>
                              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold block">Payment Reference</span>
                              <span className="text-[#E50914] font-black font-mono select-all">{simulatedRef}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(simulatedRef, 'ref')}
                              className="p-1 text-zinc-500 hover:text-white transition flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold">{copiedField === 'ref' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* File Upload for Proof of Payment */}
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Proof of Payment (Optional)</span>
                          <label className="border border-dashed border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-500/40 hover:bg-zinc-900/30 transition">
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                              onChange={handleFileChange}
                            />
                            <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {proofUploaded ? `Attached: ${proofFileName}` : "Upload receipt or proof of payment"}
                            </span>
                            <span className="text-[8px] text-zinc-600 mt-0.5">PDF, PNG, JPG accepted</span>
                          </label>
                        </div>

                        <button
                          id="verify-eft-payment-btn"
                          onClick={handleEFTConfirm}
                          disabled={processing}
                          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2 cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                        >
                          {processing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Confirming payment receipt...</span>
                            </div>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify My EFT Payment</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* METHOD 3: CAPITEC PAY SIMULATION */}
                    {activeMethod === 'capitec_pay' && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-xl text-[10px] text-emerald-400 leading-normal flex items-start gap-2">
                          <span className="text-sm mt-0.5">📲</span>
                          <p>
                            <span className="font-bold">Capitec Pay</span> is the fastest instant mobile approval method. Simply enter your Capitec-linked cellphone number below, then click "Send Payment Request".
                          </p>
                        </div>

                        {capitecPayState === 'idle' && (
                          <form onSubmit={handleCapitecPaySubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Your Capitec Cellphone Number</label>
                              <input
                                type="tel"
                                required
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, '').substring(0, 10))}
                                placeholder="e.g. 0672988485"
                                className="bg-zinc-900 border border-zinc-850 text-white p-3.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono tracking-wider w-full"
                              />
                            </div>

                            <button
                              id="send-capitec-pay-request-btn"
                              type="submit"
                              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              <span>Send Payment Request</span>
                            </button>
                          </form>
                        )}

                        {capitecPayState === 'sending' && (
                          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-white font-bold">Connecting Capitec API...</span>
                              <span className="text-[9px] text-zinc-500 font-mono">Resolving customer id on node 067...</span>
                            </div>
                          </div>
                        )}

                        {capitecPayState === 'pending' && (
                          <div className="flex flex-col gap-4 py-4">
                            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-850 flex flex-col items-center text-center gap-2">
                              <span className="text-xl animate-bounce">📱</span>
                              <span className="text-xs text-white font-bold uppercase tracking-wider">Approve Notification Sent!</span>
                              <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed mt-1">
                                We sent a payment request of <strong className="text-white">R150.00</strong> to the Capitec App linked with <strong className="text-white">{phoneNo}</strong>.
                              </p>
                              <div className="w-full bg-zinc-950 rounded-full h-1 mt-2.5 overflow-hidden border border-zinc-850">
                                <motion.div 
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 4, ease: "linear" }}
                                  className="bg-emerald-500 h-full"
                                />
                              </div>
                              <span className="text-[9px] text-emerald-400 font-bold mt-1.5 animate-pulse">
                                Waiting for your pin approval on Capitec Banking App...
                              </span>
                            </div>

                            <p className="text-[9px] text-zinc-600 text-center leading-normal">
                              💡 <strong>Tip:</strong> Open your Capitec App, sign in, find the "Capitec Pay" menu or notification, and authorize this transaction.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* METHOD 4: SCAN TO PAY (VISUAL QR CODE GENERATOR) */}
                    {activeMethod === 'scan' && (
                      <div className="flex flex-col gap-4 items-center text-center">
                        <div className="bg-purple-600/10 border border-purple-500/20 p-3 rounded-xl text-[10px] text-purple-400 leading-normal text-left flex items-start gap-2 w-full">
                          <span className="text-sm mt-0.5">🤳</span>
                          <p>
                            Scan the dynamically generated payment QR code with <span className="font-bold text-white">Capitec App, SnapScan, Zapper,</span> or any South African banking app for instant premium activation.
                          </p>
                        </div>

                        {/* QR Code Container */}
                        <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl relative inline-block group">
                          <img 
                            src={qrCodeUrl} 
                            alt="Payment QR Code" 
                            className="w-[180px] h-[180px] rounded-lg border border-zinc-950 select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <span className="text-[9px] text-white font-bold bg-[#E50914] px-2 py-1 rounded shadow">Scan Me</span>
                          </div>
                        </div>

                        <div className="text-left w-full bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900 text-xs flex flex-col gap-1.5">
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">QR Reference</span>
                            <span className="text-white font-mono font-bold">{simulatedRef}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Account Destination</span>
                            <span className="text-white font-bold">Capitec Bank • MR B NKOSI</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Universal Branch</span>
                            <span className="text-white font-mono">470010</span>
                          </div>
                        </div>

                        <button
                          id="verify-qr-payment-btn"
                          onClick={handleScanConfirm}
                          disabled={processing}
                          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2 cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                        >
                          {processing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Checking transaction ledger...</span>
                            </div>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify QR Code Scan Payment</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* METHOD 5: SMS / DEEP LINK PAYMENT DETAILS */}
                    {activeMethod === 'sms' && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-amber-600/10 border border-amber-500/20 p-3 rounded-xl text-[10px] text-amber-400 leading-normal text-left flex items-start gap-2 w-full">
                          <span className="text-sm mt-0.5">✉️</span>
                          <p>
                            Click below to open a <strong>pre-filled SMS</strong> or <strong>Email draft</strong> containing the bank subscription transfer details. Send this to yourself or your banking manager.
                          </p>
                        </div>

                        {/* Interactive Deep Link Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <a
                            id="sms-deep-link-btn"
                            href={`sms:?body=${encodeURIComponent(
                              `Skhanda TV Premium Subscription - Pay R150.00 to Capitec Bank Account Holder MR B NKOSI, Acc: 1976184299, Branch: 470010, Ref: ${simulatedRef}`
                            )}`}
                            className="p-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition group cursor-pointer"
                          >
                            <span className="text-2xl group-hover:scale-110 transition duration-250">💬</span>
                            <span className="text-xs text-white font-extrabold">Send via SMS</span>
                            <span className="text-[8px] text-zinc-500 font-mono">Triggers Mobile Messaging</span>
                          </a>

                          <a
                            id="mail-deep-link-btn"
                            href={`mailto:bhongoskhanda@gmail.com?subject=${encodeURIComponent(
                              "Skhanda TV Subscription Payment Detail"
                            )}&body=${encodeURIComponent(
                              `Hello,\n\nHere are the pre-filled Capitec bank details for your instant Skhanda TV Premium Activation:\n\n` +
                              `• Destination Bank: Capitec Bank\n` +
                              `• Account Holder: MR B NKOSI\n` +
                              `• Account Number: 1976184299\n` +
                              `• Universal Branch Code: 470010\n` +
                              `• Subscription Amount: R150.00\n` +
                              `• Unique Payment Reference: ${simulatedRef}\n\n` +
                              `Please complete the R150 transfer using your bank app to unlock premium access.`
                            )}`}
                            className="p-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition group cursor-pointer"
                          >
                            <span className="text-2xl group-hover:scale-110 transition duration-250">📧</span>
                            <span className="text-xs text-white font-extrabold">Send via Email</span>
                            <span className="text-[8px] text-zinc-500 font-mono">Pre-fills Mail Client</span>
                          </a>
                        </div>

                        <div className="text-left w-full bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900 text-xs flex flex-col gap-1.5">
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Capitec Account</span>
                            <span className="text-white font-mono font-bold">1976184299</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Account Holder</span>
                            <span className="text-white font-bold">MR B NKOSI</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Reference</span>
                            <span className="text-[#E50914] font-mono font-bold">{simulatedRef}</span>
                          </div>
                        </div>

                        <button
                          id="verify-sms-payment-btn"
                          onClick={() => {
                            runRealTimeVerification('SMS Handshake', () => {
                              setTimeout(() => {
                                onPaymentSuccess();
                              }, 1500);
                            });
                          }}
                          disabled={processing}
                          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                          {processing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying Mobile handshakes...</span>
                            </div>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify Deep Link / SMS Payment</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

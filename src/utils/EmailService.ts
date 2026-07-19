/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface EmailServiceProps {
  recipientEmail: string;
  eventType: 'payment_success' | 'trial_reminder' | 'payment_failed' | 'subscription_active';
}

export const EmailService = {
  sendPaymentConfirmation: async (email: string, amount: number, transactionId: string) => {
    const emailData = {
      to: email,
      subject: 'Skhanda TV - Payment Confirmation',
      template: 'payment_confirmation',
      data: {
        amount,
        transactionId,
        date: new Date().toISOString(),
        accountHolder: 'Mr Bongani Nkosi',
        accountNumber: '1976184299'
      }
    };
    console.log('Sending email:', emailData);
    return emailData;
  },

  sendTrialReminder: async (email: string, daysLeft: number) => {
    const emailData = {
      to: email,
      subject: `Skhanda TV - Your trial ends in ${daysLeft} days`,
      template: 'trial_reminder',
      data: {
        daysLeft,
        monthlyPrice: 150
      }
    };
    console.log('Sending email:', emailData);
    return emailData;
  },

  sendSubscriptionActive: async (email: string) => {
    const emailData = {
      to: email,
      subject: 'Skhanda TV - Welcome to Premium!',
      template: 'subscription_active',
      data: {
        date: new Date().toISOString()
      }
    };
    console.log('Sending email:', emailData);
    return emailData;
  },

  sendPaymentFailed: async (email: string, reason: string) => {
    const emailData = {
      to: email,
      subject: 'Skhanda TV - Payment Failed',
      template: 'payment_failed',
      data: {
        reason,
        date: new Date().toISOString()
      }
    };
    console.log('Sending email:', emailData);
    return emailData;
  }
};

export default function EmailServiceComponent({
  recipientEmail,
  eventType
}: EmailServiceProps) {
  const emailTemplates = {
    payment_success: {
      title: '✅ Payment Confirmed',
      message: 'Your payment has been successfully processed',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    trial_reminder: {
      title: '⏰ Trial Ending Soon',
      message: 'Your free trial is ending soon. Subscribe to keep access',
      icon: Clock,
      color: 'text-yellow-400'
    },
    payment_failed: {
      title: '❌ Payment Failed',
      message: 'Your payment could not be processed. Please try again',
      icon: AlertCircle,
      color: 'text-red-400'
    },
    subscription_active: {
      title: '🎉 Welcome Premium Member',
      message: 'Your subscription is now active. Enjoy unlimited access',
      icon: CheckCircle,
      color: 'text-green-400'
    }
  };

  const template = emailTemplates[eventType];
  const Icon = template.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex gap-3"
    >
      <Mail className="w-5 h-5 text-[#E50914] flex-shrink-0" />
      <div>
        <p className="text-sm font-bold text-white mb-1">Email Sent</p>
        <p className="text-xs text-zinc-400">Confirmation sent to {recipientEmail}</p>
      </div>
    </motion.div>
  );
}

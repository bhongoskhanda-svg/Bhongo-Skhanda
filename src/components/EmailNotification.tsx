/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

interface EmailNotificationProps {
  show: boolean;
  notification: {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  };
  onClose: () => void;
}

export default function EmailNotification({
  show,
  notification,
  onClose
}: EmailNotificationProps) {
  const icons = {
    success: Check,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  };

  const colors = {
    success: 'bg-green-950 border-green-900 text-green-400',
    error: 'bg-red-950 border-red-900 text-red-400',
    info: 'bg-blue-950 border-blue-900 text-blue-400',
    warning: 'bg-yellow-950 border-yellow-900 text-yellow-400'
  };

  const Icon = icons[notification.type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`${colors[notification.type]} border rounded-lg p-4 flex gap-3 shadow-lg`}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">{notification.title}</p>
              <p className="text-xs opacity-75 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-opacity-75 hover:text-opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';

interface PaymentReport {
  id: string;
  user: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  paymentMethod: string;
  transactionId: string;
}

interface AdminPaymentDashboardProps {
  totalRevenue: number;
  totalSubscribers: number;
  activeSubscriptions: number;
  paymentReports: PaymentReport[];
}

export default function AdminPaymentDashboard({
  totalRevenue,
  totalSubscribers,
  activeSubscriptions,
  paymentReports
}: AdminPaymentDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const filteredReports = paymentReports.filter((report) => {
    if (selectedMonth === 'all') return true;
    const reportMonth = new Date(report.date).toISOString().slice(0, 7);
    return reportMonth === selectedMonth;
  });

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csv = [
        ['Transaction ID', 'User', 'Amount (R)', 'Status', 'Date', 'Payment Method'],
        ...filteredReports.map((r) => [
          r.transactionId,
          r.user,
          r.amount,
          r.status,
          r.date,
          r.paymentMethod
        ])
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skhanda-payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
          <DollarSign className="w-8 h-8 text-[#E50914]" />
          <span>Payment Dashboard</span>
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `R${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-600 to-emerald-600'
          },
          {
            label: 'Total Subscribers',
            value: totalSubscribers.toLocaleString(),
            icon: Users,
            color: 'from-blue-600 to-cyan-600'
          },
          {
            label: 'Active Subscriptions',
            value: activeSubscriptions.toLocaleString(),
            icon: CheckCircle,
            color: 'from-[#E50914] to-red-600'
          },
          {
            label: 'Avg Monthly Revenue',
            value: `R${Math.round(totalRevenue / 12).toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-purple-600 to-pink-600'
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white border border-white/20 shadow-lg`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold opacity-75 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters & Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#E50914] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-red-600 text-white font-bold rounded-lg transition"
        >
          <Download className="w-4 h-4" />
          Export as CSV
        </button>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-zinc-800 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  User
                </th>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  Amount
                </th>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  Method
                </th>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredReports.map((report, idx) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-zinc-900/50 transition"
                >
                  <td className="px-6 py-4 text-white font-mono text-xs">{report.transactionId}</td>
                  <td className="px-6 py-4 text-white">{report.user}</td>
                  <td className="px-6 py-4 font-bold text-[#E50914]">R{report.amount}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="px-2 py-1 bg-zinc-900 rounded text-xs font-bold">
                      {report.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        report.status === 'Completed'
                          ? 'bg-green-900/30 text-green-400'
                          : report.status === 'Pending'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.date}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payments found for selected period</p>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl border border-zinc-800"
      >
        <h3 className="text-lg font-bold text-white mb-4">Period Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-white">{filteredReports.length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {filteredReports.filter((r) => r.status === 'Completed').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {filteredReports.filter((r) => r.status === 'Pending').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Period Revenue</p>
            <p className="text-2xl font-bold text-[#E50914]">
              R{filteredReports
                .filter((r) => r.status === 'Completed')
                .reduce((sum, r) => sum + r.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

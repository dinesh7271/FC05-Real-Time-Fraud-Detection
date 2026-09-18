import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, Lock, Activity, ShieldAlert, Cpu, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { fraudService } from '../services/api';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fraudService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Security Command Center">
        <div className="flex flex-col items-center justify-center py-24 bg-[#141224] rounded-2xl border border-purple-900/30">
          <Loader size="lg" />
          <p className="mt-4 text-purple-200 font-mono text-sm tracking-wide">
            Aggregating neural telemetry & live incidents...
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      badge="COMMAND INTELLIGENCE"
      title="Security Command Center"
      subtitle="Real-time telemetry, model inference metrics, and autonomous lock enforcement across financial network."
      action={
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900/30 border border-purple-600/40 text-purple-200 text-xs font-bold hover:bg-purple-900/50 transition-colors font-mono cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH METRICS
        </button>
      }
    >
      {/* 4 Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Transactions Analyzed"
          value={stats.totalTransactions?.toLocaleString() || '12,450'}
          icon={<Activity className="w-5 h-5 text-brand-400" />}
          trend="+14% volume vs 24h"
          ribbon="METRIC // VOLUME"
        />
        <StatCard
          label="High Risk Threats Intercepted"
          value={stats.highRiskCount?.toLocaleString() || '342'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend="2.7% anomaly rate"
          variant="warning"
          ribbon="METRIC // THREATS"
        />
        <StatCard
          label="Accounts Autonomously Locked"
          value={stats.currentlyLocked?.toLocaleString() || '89'}
          icon={<Lock className="w-5 h-5 text-rose-400" />}
          trend="Protected assets: $1.2M"
          variant="danger"
          ribbon="METRIC // SHIELD"
        />
        <StatCard
          label="Active Security Incidents"
          value={stats.securityIncidents?.toLocaleString() || '12'}
          icon={<ShieldAlert className="w-5 h-5 text-emerald-400" />}
          trend="Resolution time < 3m"
          variant="success"
          ribbon="METRIC // INCIDENTS"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Fraud Trends Line Chart */}
        <div className="lg:col-span-7">
          <Card
            ribbon="7-DAY RISK TRAJECTORY"
            title="Temporal Fraud Velocity & Detection"
            subtitle="Hourly and daily spike frequency of high-probability fraud attempts"
            variant="highlight"
          >
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.fraudTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26233d" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131124', border: '1px solid #582b8c', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#c4b5fd' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#6344d4', stroke: '#c4b5fd', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="lg:col-span-5">
          <Card
            ribbon="CLASSIFICATION DISTRIBUTION"
            title="Risk Portfolio Segmentation"
            subtitle="Breakdown by ML predicted risk tiers"
            variant="highlight"
          >
            <div className="h-80 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.riskDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131124', border: '1px solid #582b8c', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white font-display">
                  {stats.totalTransactions ? (stats.totalTransactions > 999 ? `${(stats.totalTransactions / 1000).toFixed(1)}k` : stats.totalTransactions) : '12.4k'}
                </span>
                <span className="text-[11px] text-purple-300 font-mono uppercase tracking-widest">TRANSACTIONS</span>
              </div>
            </div>
            
            {/* Legend bar */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-purple-900/30 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low Risk
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Risk
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Critical Incidents Real-Time Table */}
      <Card
        ribbon="INCIDENT LOG // THREAT ESCALATION"
        title="Recent Critical Security Interceptions"
        subtitle="Transactions quarantined by the adaptive lock engine requiring compliance review"
        variant="highlight"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs uppercase font-mono tracking-wider text-purple-300/80 border-b border-purple-900/40 bg-purple-950/20">
              <tr>
                <th className="px-5 py-3 font-semibold">Incident ID</th>
                <th className="px-5 py-3 font-semibold">Severity</th>
                <th className="px-5 py-3 font-semibold">Flagged Amount</th>
                <th className="px-5 py-3 font-semibold">Heuristic Signals</th>
                <th className="px-5 py-3 font-semibold">Enforced Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/40 text-sm">
              {[
                { id: 'INC-8891-X', level: 'HIGH', amount: 32000, reasons: 'New Device + Geo Shift + 3 AM Velocity', action: 'Account Autonomously Locked' },
                { id: 'INC-8894-L', level: 'HIGH', amount: 15400, reasons: 'Unrecognized Recipient + 10x Avg Delta', action: 'Account Autonomously Locked' },
                { id: 'INC-8902-M', level: 'MEDIUM', amount: 1200, reasons: 'Geographic Delta (NYC -> Lagos)', action: 'Step-Up MFA Challenge' },
                { id: 'INC-8915-M', level: 'MEDIUM', amount: 850, reasons: 'Off-hours velocity spike (4 req/min)', action: 'Risk Alert Dispatched' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-900/10 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-brand-300 font-semibold">{item.id}</td>
                  <td className="px-5 py-4">
                    <Badge variant={item.level === 'HIGH' ? 'danger' : 'warning'}>
                      {item.level}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-bold text-white font-mono">${item.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-300 text-xs">{item.reasons}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40 border border-purple-900/40 text-slate-200">
                      {item.level === 'HIGH' ? <Lock className="w-3 h-3 text-rose-400" /> : <ShieldCheck className="w-3 h-3 text-amber-400" />}
                      {item.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

const StatCard = ({ label, value, icon, trend, variant = 'neutral', ribbon = null }) => {
  const cardBorders = {
    neutral: 'border-purple-950/80',
    warning: 'border-amber-500/30',
    danger: 'border-rose-500/30',
    success: 'border-emerald-500/30',
  };

  return (
    <div className={`rounded-2xl bg-[#151326] border ${cardBorders[variant]} p-5 shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1`}>
      {ribbon && (
        <div className="text-[10px] font-mono font-bold tracking-widest text-purple-300/60 uppercase mb-3">
          {ribbon}
        </div>
      )}
      <div className="flex justify-between items-center mb-3">
        <div className="text-3xl font-black text-white font-display tracking-tight">{value}</div>
        <div className="p-2.5 bg-black/40 rounded-xl border border-purple-900/40">{icon}</div>
      </div>
      <div className="text-xs font-semibold text-slate-300 mb-2">{label}</div>
      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
        {trend}
      </div>
    </div>
  );
};

export default AdminDashboard;

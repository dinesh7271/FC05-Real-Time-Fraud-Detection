import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, Lock, Activity, ShieldAlert } from 'lucide-react';
import { fraudService } from '../services/api';

const COLORS = ['#6366f1', '#f59e0b', '#f43f5e'];

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
      <PageContainer title="Admin Dashboard">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader size="lg" />
          <p className="mt-4 text-slate-400">Aggregating security telemetry...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Admin Security Command"
      subtitle="Real-time monitoring of fraud patterns and account protection metrics."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Transactions"
          value={stats.totalTransactions?.toLocaleString()}
          icon={<Activity className="w-5 h-5 text-indigo-400" />}
          trend="+12% vs last month"
        />
        <StatCard
          label="High Risk Detected"
          value={stats.highRiskCount?.toLocaleString()}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend="+4% risk increase"
          variant="warning"
        />
        <StatCard
          label="Accounts Locked"
          value={stats.currentlyLocked?.toLocaleString()}
          icon={<Lock className="w-5 h-5 text-rose-400" />}
          trend="-2% decrease"
          variant="danger"
        />
        <StatCard
          label="Security Incidents"
          value={stats.securityIncidents?.toLocaleString()}
          icon={<ShieldAlert className="w-5 h-5 text-emerald-400" />}
          trend="Stable"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card title="Fraud Trends (Weekly)">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.fraudTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Risk Distribution">
          <div className="h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.riskDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">Risk</span>
              <span className="text-xs text-slate-400">Profile</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Critical Incidents">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Risk Level</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Action Taken</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                { id: 'TX-9901', level: 'HIGH', amount: 12000, action: 'Account Locked' },
                { id: 'TX-9905', level: 'HIGH', amount: 4500, action: 'Manual Review' },
                { id: 'TX-9912', level: 'MEDIUM', amount: 800, action: 'MFA Requested' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-slate-800/50">
                  <td className="px-4 py-4 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-4"><Badge variant={item.level === 'HIGH' ? 'danger' : 'warning'}>{item.level}</Badge></td>
                  <td className="px-4 py-4">${item.amount}</td>
                  <td className="px-4 py-4 text-sm">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

const StatCard = ({ label, value, icon, trend, variant = 'neutral' }) => {
  const variantStyles = {
    neutral: 'border-slate-800',
    warning: 'border-amber-500/20',
    danger: 'border-rose-500/20',
  };

  return (
    <Card className={`relative overflow-hidden ${variantStyles[variant]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
        <span className={`text-xs font-medium ${trend.includes('+') ? 'text-rose-400' : 'text-emerald-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </Card>
  );
};

export default AdminDashboard;

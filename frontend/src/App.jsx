import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, fraud: 0 });

  const fetchLatest = async () => {
    try {
      // Mock fetch or real API call
      const response = await axios.get(`${API_BASE}/`);
      console.log('Backend status:', response.data);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-blue-400">FC-05 Fraud Detection</h1>
          <p className="text-gray-400">Real-time Financial Monitoring System</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <Activity className="text-green-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase">System Status</p>
              <p className="font-semibold">Operational</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<DollarSign />} label="Total Processed" value={`$${stats.total}`} color="text-blue-400" />
        <StatCard icon={<AlertTriangle />} label="Fraud Detected" value={stats.fraud} color="text-red-400" />
        <StatCard icon={<CheckCircle />} label="Accuracy" value="99.2%" color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Fraud Trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{backgroundColor: '#1F2937', border: 'none'}} />
                <Line type="monotone" dataKey="fraud" stroke="#F87171" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="3" className="py-4 text-center text-gray-500">No recent activity</td></tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                      <td className="py-3 text-sm">{tx.id}</td>
                      <td className="py-3 text-sm">${tx.amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${tx.is_fraud ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                          {tx.is_fraud ? 'Fraud' : 'Clean'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-gray-700 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const mockData = [
  { name: '10:00', fraud: 4 },
  { name: '11:00', fraud: 3 },
  { name: '12:00', fraud: 12 },
  { name: '13:00', fraud: 2 },
  { name: '14:00', fraud: 7 },
  { name: '15:00', fraud: 5 },
];

export default App;

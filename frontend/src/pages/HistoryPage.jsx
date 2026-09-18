import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { Search } from 'lucide-react';
import { fraudService } from '../services/api';

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fraudService.getTransactionHistory({ filter });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'All') return true;
    if (filter === 'Locked') return tx.status === 'Locked' || tx.is_locked === true;
    if (filter === 'High Risk') return tx.riskLevel === 'HIGH' || tx.risk_level === 'HIGH';
    if (filter === 'Normal') return tx.status === 'Normal' || (tx.riskLevel === 'LOW' || tx.risk_level === 'LOW');
    return true;
  });

  const getStatusBadge = (tx) => {
    if (tx.status === 'Locked' || tx.is_locked === true) return <Badge variant="danger">Locked</Badge>;
    if (tx.riskLevel === 'HIGH' || tx.risk_level === 'HIGH') return <Badge variant="warning">High Risk</Badge>;
    return <Badge variant="success">Normal</Badge>;
  };

  return (
    <PageContainer
      title="Transaction History"
      subtitle="Complete audit trail of all processed transactions and their risk assessments."
    >
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Locked', 'High Risk', 'Normal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-slate-800 border border-slate-700 text-white pl-9 pr-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none w-full md:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size="lg" />
            <p className="mt-4 text-slate-400">Loading transaction logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-slate-400 text-sm border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Risk Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-indigo-400">{tx.id}</td>
                    <td className="px-4 py-4 text-sm">{tx.date || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">{tx.recipient || 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm font-medium">${tx.amount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm">{tx.location || 'Unknown'}</td>
                    <td className="px-4 py-4">{getStatusBadge(tx)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-slate-500 italic">
                      No transactions found matching the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default HistoryPage;

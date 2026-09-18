import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { Search, Download, RefreshCw, Shield, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { fraudService } from '../services/api';

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
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
    const matchesFilter = (() => {
      if (filter === 'All') return true;
      if (filter === 'Locked') return tx.status === 'Locked' || tx.is_locked === true;
      if (filter === 'High Risk') return tx.riskLevel === 'HIGH' || tx.risk_level === 'HIGH';
      if (filter === 'Normal') return tx.status === 'Normal' || (tx.riskLevel === 'LOW' || tx.risk_level === 'LOW');
      return true;
    })();

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      (tx.id || '').toLowerCase().includes(q) ||
      (tx.recipient || '').toLowerCase().includes(q) ||
      (tx.location || '').toLowerCase().includes(q) ||
      (tx.user_id || '').toLowerCase().includes(q)
    );

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (tx) => {
    if (tx.status === 'Locked' || tx.is_locked === true) return <Badge variant="danger">LOCKED</Badge>;
    if (tx.riskLevel === 'HIGH' || tx.risk_level === 'HIGH') return <Badge variant="danger">HIGH RISK</Badge>;
    if (tx.riskLevel === 'MEDIUM' || tx.risk_level === 'MEDIUM') return <Badge variant="warning">REVIEW</Badge>;
    return <Badge variant="success">APPROVED</Badge>;
  };

  return (
    <PageContainer
      badge="AUDIT LOG"
      title="Transaction Audit Trail"
      subtitle="Complete chronological record of all evaluated financial events, risk predictions, and automated actions."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-900/30 border border-purple-600/40 text-purple-200 text-xs font-bold hover:bg-purple-900/50 transition-colors font-mono cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> REFRESH
          </button>
        </div>
      }
    >
      <Card
        ribbon="DATABASE AUDIT TRAIL // REAL-TIME INGESTION"
        variant="highlight"
      >
        {/* Controls: Filter Pills & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Locked', 'High Risk', 'Normal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer font-mono ${
                  filter === f
                    ? 'bg-gradient-to-r from-brand-600 to-purple-700 text-white shadow-glow-purple border border-purple-400/40'
                    : 'bg-[#121424] text-slate-400 hover:text-white border border-purple-950 hover:border-purple-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search ID, recipient, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111322] border border-purple-900/40 text-white placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none w-full md:w-72 shadow-inner"
            />
          </div>
        </div>

        {/* Transaction Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size="lg" />
            <p className="mt-4 text-purple-300 font-mono text-xs">Querying MongoDB audit collections...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-xs uppercase font-mono tracking-wider text-purple-300/80 border-b border-purple-900/40 bg-purple-950/20">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event ID</th>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Recipient / Merchant</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Risk Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-sm">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
                    <tr
                      key={tx.id || idx}
                      className="hover:bg-purple-900/10 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-brand-300 font-semibold">
                        {tx.id || `TXN-${1000 + idx}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                        {tx.date ? new Date(tx.date).toLocaleString() : 'Just now'}
                      </td>
                      <td className="px-5 py-4 text-slate-200 font-medium">
                        {tx.recipient || 'Unknown Merchant'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        ${Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {tx.location || 'Unknown'}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(tx)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500 italic text-sm">
                      No transaction records match the current filter or search criteria.
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

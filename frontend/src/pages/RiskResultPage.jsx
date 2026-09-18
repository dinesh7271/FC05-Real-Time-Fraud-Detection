import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Info,
  Lock,
  Unlock,
  Flag
} from 'lucide-react';
import { fraudService } from '../services/api';

const RiskResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction } = location.state || {};
  const [actionLoading, setActionLoading] = useState(false);

  if (!prediction) {
    return (
      <PageContainer title="No Analysis Result">
        <div className="text-center py-20">
          <Info className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-6">No risk analysis data was received from the AI engine.</p>
          <Button onClick={() => navigate('/')}>Start New Assessment</Button>
        </div>
      );
    }

  const { risk_score, risk_level, explanation, reasons, is_locked, lock_id } = prediction;

  const getRiskColors = (level) => {
    if (level === 'HIGH') {
      return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', badge: 'danger', icon: <ShieldAlert className="w-12 h-12 text-rose-400" /> };
    }
    if (level === 'MEDIUM') {
      return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'warning', icon: <AlertTriangle className="w-12 h-12 text-amber-400" /> };
    }
    return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'success', icon: <CheckCircle className="w-12 h-12 text-emerald-400" /> };
  };

  const colors = getRiskColors(risk_level);

  const handleVerify = async () => {
    if (!lock_id) {
      alert('No active lock ID found for this transaction.');
      return;
    }
    setActionLoading(true);
    try {
      const result = await fraudService.verifyTransaction(lock_id);
      alert(result.message || 'Transaction verified and unlocked successfully!');
      navigate('/history');
    } catch (error) {
      alert('Verification failed. Please contact support.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!lock_id) {
      alert('No active lock ID found for this transaction.');
      return;
    }
    setActionLoading(true);
    try {
      const result = await fraudService.reportFraud(lock_id);
      alert(result.message || 'Fraud report submitted successfully.');
      navigate('/history');
    } catch (error) {
      alert('Reporting failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessment
        </Button>

        {is_locked && (
          <div className="mb-8 bg-rose-500/20 border border-rose-500/40 p-4 rounded-xl flex items-center gap-4 animate-pulse">
            <Lock className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-rose-400 font-bold">Transaction Temporarily Locked</h4>
              <p className="text-rose-200/80 text-sm">High risk detected. Account access restricted for this specific transaction (ID: {lock_id})</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`md:col-span-1 flex flex-col items-center justify-center text-center py-12 ${colors.bg} ${colors.border} border-2`}>
            <div className="mb-4">{colors.icon}</div>
            <div className={`text-4xl font-black mb-1 ${colors.text}`}>
              {(risk_score * 100).toFixed(1)}%
            </div>
            <Badge variant={colors.badge}>{risk_level} RISK</Badge>
          </Card>

          <Card className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">AI Risk Analysis (RAG)</h3>
            </div>
            <p className="text-slate-300 leading-relaxed italic">
              "{explanation || 'The AI model has analyzed the transaction patterns and determined the risk based on historical behavioral data and real-time heuristics.'}"
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Contributing Risk Factors">
            <ul className="space-y-3">
              {reasons && reasons.length > 0 ? reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-400 text-sm">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                  {reason}
                </li>
              )) : (
                <li className="text-slate-500 text-sm italic">No specific risk factors identified.</li>
              )}
            </ul>
          </Card>

          <Card title="Security Resolution" className="flex flex-col justify-center">
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full py-3"
                onClick={handleVerify}
                disabled={actionLoading}
              >
                <Unlock className="w-4 h-4" /> This was me – Verify & Unlock
              </Button>
              <Button
                variant="danger"
                className="w-full py-3"
                onClick={handleReport}
                disabled={actionLoading}
              >
                <Flag className="w-4 h-4" /> This was NOT me – Report Fraud
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default RiskResultPage;

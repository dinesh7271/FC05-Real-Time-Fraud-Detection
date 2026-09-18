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
  Flag,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { fraudService } from '../services/api';

const RiskResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction } = location.state || {};
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!prediction) {
    return (
      <PageContainer title="No Assessment Result">
        <div className="max-w-xl mx-auto text-center py-20 bg-[#161226] border border-purple-900/40 rounded-2xl p-8">
          <Info className="w-14 h-14 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Assessment Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            Please submit a transaction profile from the risk assessment terminal to generate a live risk score.
          </p>
          <Button onClick={() => navigate('/')}>
            Launch Risk Assessment Terminal
          </Button>
        </div>
      </PageContainer>
    );
  }

  const { risk_score, risk_level, explanation, reasons, is_locked, lock_id, action } = prediction;

  const getRiskConfig = (level) => {
    if (level === 'HIGH') {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'danger',
        label: 'CRITICAL THREAT DETECTED',
        icon: ShieldAlert,
        ribbon: 'ACTION TRIGGERED: AUTOMATED ACCOUNT LOCK',
      };
    } else if (level === 'MEDIUM') {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'warning',
        label: 'SUSPICIOUS / ELEVATED RISK',
        icon: AlertTriangle,
        ribbon: 'ACTION TRIGGERED: STEP-UP AUTH & MFA REVIEW',
      };
    } else {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        badge: 'success',
        label: 'TRANSACTION VERIFIED LEGITIMATE',
        icon: CheckCircle,
        ribbon: 'ACTION TRIGGERED: AUTHORIZATION APPROVED',
      };
    }
  };

  const config = getRiskConfig(risk_level);
  const StatusIcon = config.icon;

  const handleVerify = async () => {
    if (!lock_id) {
      alert('No lock record associated with this transaction.');
      return;
    }
    setActionLoading(true);
    try {
      const result = await fraudService.verifyTransaction(lock_id);
      setStatusMessage({ type: 'success', text: result.message || 'Identity confirmed. Account lock lifted successfully!' });
      setTimeout(() => navigate('/history'), 1500);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Verification failed. Please contact administrator.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!lock_id) {
      alert('No lock record associated with this transaction.');
      return;
    }
    setActionLoading(true);
    try {
      const result = await fraudService.reportFraud(lock_id);
      setStatusMessage({ type: 'danger', text: result.message || 'Fraud confirmed. Security team dispatched; credentials revoked.' });
      setTimeout(() => navigate('/history'), 1500);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Fraud report failed. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer
      badge="ASSESSMENT RESULT"
      title="Security Intelligence Verdict"
      subtitle={`Comprehensive telemetry breakdown & AI explainability for transaction evaluated by SentinelFraud engine.`}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" /> New Assessment
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Status feedback alert banner */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}>
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Lock Alert Banner if account locked */}
        {is_locked && (
          <div className="bg-gradient-to-r from-rose-950/80 via-red-900/40 to-[#1b1226] border-2 border-rose-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-rose-300 font-black tracking-wide text-base">
                    ACCOUNT AUTONOMOUSLY LOCKED
                  </h4>
                  <Badge variant="danger">SECURITY LOCKOUT</Badge>
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  High-risk telemetry triggered automatic protection lock ID: <span className="font-mono text-rose-200 font-semibold">{lock_id}</span>
                </p>
              </div>
            </div>
            <div className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-200 shrink-0">
              STATUS: PENDING USER RESOLUTION
            </div>
          </div>
        )}

        {/* Top Split: Risk Score Card & RAG Editorial Card (Matches Reference Infographic + Popover Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Risk Verdict Gauge Card */}
          <div className="lg:col-span-4">
            <Card
              ribbon={config.ribbon}
              className={`h-full flex flex-col justify-between ${config.bg} ${config.border} border-2`}
              variant="highlight"
            >
              <div className="flex flex-col items-center text-center py-6">
                <div className="p-4 rounded-2xl bg-black/30 mb-4 border border-white/10 shadow-inner">
                  <StatusIcon className={`w-14 h-14 ${config.text}`} />
                </div>
                
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 font-mono">
                  CALCULATED RISK SCORE
                </span>
                
                <div className={`text-5xl font-black tracking-tight mb-2 font-display ${config.text}`}>
                  {(risk_score * 100).toFixed(1)}%
                </div>

                <Badge variant={config.badge} className="px-3 py-1 text-xs uppercase tracking-wider font-bold">
                  {risk_level} RISK &bull; {action}
                </Badge>
              </div>

              <div className="pt-4 border-t border-purple-900/30 text-center">
                <p className="text-xs text-slate-400 font-mono">
                  Engine: <span className="text-white font-semibold">XGBoost 2.0</span> + Heuristic Rules
                </p>
              </div>
            </Card>
          </div>

          {/* Editorial RAG Explanation Card (Inspired directly by reference popover card) */}
          <div className="lg:col-span-8">
            <Card
              ribbon="EXPLAINABLE AI // RAG POLICY SYNTHESIS"
              variant="editorial"
              className="h-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#522ba7] text-white text-[11px] font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                  ENTERPRISE POLICY RAG
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Verified against Corporate Security Policies
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mb-3 tracking-tight">
                AI Transparent Risk Justification
              </h2>

              <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#522ba7] mb-4">
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                  "{explanation || 'The transaction was evaluated through multi-dimensional behavioral scoring and verified compliant with fraud mitigation thresholds.'}"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
                <span className="flex items-center gap-1">
                  <Bot className="w-4 h-4 text-[#522ba7]" />
                  Powered by LLaMA-3 + ChromaDB Vector Store
                </span>
                <span className="font-mono text-[11px] text-purple-900 font-bold">
                  ZERO-HALLUCINATION GUARDRAIL
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Risk Factors & Security Resolution Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Contributing Risk Factors */}
          <Card
            ribbon="TELEMETRY BREAKDOWN"
            title="Contributing Risk Signals"
            subtitle="Specific anomalies identified during transaction ingestion"
            variant="highlight"
          >
            <ul className="space-y-3">
              {reasons && reasons.length > 0 ? (
                reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#111422] border border-purple-950/60 text-slate-300 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 text-sm italic p-4 text-center">
                  Standard baseline profile &mdash; No suspicious anomalies flagged.
                </li>
              )}
            </ul>
          </Card>

          {/* Adaptive Account Resolution */}
          <Card
            ribbon="ADAPTIVE RESOLUTION"
            title="Account Recovery & Confirmation"
            subtitle="Take action to resolve lock state or initiate security escalation"
            variant="highlight"
          >
            <div className="flex flex-col gap-3.5 py-1">
              <Button
                variant="primary"
                size="md"
                className="w-full py-3.5"
                onClick={handleVerify}
                disabled={actionLoading}
              >
                <Unlock className="w-4 h-4" /> This Was Me &mdash; Verify & Unlock Account
              </Button>

              <Button
                variant="danger"
                size="md"
                className="w-full py-3.5"
                onClick={handleReport}
                disabled={actionLoading}
              >
                <Flag className="w-4 h-4" /> This Was NOT Me &mdash; Confirm Fraud & Freeze
              </Button>

              <p className="text-[11px] text-slate-400 text-center font-mono mt-1">
                Audited action will be committed to MongoDB security incident logs.
              </p>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
};

export default RiskResultPage;

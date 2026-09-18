import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import {
  Send,
  Shield,
  User,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { fraudService } from '../services/api';

const TransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: 'USR-8921',
    amount: '450.00',
    transaction_hour: '14',
    new_device: false,
    new_recipient: false,
    location_change: false,
    velocity: '1.2',
    account_age_days: '380',
    avg_transaction_amount: '120.00',
    location: 'San Francisco, USA',
    merchant_id: 'MERCH-STRIPE-404',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQuickPreset = (type) => {
    if (type === 'legit') {
      setFormData({
        user_id: 'USR-LEGIT-101',
        amount: '65.50',
        transaction_hour: '13',
        new_device: false,
        new_recipient: false,
        location_change: false,
        velocity: '1.0',
        account_age_days: '520',
        avg_transaction_amount: '75.00',
        location: 'New York, USA',
        merchant_id: 'AMZN-MARKET',
      });
    } else if (type === 'suspicious') {
      setFormData({
        user_id: 'USR-ALERT-992',
        amount: '28500.00',
        transaction_hour: '3',
        new_device: true,
        new_recipient: true,
        location_change: true,
        velocity: '8.5',
        account_age_days: '14',
        avg_transaction_amount: '110.00',
        location: 'Lagos, Nigeria',
        merchant_id: 'CRYPTO-OFFSHORE-EX',
      });
    } else {
      setFormData({
        user_id: 'USR-REVIEW-505',
        amount: '1200.00',
        transaction_hour: '22',
        new_device: true,
        new_recipient: false,
        location_change: true,
        velocity: '3.1',
        account_age_days: '120',
        avg_transaction_amount: '200.00',
        location: 'London, UK',
        merchant_id: 'LUXURY-BOUTIQUE',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await fraudService.checkTransaction(formData);
      navigate('/result', { state: { prediction: result } });
    } catch (error) {
      alert('Error communicating with fraud detection engine. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      badge="LIVE ENGINE"
      title="Transaction Risk Assessment"
      subtitle="Input real-time transaction telemetry to simulate ML feature extraction, XGBoost inference, and policy enforcement."
      action={
        <div className="flex items-center gap-2 bg-[#1b1536] p-1 rounded-xl border border-purple-900/40">
          <span className="text-xs text-purple-300 font-bold px-2 font-mono">PRESETS:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('legit')}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('medium')}
            className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            Elevated
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('suspicious')}
            className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30 transition-colors"
          >
            Critical Fraud
          </button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Section 1: User Profile & History */}
            <Card
              ribbon="TELEMETRY LAYER 01 // IDENTITY"
              title="Account & Historical Baseline"
              subtitle="User baseline profile used by the ML model to detect deviation"
              variant="highlight"
            >
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="User Identifier"
                  name="user_id"
                  placeholder="e.g. USR-8821"
                  value={formData.user_id}
                  onChange={handleChange}
                  icon={User}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Account Age (Days)"
                    type="number"
                    name="account_age_days"
                    placeholder="e.g. 365"
                    value={formData.account_age_days}
                    onChange={handleChange}
                    icon={Calendar}
                    helperText="Newer accounts (<30d) have higher risk"
                    required
                  />
                  <Input
                    label="Avg. Transaction ($)"
                    type="number"
                    name="avg_transaction_amount"
                    placeholder="50.00"
                    value={formData.avg_transaction_amount}
                    onChange={handleChange}
                    icon={DollarSign}
                    helperText="Historical baseline"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Section 2: Real-Time Event Data */}
            <Card
              ribbon="TELEMETRY LAYER 02 // TRANSACTION"
              title="Current Transaction Telemetry"
              subtitle="Payload parameters sent at time of authorization"
              variant="highlight"
            >
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Amount (USD)"
                  type="number"
                  step="0.01"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  icon={DollarSign}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Hour of Day (0-23)"
                    type="number"
                    name="transaction_hour"
                    value={formData.transaction_hour}
                    onChange={handleChange}
                    icon={Clock}
                    helperText="10 PM–5 AM flags late-night heuristic"
                    required
                  />
                  <Input
                    label="Velocity Score"
                    type="number"
                    step="0.1"
                    name="velocity"
                    placeholder="1.5"
                    value={formData.velocity}
                    onChange={handleChange}
                    icon={Zap}
                    helperText="Trans/hr rate"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    name="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    icon={MapPin}
                    required
                  />
                  <Input
                    label="Merchant Identifier"
                    name="merchant_id"
                    placeholder="MERCH-091"
                    value={formData.merchant_id}
                    onChange={handleChange}
                    icon={Layers}
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Behavioral Heuristic Flags */}
            <Card
              ribbon="SECURITY HEURISTICS // HARD SIGNALS"
              title="Behavioral & Device Anomaly Switches"
              subtitle="Explicit indicators tested by the policy guardrail and model"
              className="md:col-span-2"
              variant="highlight"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                {[
                  {
                    id: 'new_device',
                    label: 'New Device Recognized',
                    desc: 'Hardware fingerprint not in historical whitelist',
                    icon: Shield,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'new_recipient',
                    label: 'Unrecognized Recipient',
                    desc: 'Beneficiary account never transferred to previously',
                    icon: User,
                    color: 'text-rose-400',
                  },
                  {
                    id: 'location_change',
                    label: 'Geographic Shift Anomaly',
                    desc: 'Sudden IP/GPS delta inconsistent with user velocity',
                    icon: MapPin,
                    color: 'text-purple-400',
                  },
                ].map((flag) => {
                  const Icon = flag.icon;
                  const isChecked = formData[flag.id];
                  return (
                    <label
                      key={flag.id}
                      className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-purple-900/30 border-brand-500 shadow-glow-purple'
                          : 'bg-[#121424] border-purple-950 hover:border-purple-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-semibold text-white text-sm">
                          <Icon className={`w-4 h-4 ${flag.color}`} />
                          {flag.label}
                        </div>
                        <input
                          type="checkbox"
                          name={flag.id}
                          checked={isChecked}
                          onChange={handleChange}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {flag.desc}
                      </p>
                    </label>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Action Submission */}
          <div className="mt-8 flex flex-col items-center">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-xl py-4 shadow-xl text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size="sm" className="text-white" />
                  Running Neural Risk & Security Assessment...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-purple-200" />
                  Execute Sentinel AI Risk Assessment
                </>
              )}
            </Button>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real-Time Model Inference & RAG Policy Validation &bull; Response &lt; 50ms
            </p>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default TransactionPage;

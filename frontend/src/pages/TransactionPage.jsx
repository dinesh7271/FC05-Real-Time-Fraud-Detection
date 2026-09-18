import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { Send, Shield, Activity, User, MapPin, CreditCard } from 'lucide-react';
import { fraudService } from '../services/api';

const TransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    transaction_hour: '12',
    new_device: false,
    new_recipient: false,
    location_change: false,
    velocity: '',
    account_age_days: '',
    avg_transaction_amount: '',
    location: '',
    merchant_id: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await fraudService.checkTransaction(formData);
      navigate('/result', { state: { prediction: result } });
    } catch (error) {
      alert('Error communicating with fraud detection engine. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Transaction Risk Assessment"
      subtitle="Enter comprehensive transaction telemetry to evaluate fraud probability."
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Section 1: User Identity */}
            <Card title="User Identity" subtitle="Basic account and identity information">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="User ID"
                  name="user_id"
                  placeholder="e.g. user_8821"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Account Age (Days)"
                  type="number"
                  name="account_age_days"
                  placeholder="e.g. 365"
                  value={formData.account_age_days}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Avg. Transaction Amount"
                  type="number"
                  name="avg_transaction_amount"
                  placeholder="e.g. 50.00"
                  value={formData.avg_transaction_amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </Card>

            {/* Section 2: Transaction Details */}
            <Card title="Transaction Details" subtitle="Real-time event data">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Amount (USD)"
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Hour (0-23)"
                    type="number"
                    name="transaction_hour"
                    value={formData.transaction_hour}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Velocity"
                    type="number"
                    name="velocity"
                    placeholder="e.g. 1.5"
                    value={formData.velocity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  label="Location"
                  name="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Merchant ID (Optional)"
                  name="merchant_id"
                  placeholder="e.g. merch_991"
                  value={formData.merchant_id}
                  onChange={handleChange}
                />
              </div>
            </Card>

            {/* Section 3: Security Flags */}
            <Card title="Security Flags" subtitle="Behavioral anomalies detected" className="md:col-span-2">
              <div className="flex flex-wrap gap-8 py-2">
                {[
                  { id: 'new_device', label: 'New Device Used', icon: <Shield className="w-4 h-4" /> },
                  { id: 'new_recipient', label: 'New Recipient', icon: <User className="w-4 h-4" /> },
                  { id: 'location_change', label: 'Location Change', icon: <MapPin className="w-4 h-4" /> },
                ].map((flag) => (
                  <label key={flag.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name={flag.id}
                        checked={formData[flag.id]}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-indigo-600 transition-all duration-200 relative">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 peer-checked:translate-x-5" />
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-2 text-sm">
                      {flag.icon}
                      {flag.label}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              className="w-full max-w-md py-4 text-lg shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size="sm" className="text-white" />
                  Processing via AI Engine...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Execute Risk Analysis
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default TransactionPage;

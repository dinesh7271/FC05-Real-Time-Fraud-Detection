import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import TransactionPage from './pages/TransactionPage';
import RiskResultPage from './pages/RiskResultPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<TransactionPage />} />
            <Route path="/result" element={<RiskResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<TransactionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

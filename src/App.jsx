import React, { useEffect, useState } from 'react';
import axios from 'axios';

/** * UI Components architected as per Philip Jennings' Single-Screen specification.
 * Optimized for Pi Browser mobile viewport.
 */
import Navbar from './components/Navbar';
import PriceGraph from './components/PriceGraph';
import StatsPanel from './components/StatsPanel';
import ActionButtons from './components/ActionButtons';

import './App.css';

/**
 * MapCapIPO Main Application Engine v1.0
 * * Visionary: Philip Jennings & Daniel (Map-of-Pi)
 * Architect: Eslam Kora
 * * This engine synchronizes the 4-week IPO phase logic, managing real-time
 * spot-price growth, pioneer allocations, and blockchain transactions.
 */
function App() {
  /**
   * Centralized Application State.
   * Based on the 4 key metrics required for transparency during the IPO phase.
   */
  const [metrics, setMetrics] = useState({
    totalInvestors: 0, // Value 1: Unique Pioneer count
    totalPi: 0,        // Value 2: Total Pi in MapCapIPO escrow wallet
    userPi: 0,         // Value 3: Specific Pioneer's contribution
    dailyPrices: []    // Dataset for the Spot-price growth graph (28-day cycle)
  });

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    /**
     * Pi SDK Lifecycle Management:
     * Automatic initialization upon app entry within the Pi Browser.
     * Environment: Sandbox enabled for secure dev-testing.
     */
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      authenticatePioneer();
    }

    /** Initial data sync with Node.js/MongoDB backend */
    fetchLiveIPOData();
  }, []);

  /**
   * Authenticates the Pioneer using Pi Network's Native Auth Flow.
   * Scopes: username (Identification), payments (U2A), wallet_address (A2UaaS).
   */
  const authenticatePioneer = async () => {
    try {
      const scopes = ['username', 'payments', 'wallet_address'];
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        // Audit callback for incomplete payments to ensure ledger integrity.
        console.warn("Audit: Incomplete Payment Detected:", payment);
      });
      setCurrentUser(auth.user);
      console.log(`Pioneer session established: @${auth.user.username}`);
    } catch (err) {
      console.error("Authentication rejected by user or network.");
    }
  };

  /**
   * Fetches real-time IPO statistics from the MERN backend.
   * Includes the dynamically calculated daily spot-price array for the SVG Graph.
   */
  const fetchLiveIPOData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/mapcap-stats');
      setMetrics(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Engine Sync Error: Backend unreachable.");
      setLoading(false);
    }
  };

  /**
   * Financial Action: Invest (User-to-App Transfer)
   * Triggers the Pi SDK payment flow. Minimal investment threshold: 1 Pi.
   * @param {number} amount - The amount of Pi the pioneer wishes to commit.
   */
  const handleInvest = async (amount) => {
    if (amount < 1) return alert("Minimum participation requires 1 Pi.");
    
    try {
      await window.Pi.createPayment({
        amount: amount,
        memo: "MapCap IPO Phase Entry",
        metadata: { type: "IPO_INVESTMENT", timestamp: Date.now() }
      }, {
        onReadyForServerApproval: (paymentId) => {
          // Phase 1: Notifying backend to lock transaction in audit logs
          axios.post('http://localhost:3000/api/approve-payment', { paymentId });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          // Phase 2: Finalizing ledger update after blockchain confirmation
          axios.post('http://localhost:3000/api/complete-payment', { paymentId, txid });
          fetchLiveIPOData(); // Refresh UI to reflect new totalPi and userPi
        },
        onCancel: (paymentId) => console.log("Transaction cancelled by Pioneer."),
        onError: (error) => console.error("Payment Engine Failure:", error)
      });
    } catch (err) {
      console.error("SDK Payment Request failed.");
    }
  };

  /**
   * Financial Action: Withdraw (App-to-User-as-a-Service)
   * Utilizes EscrowPi A2UaaS protocol for secure percentage-based withdrawals.
   * @param {number} percentage - Percentage of the user's current balance to withdraw.
   */
  const handleWithdraw = async (percentage) => {
    try {
      // Logic aligns with 'Whale Prevention' and 'Liquidity Management' as per Page 5.
      await axios.post('http://localhost:3000/api/withdraw', { 
        percentage,
        username: currentUser?.username 
      });
      alert(`Withdrawal sequence for ${percentage}% initiated. Processing A2UaaS transfer...`);
      fetchLiveIPOData();
    } catch (err) {
      alert("Withdrawal unsuccessful. Ensure sufficient balance exists.");
    }
  };

  return (
    <div className="mapcap-root">
      {/* Section 1: Top 33.33% - Branding & Spot-price Visualization.
          Strict adherence to Page 3 & Page 8 screen layouts.
      */}
      <section className="section-top">
        <Navbar />
        <PriceGraph dailyPrices={metrics.dailyPrices} />
      </section>

      {/* Section 2: Middle 33.33% - Transparent Tokenomics Stats.
          Calculates the 20% capital gain anticipated for LP launch.
      */}
      <section className="section-middle">
        <StatsPanel metrics={metrics} />
      </section>

      {/* Section 3: Bottom 33.33% - Participation & Liquidity Controls.
          Provides UI for Invest (U2A) and Withdraw (A2UaaS) functions.
      */}
      <section className="section-bottom">
        <ActionButtons 
          onInvest={handleInvest} 
          onWithdraw={handleWithdraw} 
        />
      </section>
    </div>
  );
}

export default App;

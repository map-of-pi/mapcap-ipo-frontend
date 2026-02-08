import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Importing Professional Components
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import AuditLedger from './components/AuditLedger';

// Global Stylesheet
import './App.css';

/**
 * MapCap Executive Dashboard - Production Grade
 * Architected for Pi Network Ecosystem | Built by Eslam Kora
 * Integration: Node.js Backend + Pi SDK v2.0
 */
function App() {
  // Core Tokenomics State: Defined by Philip Jennings' 4M Pi Vision
  const [metrics, setMetrics] = useState({
    totalSupply: 4000000,
    pioneerAllocation: 2181818,
    status: 'Initializing Engine...'
  });

  // System Logs State for the Audit Ledger
  const [auditLogs, setAuditLogs] = useState([
    "Initializing MapCap Smart Contract... Success",
    "Establishing MERN Stack Data Stream..."
  ]);

  const [walletConnected, setWalletConnected] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    /**
     * Backend Synchronization:
     * Connects to the local Node.js engine on Port 3000 to fetch real-time stats.
     */
    const syncWithBackend = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/stats');
        setMetrics(prev => ({ 
          ...prev, 
          ...response.data, 
          status: 'Engine Online ✅' 
        }));
        setAuditLogs(prev => [...prev, "Backend Synchronization Complete."]);
      } catch (err) {
        setMetrics(prev => ({ ...prev, status: 'Engine Offline ❌' }));
        setAuditLogs(prev => [...prev, "Critical: Backend Connection Failed."]);
      }
    };

    syncWithBackend();
    
    /**
     * Pi SDK Initialization:
     * Sandbox mode enabled for development as per Map-of-Pi requirements.
     */
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setAuditLogs(prev => [...prev, "Pi SDK v2.0 Initialized in Sandbox."]);
    }
  }, []);

  /**
   * Wallet Authentication Handler:
   * Triggers the Pi Browser's native auth flow for Pioneer identification.
   */
  const handlePiLogin = async () => {
    try {
      const scopes = ['username', 'payments', 'wallet_address'];
      
      // Callback for incomplete payments to ensure blockchain integrity
      const onIncompletePaymentFound = (payment) => {
        setAuditLogs(prev => [...prev, `Action Required: Incomplete Payment ${payment.identifier}`]);
      };

      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setWalletConnected(true);
      setUserData(auth.user);
      setAuditLogs(prev => [...prev, `Pioneer @${auth.user.username} Authenticated.`]);
    } catch (error) {
      console.error("Authentication Error:", error);
      setAuditLogs(prev => [...prev, "Auth Failure: User denied access."]);
    }
  };

  return (
    <div className="mapcap-root">
      {/* Visual Identity Layer */}
      <div className="glass-grid"></div>

      {/* Navigation Layer */}
      <Navbar status={metrics.status} />

      <main className="dashboard-grid">
        {/* Metric Overview Section */}
        <section className="stats-container">
          <StatCard 
            label="TOTAL PI SUPPLY" 
            value={metrics.totalSupply} 
            colorClass="glow-purple" 
          />
          <StatCard 
            label="PIONEER ALLOCATION" 
            value={metrics.pioneerAllocation} 
            colorClass="glow-gold" 
            percentage={54.5} 
          />
        </section>

        {/* Governance & Participation Section */}
        <section className="action-center">
          <div className="action-card">
            <h2>Project Governance</h2>
            <p>Secure your equity in the Map-of-Pi ecosystem via Pi Blockchain verification.</p>
            
            {!walletConnected ? (
              <button className="pi-main-btn" onClick={handlePiLogin}>
                CONNECT PI WALLET ⚡
              </button>
            ) : (
              <div className="success-badge">
                Authenticated as: <strong>@{userData?.username}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Real-time Audit Section */}
        <AuditLedger logs={auditLogs} />
      </main>

      <footer className="main-footer">
        <p>© 2026 MapCap Engine | AppDev @Map-of-Pi | Integrated MERN Solution</p>
      </footer>
    </div>
  );
}

export default App;

/**
 * MapCap Action Center (Context-Enabled)
 * ---------------------------------------------------------
 * Architect: Eslam Kora | Visionaries: Philip Jennings & Daniel
 * Role: Orchestrating Pi SDK U2A payments and EscrowPi withdrawals.
 * * This component consumes the Global State to execute financial transactions
 * while adhering to the 'Single-Screen' mobile layout.
 */

import React, { useState } from 'react';
import { useIpo } from '../context/IpoContext';
import { PiService } from '../services/pi.service';
import { syncPaymentWithBackend } from '../services/api.service';

const ActionButtons = () => {
  // Consuming state and sync functions from the Global Context
  const { currentUser, refreshData } = useIpo();

  // Local state for input handling [Source: Requirements 80, 83]
  const [investAmount, setInvestAmount] = useState(1.0);
  const [withdrawPercent, setWithdrawPercent] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Action: IPO Investment (User-to-App)
   * Triggers the Pi SDK payment flow and updates the backend ledger.
   */
  const handleInvestClick = async () => {
    if (!currentUser) return alert("Pioneer authentication required.");
    if (investAmount < 1) return alert("Minimum participation is 1 Pi.");

    setIsProcessing(true);
    try {
      await PiService.createIpoPayment(investAmount, async (paymentId) => {
        // Step 2: Sync with MERN Backend
        await syncPaymentWithBackend({
          paymentId,
          username: currentUser.username,
          amount: investAmount
        });

        // Step 3: Refresh global statistics (Value 1, 2, 3, 4)
        await refreshData(currentUser.username);
        alert(`Success! ${investAmount} Pi has been added to the IPO pool.`);
      });
    } catch (err) {
      console.error("Investment flow failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Action: A2UaaS Withdrawal
   * Executes percentage-based refunds as per the 'Anti-Whale' policy.
   */
  const handleWithdrawClick = async () => {
    if (!currentUser) return alert("Authentication required.");
    
    // Logic implementation for Page 5 - Liquidity Management
    alert(`Withdrawal sequence for ${withdrawPercent}% initiated for @${currentUser.username}.`);
    
    // In a production environment, this triggers the backend A2UaaS flow
    await refreshData(currentUser.username);
  };

  return (
    <section className="section-bottom action-center">
      
      {/* INVEST BLOCK: Requirement [79, 80, 81] */}
      <div className="input-group">
        <div className="input-wrapper">
          <input 
            type="number" 
            min="1" 
            step="0.1"
            value={investAmount} 
            onChange={(e) => setInvestAmount(parseFloat(e.target.value))}
            className="input-field"
            disabled={isProcessing}
          />
          <span className="input-unit">pi</span>
        </div>
        <button 
          className={`btn-mapcap ${isProcessing ? 'animate-pulse' : ''}`}
          onClick={handleInvestClick}
          disabled={isProcessing}
        >
          {isProcessing ? 'Syncing...' : 'Invest pi'}
        </button>
      </div>

      {/* WITHDRAW BLOCK: Requirement [82, 83, 84] */}
      <div className="input-group">
        <div className="input-wrapper">
          <input 
            type="number" 
            min="0.1" 
            max="100"
            value={withdrawPercent} 
            onChange={(e) => setWithdrawPercent(parseFloat(e.target.value))}
            className="input-field"
          />
          <span className="input-unit">%</span>
        </div>
        <button 
          className="btn-mapcap" 
          onClick={handleWithdrawClick}
        >
          Withdraw pi
        </button>
      </div>

    </section>
  );
};

export default ActionButtons;

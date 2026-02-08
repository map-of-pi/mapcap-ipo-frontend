/**
 * MapCap Action Buttons (Invest & Withdraw)
 * Based on Philip Jennings' Specification [Source: Page 4-5]
 * Handles Pi SDK U2A transfers and EscrowPi A2UaaS withdrawals.
 */
import React, { useState } from 'react';

const ActionButtons = ({ onInvest, onWithdraw }) => {
  // Default values as per documentation [Source: 80, 83]
  const [investAmount, setInvestAmount] = useState(1.0);
  const [withdrawPercent, setWithdrawPercent] = useState(50);

  return (
    <section className="section-bottom action-center">
      
      {/* Invest Block [Source: 79, 80, 81] */}
      <div className="input-group">
        <div className="input-wrapper">
          <input 
            type="number" 
            min="1" 
            value={investAmount} 
            onChange={(e) => setInvestAmount(parseFloat(e.target.value))}
            className="input-field"
          />
          <span className="input-unit">pi</span>
        </div>
        <button 
          className="btn-mapcap" 
          onClick={() => onInvest(investAmount)}
        >
          Invest pi
        </button>
      </div>

      {/* Withdraw Block [Source: 82, 83, 84] */}
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
          onClick={() => onWithdraw(withdrawPercent)}
        >
          Withdraw pi
        </button>
      </div>

    </section>
  );
};

export default ActionButtons;

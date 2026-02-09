/**
 * MapCap IPO Statistics Panel (Enhanced with Context API)
 * ---------------------------------------------------------
 * Architect: Eslam Kora | Based on Philip Jennings' Specification
 * Role: Real-time UI synchronization for Pioneer Metrics.
 */
import React from 'react';
import { useIpo } from '../context/IpoContext';

const StatsPanel = () => {
  // Direct consumption of Global State [Source: Requirements 73-75]
  const { metrics, loading } = useIpo();

  /**
   * Value 4: Capital Gain Logic
   * Official Spec: IPO Pioneers enter at a 20% discount vs future LP price.
   * This calculation visualizes the immediate equity uplift.
   */
  const capitalGain = (metrics.userPi || 0) * 1.20;

  // Professional loading state to ensure UI stability during SDK handshake
  if (loading) {
    return (
      <section className="stats-panel flex-center">
        <div className="animate-pulse" style={{ color: 'var(--mapcap-green)', fontWeight: '600' }}>
          Auditing MapCap Ledger...
        </div>
      </section>
    );
  }

  return (
    <section className="stats-panel">
      {/* Visual Hierarchy: Section Heading per Page 8 of UX Doc */}
      <h3 className="section-title">MapCap IPO Statistics:</h3>
      
      <div className="stats-list">
        {/* Value 1: Verified Pioneer Count */}
        <div className="stat-item">
          <span className="stat-label">• Total investors to date:</span>
          <span className="stat-value">{(metrics.totalInvestors || 0).toLocaleString()}</span>
        </div>

        {/* Value 2: Total Escrowed Liquidity */}
        <div className="stat-item">
          <span className="stat-label">• Total pi invested:</span>
          <span className="stat-value">{(metrics.totalPi || 0).toLocaleString()} π</span>
        </div>

        {/* Value 3: Personalized Pioneer Contribution */}
        <div className="stat-item">
          <span className="stat-label">• Your pi invested:</span>
          <span className="stat-value">{(metrics.userPi || 0).toLocaleString()} π</span>
        </div>

        {/* Value 4: The 'Alpha' Projection (The 20% Profit Visualizer) */}
        <div className="stat-item highlight-gain">
          <span className="stat-label">• Your capital gain (+20%):</span>
          <span className="stat-value">{capitalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} π</span>
        </div>
      </div>

      {/* Daniel's Audit Requirement: Anti-Whale Visibility [Source: Page 5] */}
      {metrics.userPi > (metrics.totalPi * 0.1) && metrics.totalPi > 0 && (
        <div className="whale-warning animate-pulse">
          ⚠️ Compliance: Investment exceeds 10% pool limit (Review Pending).
        </div>
      )}
    </section>
  );
};

export default StatsPanel;

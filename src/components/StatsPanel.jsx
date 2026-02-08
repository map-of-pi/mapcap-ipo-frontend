/**
 * MapCap IPO Statistics Panel
 * Based on Philip Jennings' Specification [Source: Page 4, 8]
 * Displays the 4 mandatory values for transparency and capital gain projection.
 */
import React from 'react';

const StatsPanel = ({ metrics }) => {
  /**
   * Value 4: User's capital gain calculation.
   * Specification: IPO pioneers pay 20% below LP value, resulting in a 20% 
   * capital increase visualization [Source: Doc Page 1].
   */
  const capitalGain = metrics.userPi * 1.20;

  // Render a placeholder if data is still synchronizing with the Node.js engine
  if (!metrics || metrics.totalPi === undefined) {
    return (
      <section className="stats-panel">
        <h3 className="section-title">MapCap IPO Statistics:</h3>
        <div className="stat-item calculating-text">Syncing with Pi Ledger...</div>
      </section>
    );
  }

  return (
    <section className="stats-panel">
      {/* Official Section Title as per Page 8 layout */}
      <h3 className="section-title">MapCap IPO Statistics:</h3>
      
      <div className="stats-list">
        {/* Value 1: Unique Pioneer count [Source: Requirement 73] */}
        <div className="stat-item">
          • Total investors to date: <strong>{metrics.totalInvestors.toLocaleString()}</strong>
        </div>

        {/* Value 2: Total Pi accumulated in the MapCapIPO escrow [Source: Requirement 74] */}
        <div className="stat-item">
          • Total pi invested to date: <strong>{metrics.totalPi.toLocaleString()} π</strong>
        </div>

        {/* Value 3: Specific contribution of the logged-in Pioneer [Source: Requirement 75] */}
        <div className="stat-item">
          • Your pi invested to date: <strong>{metrics.userPi.toLocaleString()} π</strong>
        </div>

        {/* Value 4: The 20% "Early Adopter" capital gain projection [Source: Requirement 10] */}
        <div className="stat-item highlight-gain">
          • Your capital gain to date: <strong>{capitalGain.toLocaleString()} π</strong>
        </div>
      </div>

      {/* Footer hint as implied by the Anti-Whale logic [Source: Page 5] */}
      {metrics.userPi > (metrics.totalPi * 0.1) && (
        <div className="whale-warning">
          * Note: Investments exceeding 10% total are subject to refund.
        </div>
      )}
    </section>
  );
};

export default StatsPanel;

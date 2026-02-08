/**
 * MapCap Spot-price Graph Component
 * Based on Philip Jennings' Specification [Source: Page 3-4]
 * Displays daily calculated spot-price throughout the 4-week IPO phase.
 */
import React from 'react';

const PriceGraph = ({ dailyPrices = [] }) => {
  // Constants based on documentation [Source: 28, 63]
  const TOTAL_DAYS = 28; // 4 calendar weeks
  
  // Logic: If it's Day 1 and no prices yet, show "Calculating..." [Source: 68]
  if (dailyPrices.length === 0) {
    return (
      <div className="graph-container">
        <div className="calculating-text">Calculating...</div>
      </div>
    );
  }

  return (
    <div className="graph-container">
      {/* Container for the SVG Graph [Source: 60, 62] */}
      <svg viewBox="0 0 400 200" className="mapcap-svg-graph">
        {/* X-axis: Weeks 1 to 4 [Source: 63] */}
        <line x1="40" y1="160" x2="360" y2="160" className="graph-element-green" />
        <text x="40" y="180" className="graph-label">Week 1</text>
        <text x="360" y="180" className="graph-label">Week 4</text>

        {/* Y-axis: Spot-price from 0 up to 20% above peak [Source: 70] */}
        <line x1="40" y1="20" x2="40" y2="160" className="graph-element-green" />
        <text x="10" y="160" className="graph-label">0 pi</text>

        {/* The dynamic price line that grows as phase progresses [Source: 64] */}
        <polyline
          fill="none"
          stroke="#1b5e20" /* MapCap Green */
          strokeWidth="2"
          points={dailyPrices.map((price, index) => {
            const x = 40 + (index * (320 / TOTAL_DAYS));
            const y = 160 - (price * 2); // Simplified scaling logic
            return `${x},${y}`;
          }).join(' ')}
        />
        
        {/* Points at the end of each day [Source: 65, 66] */}
        {dailyPrices.map((price, index) => {
          const x = 40 + (index * (320 / TOTAL_DAYS));
          const y = 160 - (price * 2);
          return <circle key={index} cx={x} cy={y} r="3" fill="#1b5e20" />;
        })}
      </svg>
      
      <div className="graph-title text-center">MapCap Spot-price</div>
    </div>
  );
};

export default PriceGraph;


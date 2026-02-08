/**
 * AuditLedger Component
 * Terminal-style display for real-time backend synchronization logs.
 */
import React from 'react';

const AuditLedger = ({ logs }) => {
  return (
    <div className="audit-section">
      <h3 className="section-title">Backend Audit Ledger</h3>
      <div className="log-container">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="log-timestamp">[{new Date().toLocaleTimeString()}]</span>
            <span className="log-message"> > {log}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="log-entry">Waiting for engine data...</div>}
      </div>
    </div>
  );
};

export default AuditLedger;


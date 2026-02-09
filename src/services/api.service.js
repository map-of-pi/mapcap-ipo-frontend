/**
 * MapCap API Gateway Service v1.2
 * ---------------------------------------------------------
 * Lead Architect: Eslam Kora | AppDev @Map-of-Pi
 * Project: MapCap Ecosystem Bridge (React -> Node.js)
 * * * Purpose: 
 * This service handles all HTTP communications with the MERN backend.
 * It ensures the integrity of the 4 Mandatory IPO Metrics and handles
 * payment synchronization as per Daniel's Audit requirements.
 */

import axios from 'axios';

/**
 * BASE CONFIGURATION
 * VITE_API_URL should be set in your .env file for production (e.g., https://api.mapcap.com)
 * Localhost is used as a fallback for the development sandbox.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create a configured axios instance for consistency
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout for mobile connectivity issues
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * FETCH IPO METRICS
 * Fetches Value 1, 2, 3, and 4 from the backend ledger.
 * [Source: Philip's Spec Page 4 - Real-time Transparency]
 * * @param {string} username - The Pi Network username of the authenticated Pioneer.
 */
export const getIpoMetrics = async (username) => {
  try {
    const response = await apiClient.get('/mapcap-stats', { 
      params: { username } 
    });
    
    // Return the data object containing totalInvestors, totalPi, userPi, and dailyPrices
    return response.data;
  } catch (error) {
    console.error("Critical Failure: Unable to fetch IPO metrics.", error.message);
    
    // Fallback data structure to prevent UI crashing during network downtime
    return {
      totalInvestors: 0,
      totalPiInvested: 0,
      userPiInvested: 0,
      userCapitalGain: 0,
      dailyPrices: [],
      spotPrice: 0
    };
  }
};

/**
 * SYNC PAYMENT WITH BACKEND
 * Triggered after successful Pi SDK U2A payment. 
 * Logs the transaction in the Node.js ledger for official auditing.
 * * @param {object} paymentData - { paymentId, username, amount }
 */
export const syncPaymentWithBackend = async (paymentData) => {
  try {
    const response = await apiClient.post('/approve-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error("Critical Failure: Payment Ledger Sync failed.", error.message);
    
    /**
     * Daniel's Compliance Rule: If backend sync fails after payment, 
     * we must log this locally or alert the user to keep their payment ID.
     */
    throw new Error("Payment verified on-chain but failed to sync with MapCap Ledger. Please contact support.");
  }
};

/**
 * WITHDRAWAL SERVICE (A2UaaS)
 * Initiates the refund/withdrawal process based on the percentage requested.
 * [Source: Requirement 82-84]
 */
export const requestWithdrawal = async (username, percentage) => {
  try {
    const response = await apiClient.post('/request-withdraw', { username, percentage });
    return response.data;
  } catch (error) {
    console.error("Withdrawal Error:", error.message);
    throw error;
  }
};

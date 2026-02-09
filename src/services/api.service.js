/**
 * MapCap API Gateway Service
 * ---------------------------------------------------------
 * Bridges the React Frontend with the Node.js/MERN Backend.
 * Strictly follows the IPO reporting requirements from Philip's Spec.
 */
import axios from 'axios';

// Dynamically sets the API URL based on the environment (Dev/Prod)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetches the 4 mandatory IPO metrics from the Node.js backend.
 * Required for the StatsPanel to display Pioneer-specific data.
 * [Source: Philip's Spec Page 4]
 * * @param {string} username - The Pi Network username of the pioneer.
 */
export const getIpoMetrics = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/mapcap-stats`, { 
      params: { username } 
    });
    return response.data;
  } catch (error) {
    console.error("Critical: Failed to fetch IPO metrics from engine.", error);
    throw error;
  }
};

/**
 * Syncs the payment confirmation with the backend.
 * Updates Value 2 (Total Pi) and Value 3 (User Pi) in real-time.
 * * @param {object} paymentData - Contains paymentId and transaction details.
 */
export const syncPaymentWithBackend = async (paymentData) => {
  try {
    return await axios.post(`${API_URL}/approve-payment`, paymentData);
  } catch (error) {
    console.error("Critical: Payment sync failed. Ledger might be out of sync.", error);
    throw error;
  }
};

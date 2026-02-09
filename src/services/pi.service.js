/**
 * MapCap Pi Network Web3 Service
 * ---------------------------------------------------------
 * Manages the integration with the Pi Browser SDK.
 * Implements Authentication and U2A (User-to-App) Payment flows 
 * as required by Philip Jennings' Specification.
 */

export const PiService = {
  /**
   * Authenticates the Pioneer and requests necessary permissions.
   * Required for Value 3 & 4 (User-specific stats) [Source: Page 4].
   */
  authenticate: async () => {
    try {
      const scopes = ['username', 'payments', 'wallet_address'];
      
      // The callback is used for incomplete payments logic (Requirement 82)
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.warn("Audit: Incomplete payment detected on login:", payment);
      });
      
      return auth.user;
    } catch (err) {
      console.error("Pi Authentication failed:", err);
      throw err;
    }
  },

  /**
   * Triggers the Pi Payment Flow for IPO Participation.
   * Implements the 'Water-Level' investment logic [Source: Page 3].
   * * @param {number} amount - Amount of Pi to invest.
   * @param {function} onApproved - Callback to sync with MERN backend.
   */
  createIpoPayment: async (amount, onApproved) => {
    try {
      const payment = await window.Pi.createPayment({
        amount: amount,
        memo: `Investment in MapCap IPO Phase - ${amount} Pi`,
        metadata: { 
          type: "IPO_INVESTMENT",
          project: "MapCap"
        },
      }, {
        onReadyForServerApproval: (paymentId) => {
          // This bridges to your api.service.js -> syncPaymentWithBackend
          onApproved(paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log("Transaction Completed on Blockchain:", txid);
        },
        onCancel: (paymentId) => console.log("User cancelled payment:", paymentId),
        onError: (error, payment) => console.error("Pi SDK Payment Error:", error)
      });
      
      return payment;
    } catch (err) {
      console.error("Payment flow initialization failed:", err);
      throw err;
    }
  }
};

export default PiService;

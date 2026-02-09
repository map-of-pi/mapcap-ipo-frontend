/**
 * Pioneer Auth Service
 * Manages the authentication flow and persistent user session.
 */

export const authenticatePioneer = async () => {
  try {
    const scopes = ['username', 'payments', 'wallet_address'];
    const auth = await window.Pi.authenticate(scopes, (payment) => {
      console.log("Incomplete payment found:", payment);
    });
    // Store user in LocalStorage or State for persistent access across the single-screen
    localStorage.setItem('pioneer', JSON.stringify(auth.user));
    return auth.user;
  } catch (err) {
    console.error("Auth failed:", err);
    throw err;
  }
};


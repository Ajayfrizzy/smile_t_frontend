// Flutterwave payment integration utilities

let flutterwaveLoaded = false;

/**
 * Load Flutterwave payment script dynamically
 */
export const loadFlutterwave = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (flutterwaveLoaded && window.FlutterwaveCheckout) {
      resolve();
      return;
    }

    // Check if script is already in the page
    if (document.querySelector('script[src*="flutterwave"]')) {
      // Wait for it to load
      const checkLoaded = () => {
        if (window.FlutterwaveCheckout) {
          flutterwaveLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    
    script.onload = () => {
      flutterwaveLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Flutterwave payment script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Open Flutterwave checkout modal
 */
export const openFlutterwaveCheckout = (config) => {
  if (!window.FlutterwaveCheckout) {
    throw new Error('Flutterwave checkout not loaded. Call loadFlutterwave() first.');
  }

  // Validate required config
  const requiredFields = ['public_key', 'tx_ref', 'amount', 'currency', 'customer'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate customer object
  if (!config.customer.email || !config.customer.name) {
    throw new Error('Customer email and name are required');
  }

  // Get the app URL from environment variable or fallback to current origin
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  
  // Ensure HTTPS for production (Flutterwave requires HTTPS URLs)
  const secureAppUrl = appUrl.replace(/^http:/, 'https:');
  
  // Default configuration
  const defaultConfig = {
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    redirect_url: `${secureAppUrl}/booking-success`,
    meta: {
      source: 'hotel-booking',
      merchant_name: 'Smile Motel'
    },
    customizations: {
      title: 'Smile-T Hotel Booking',
      description: 'Hotel Room Booking Payment',
      // Use a publicly accessible HTTPS logo URL or remove it if not available
      // Localhost URLs won't work in Flutterwave's HTTPS context
      logo: appUrl.includes('localhost') ? '' : `${secureAppUrl}/assets/images/logo.svg`
    }
  };

  // Merge configurations
  const finalConfig = {
    ...defaultConfig,
    ...config,
    customer: {
      ...defaultConfig.customer,
      ...config.customer
    },
    customizations: {
      ...defaultConfig.customizations,
      ...config.customizations
    },
    meta: {
      ...defaultConfig.meta,
      ...config.meta
    }
  };

  // Open the modal
  window.FlutterwaveCheckout(finalConfig);
};

/**
 * Verify payment with backend
 */
export const verifyFlutterwavePayment = async (txRef, transactionId) => {
  try {
    const response = await fetch('/api/flutterwave-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        transaction_id: transactionId
      })
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

export default {
  loadFlutterwave,
  openFlutterwaveCheckout,
  verifyFlutterwavePayment
};
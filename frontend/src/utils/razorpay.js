/**
 * Dynamically loads the Razorpay checkout script
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay SDK');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

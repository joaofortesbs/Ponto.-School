
// This script will be preloaded to provide email functionality
// You would need to replace this with a proper EmailJS account setup for production
(function() {
  // Load EmailJS script dynamically
  function loadEmailJS() {
    const script = document.createElement('script');
    script.src = 'https://smtpjs.com/v3/smtp.js';
    script.async = true;
    script.onload = function() {
      console.log('Email service loaded successfully');
    };
    script.onerror = function() {
      console.error('Failed to load email service');
    };
    document.head.appendChild(script);
  }

  // Only load in browser environment
  if (typeof window !== 'undefined') {
    // Load email service after page is loaded
    if (document.readyState === 'complete') {
      loadEmailJS();
    } else {
      window.addEventListener('load', loadEmailJS);
    }
  }
})();


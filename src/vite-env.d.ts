
// Add EmailJS type definition for email sharing functionality
interface EmailJS {
  send(config: {
    SecureToken: string;
    To: string;
    From: string;
    Subject: string;
    Body: string;
  }): Promise<string>;
}

interface Window {
  Email?: EmailJS;
}

/// <reference types="vite/client" />

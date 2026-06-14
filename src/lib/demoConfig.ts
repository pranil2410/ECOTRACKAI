// Secure configuration for Hackathon Demo credentials
// Reads values from environment variables or uses standard safe fallbacks.

export const DEMO_CREDENTIALS = {
  user: {
    email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || 'green.leader@ecotrack.ai',
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || 'password'
  },
  admin: {
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@ecotrack.ai',
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'password'
  }
};

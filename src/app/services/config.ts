export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    USERS: '/users',
    RESET_PASSWORD: '/users/reset-password',
    SHEETS: '/sheets',
    SECTIONS: '/sections',
    FIELDS: '/fields',
  },
};
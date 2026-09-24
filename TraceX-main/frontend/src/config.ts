/**
 * Central API configuration.
 * In development the Vite env var is empty so we fall back to localhost.
 * In production (Vercel / Netlify) set VITE_API_URL to the deployed backend URL.
 */
export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://127.0.0.1:8000';

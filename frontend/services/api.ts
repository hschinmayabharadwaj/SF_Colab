// Centralized API client for your backend

// Dev: use proxy "/api" (rewritten to backend root by Vite)
// Prod: use full backend URL from VITE_API_URL (root, no prefix)
const API_BASE = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || '');

function joinUrl(base: string, path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(joinUrl(API_BASE, path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Health check
export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}

// User management
export async function createUser(payload: { username: string; email: string }) {
  return request<{ id: number; username: string; email: string; wallet_created: boolean }>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUser(userId: number) {
  return request<{ id: number; username: string; email: string; created_at: string }>(`/users/${userId}`);
}

// Wallet operations
export interface WalletBalance {
  sf_coins: number;
  premium_gems: number;
  event_tokens: number;
  total_coins_earned: number;
  total_coins_spent: number;
  daily_earnings: number;
  daily_earning_limit: number;
}

export interface WalletTransaction {
  id: number;
  transaction_type: string;
  currency_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export async function getWalletBalance(userId: number): Promise<WalletBalance> {
  return request<WalletBalance>(`/wallet/balance/${userId}`);
}

export async function getWalletHistory(userId: number): Promise<{ transactions: WalletTransaction[] }> {
  return request<{ transactions: WalletTransaction[] }>(`/wallet/history/${userId}`);
}

export async function earnCoins(payload: { user_id: number; amount: number; description?: string }) {
  return request<{ message: string; sf_coins: number; daily_earnings: number; transaction_id: number }>('/wallet/earn', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function spendCoins(payload: { user_id: number; amount: number; description?: string }) {
  return request<{ message: string; sf_coins: number; transaction_id: number }>('/wallet/spend', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

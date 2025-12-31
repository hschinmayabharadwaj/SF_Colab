// API Service for SF Ecosystem Frontend
// Connects to Flask backend on port 5001

const API_BASE_URL = 'http://127.0.0.1:5001';


// Health check
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

// Get wallet balance
/*export async function getWalletBalance(userId: string) {
  const response = await fetch(`${API_BASE_URL}/wallet/balance/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch wallet balance');
  return response.json();
}*/

export async function getWalletBalance(userId: string) {
  const res = await fetch(`${API_BASE_URL}/wallet/balance/${userId}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json(); // parse here, don't log res.json() directly elsewhere
  console.log("Wallet data:", data);
  return data;
};


// Get wallet transaction history
export async function getWalletHistory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/wallet/history/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch wallet history');
  return response.json();
}

// Earn coins
export async function earnCoins(userId: string, amount: number, description?: string) {
  const response = await fetch(`${API_BASE_URL}/wallet/earn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      amount: amount,
      description: description || 'Earned coins'
    })
  });
  if (!response.ok) throw new Error('Failed to earn coins');
  return response.json();
}

// Spend coins
export async function spendCoins(userId: string, amount: number, description?: string) {
  const response = await fetch(`${API_BASE_URL}/wallet/spend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      amount: amount,
      description: description || 'Spent coins'
    })
  });
  if (!response.ok) throw new Error('Failed to spend coins');
  return response.json();
}

// Add premium gems
export async function addPremiumGems(userId: string, amount: number) {
  const response = await fetch(`${API_BASE_URL}/wallet/add-gems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      amount: amount
    })
  });
  if (!response.ok) throw new Error('Failed to add gems');
  return response.json();
}

// Get all products
export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

// Purchase product
export async function purchaseProduct(userId: string, productId: string, currencyType: string) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      currency_type: currencyType
    })
  });
  if (!response.ok) throw new Error('Failed to purchase product');
  return response.json();
}

// Get user inventory
export async function getUserInventory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/inventory/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

// Get user info
export async function getUser(userId: string) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// Create user
export async function createUser(username: string, email: string) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email })
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}
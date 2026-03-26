const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token to localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle unauthorized
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },
};

// Account API
export const accountAPI = {
  getAll: async () => {
    const data = await apiRequest('/accounts');
    return data.accounts;
  },

  create: async (accountData) => {
    const data = await apiRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
    return data.account;
  },

  getBalance: async (accountId) => {
    const data = await apiRequest(`/accounts/balance/${accountId}`);
    return data;
  },

  addFunds: async (accountId, amount) => {
    const data = await apiRequest('/accounts/add-funds', {
      method: 'POST',
      body: JSON.stringify({ accountId, amount }),
    });
    return data;
  },

  closeAccount: async (accountId) => {
    const data = await apiRequest(`/accounts/${accountId}/close`, {
      method: 'PATCH',
    });
    return data;
  },
};

// Transaction API
export const transactionAPI = {
  create: async (transactionData) => {
    const data = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    return data;
  },

  createInitialFunds: async (transactionData) => {
    const data = await apiRequest('/transactions/system/initial-funds', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    return data;
  },
};

// Export utility functions
export { getToken, setToken, removeToken };

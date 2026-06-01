export const authService = {
  getUserInfo: async (token) => {
    if (token && token.startsWith('mock-token-')) {
      const username = token.replace('mock-token-', '');
      const role = username === 'admin_user' ? 'Admin' : 'User';
      return {
        status: 'success',
        user: { username, email: `${username}@damco.com`, role },
      };
    }
    throw new Error('Failed to get user info');
  },

  login: async (username, password) => {
    if (password === 'Damco1234') {
      const token = `mock-token-${username}`;
      const role = username === 'admin_user' ? 'Admin' : 'User';
      const user = { username, email: `${username}@damco.com`, role, token };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  forgotPassword: async () => {
    return { status: 'success', message: 'Password reset link sent to your email.' };
  },

  resetPassword: async () => {
    return { status: 'success', message: 'Password reset successfully.' };
  },
};

export default authService;

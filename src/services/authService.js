import { api } from '@/lib/api';

// Mock user data for local development
const MOCK_USERS = [
  {
    id: 'sysadmin1',
    username: 'system_admin',
    password: 'admin123',
    role: 'system-admin',
    name: 'System Admin',
    email: 'system@nbn.com',
    token: 'mock-token-system'
  },
  {
    id: 't3admin1',
    username: 't3_admin',
    password: 'admin123',
    role: 't3-admin',
    name: 'T3 Admin User',
    email: 't3@nbn.com',
    token: 'mock-token-t3'
  },
  // Also support old username for backward compatibility
  {
    id: 't3admin2',
    username: 't3admin',
    password: 'password',
    role: 't3-admin',
    name: 'T3 Admin User',
    email: 't3@nbn.com',
    token: 'mock-token-t3'
  }
];

export const authService = {
  login: async (username, password) => {
    // Check if this is a T3 admin login (use API endpoint)
    const isT3Admin = username === 't3_admin' || username === 't3admin' || username.toLowerCase().includes('t3');
    
    // Check if this is a System admin login (use API endpoint)
    const isSystemAdmin = username === 'system_admin' || username === 'system' || username.toLowerCase().includes('system');
    
    if (isT3Admin) {
      // T3 Admin: Always use API endpoint (regardless of useMock setting)
      try {
        const response = await api.t3admin.login({ username, password });
        if (response && response.success && response.data) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          
          // Fetch profile after login to get full user data
          try {
            const profileResponse = await api.t3admin.getProfile();
            if (profileResponse && profileResponse.success && profileResponse.data) {
              const profile = profileResponse.data;
              const userData = {
                id: profile.id || username,
                username: profile.username || username,
                role: 't3-admin',
                email: profile.email || `${username}@nbn.com`,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                admin_type: profile.admin_type,
                character: profile.character,
                wallet_address: profile.wallet_address,
                status: profile.status,
                last_login: profile.last_login,
                created_at: profile.created_at,
                token: token
              };
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('t3admin_profile', JSON.stringify(profile)); // Store full profile
              return userData;
            }
          } catch (profileError) {
            console.warn('Failed to fetch profile after login, using basic data:', profileError);
          }
          
          // Fallback to basic data if profile fetch fails
          const userData = {
            id: username,
            username: username,
            role: 't3-admin',
            email: `${username}@nbn.com`,
            token: token
          };
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
        throw new Error(response.message || 'Invalid credentials');
      } catch (error) {
        throw new Error(error.message || 'Invalid credentials');
      }
    } else if (isSystemAdmin) {
      // System Admin: Always use API endpoint (regardless of useMock setting)
      try {
        const response = await api.systemadmin.login({ username, password });
        if (response && response.success && response.data) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          
          // Fetch profile after login to get full user data
          try {
            const profileResponse = await api.systemadmin.getProfile();
            if (profileResponse && profileResponse.success && profileResponse.data) {
              const profile = profileResponse.data;
              const userData = {
                id: profile.id || username,
                username: profile.username || username,
                role: 'system-admin',
                email: profile.email || `${username}@nbn.com`,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                admin_type: profile.admin_type,
                character: profile.character,
                wallet_address: profile.wallet_address,
                status: profile.status,
                last_login: profile.last_login,
                created_at: profile.created_at,
                token: token
              };
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('systemadmin_profile', JSON.stringify(profile)); // Store full profile
              return userData;
            }
          } catch (profileError) {
            console.warn('Failed to fetch profile after login, using basic data:', profileError);
          }
          
          // Fallback to basic data if profile fetch fails
          const userData = {
            id: username,
            username: username,
            role: 'system-admin',
            email: `${username}@nbn.com`,
            token: token
          };
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
        throw new Error(response.message || 'Invalid credentials');
      } catch (error) {
        throw new Error(error.message || 'Invalid credentials');
      }
    } else {
      // Other roles: Always use mock data (if any remain)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Support login by username or email
      const user = MOCK_USERS.find(u => 
        (u.username === username || u.email === username) && u.password === password
      );

      if (user) {
        const { password: _password, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', user.token);
        return userWithoutPassword;
      }
      throw new Error('Invalid credentials');
    }
  },

  /**
   * T3Admin specific login
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>} User data
   */
  loginT3Admin: async (username, password) => {
      if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Support login by username or email
      const user = MOCK_USERS.find(u => 
        (u.username === username || u.email === username) && u.password === password && u.role === 't3-admin'
      );
      if (user) {
        const { password: _password, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', user.token);
        return userWithoutPassword;
      }
      throw new Error('Invalid credentials');
    } else {
      const response = await api.t3admin.login({ username, password });
      if (response && response.success && response.data) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        // Fetch profile after login to get full user data
        try {
          const profileResponse = await api.t3admin.getProfile();
          if (profileResponse && profileResponse.success && profileResponse.data) {
            const profile = profileResponse.data;
            const userData = {
              id: profile.id || username,
              username: profile.username || username,
              role: 't3-admin',
              email: profile.email || `${username}@nbn.com`,
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone,
              admin_type: profile.admin_type,
              character: profile.character,
              wallet_address: profile.wallet_address,
              status: profile.status,
              last_login: profile.last_login,
              created_at: profile.created_at,
              token: token
            };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('t3admin_profile', JSON.stringify(profile)); // Store full profile
            return userData;
          }
        } catch (profileError) {
          console.warn('Failed to fetch profile after login, using basic data:', profileError);
        }
        
        // Fallback to basic data if profile fetch fails
        const userData = {
          id: username,
          username: username,
          role: 't3-admin',
          email: `${username}@nbn.com`,
          token: token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      throw new Error(response.message || 'Invalid credentials');
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Mock fetch
global.fetch = jest.fn();

const TestComponent = () => {
  const { user, login, logout, register } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register('Test', 'test@test.com', 'password')}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('provides auth context', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  test('handles login success', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Test User', email: 'test@test.com' } }),
    };
    global.fetch.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      const loginButton = screen.getByText('Login');
      await loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  test('handles login failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      const loginButton = screen.getByText('Login');
      await loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  test('handles register success', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Test', email: 'test@test.com' } }),
    };
    global.fetch.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      const registerButton = screen.getByText('Register');
      await registerButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test');
    });
  });

  test('handles register failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Register failed'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      const registerButton = screen.getByText('Register');
      await registerButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  test('handles logout', async () => {
    // D'abord login
    const mockResponse = {
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Test User', email: 'test@test.com' } }),
    };
    global.fetch.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      const loginButton = screen.getByText('Login');
      await loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    // Puis logout
    await act(async () => {
      const logoutButton = screen.getByText('Logout');
      await logoutButton.click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });
});

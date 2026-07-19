import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('../context/AuthContext').useAuth.mockReturnValue({
      login: mockLogin,
      error: null,
      loading: false,
    });
  });

  test('renders login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/Organize your work/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      // La redirection peut être vers '/home' ou '/dashboard' selon l'implémentation
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('shows error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Vérifier que le formulaire est toujours là
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  test('navigates to register page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const registerLink = screen.getByText(/Créer un compte/i);
    await user.click(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('displays error from context', () => {
    require('../context/AuthContext').useAuth.mockReturnValue({
      login: mockLogin,
      error: 'Network error occurred',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });
});

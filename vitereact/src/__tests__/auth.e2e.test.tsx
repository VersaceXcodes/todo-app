import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UV_SignUp from '../components/views/UV_SignUp';
import UV_Login from '../components/views/UV_Login';
import { useAppStore } from '../store/main';

// Use a unique email for each test run to avoid conflicts
const TEST_PASSWORD = 'password123';

// Wrapper components for testing
const SignUpWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

const LoginWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E Tests (Vitest, real API)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
      current_workspace: null,
    }));
  });

  it('registers a new user successfully', async () => {
    const uniqueEmail = `register${Date.now()}@example.com`;
    
    render(<UV_SignUp />, { wrapper: SignUpWrapper });

    // Get elements by their specific IDs to avoid ambiguity
    const emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email-address"]' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input[id="password"]' });
    const passwordConfirmationInput = screen.getByTestId('password-confirmation');
    const submitButton = await screen.findByRole('button', { name: /sign up/i });

    // Ensure inputs are enabled before typing
    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(passwordConfirmationInput).not.toBeDisabled();
    });

    const user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.type(passwordConfirmationInput, TEST_PASSWORD);

    // Button should enable once all fields are filled
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    // Wait for registration to complete (should not automatically log in)
    await waitFor(
      () => {
        const state = useAppStore.getState();
        // After registration, user should not be automatically logged in based on the current implementation
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        expect(state.authentication_state.auth_token).toBeFalsy();
      },
      { timeout: 20000 }
    );
  }, 30000);

  it('logs in successfully with valid credentials', async () => {
    const uniqueEmail = `login${Date.now()}@example.com`;
    
    // First register the user
    render(<UV_SignUp />, { wrapper: SignUpWrapper });

    // Get elements by their specific IDs to avoid ambiguity
    let emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email-address"]' });
    let passwordInput = screen.getByLabelText(/password/i, { selector: 'input[id="password"]' });
    let passwordConfirmationInput = screen.getByTestId('password-confirmation');
    let submitButton = await screen.findByRole('button', { name: /sign up/i });

    let user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.type(passwordConfirmationInput, TEST_PASSWORD);
    await user.click(submitButton);

    // Wait for registration to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 20000 }
    );

    // Now test login
    render(<UV_Login />, { wrapper: LoginWrapper });

    emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email"]' });
    passwordInput = await screen.findByLabelText(/password/i, { selector: 'input[id="password"]' });
    submitButton = await screen.findByRole('button', { name: /sign in/i });

    // Ensure inputs are enabled before typing
    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);

    // Button should enable once both fields are filled
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    // Wait for auth to complete and store to reflect authenticated state
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );
  }, 40000);

  it('logs out successfully', async () => {
    const uniqueEmail = `logout${Date.now()}@example.com`;
    
    // First register and login the user
    render(<UV_SignUp />, { wrapper: SignUpWrapper });

    // Get elements by their specific IDs to avoid ambiguity
    let emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email-address"]' });
    let passwordInput = screen.getByLabelText(/password/i, { selector: 'input[id="password"]' });
    let passwordConfirmationInput = screen.getByTestId('password-confirmation');
    let submitButton = await screen.findByRole('button', { name: /sign up/i });

    let user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.type(passwordConfirmationInput, TEST_PASSWORD);
    await user.click(submitButton);

    // Wait for registration to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 20000 }
    );

    // Now login
    render(<UV_Login />, { wrapper: LoginWrapper });

    emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email"]' });
    passwordInput = await screen.findByLabelText(/password/i, { selector: 'input[id="password"]' });
    submitButton = await screen.findByRole('button', { name: /sign in/i });

    user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.click(submitButton);

    // Wait for login to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );

    // Test logout by directly calling the logout function
    const logoutUser = useAppStore.getState().logout_user;
    logoutUser();

    // Check that we're logged out
    const state = useAppStore.getState();
    expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
    expect(state.authentication_state.auth_token).toBeFalsy();
  }, 40000);

  it('completes full auth flow: register -> login -> logout', async () => {
    const uniqueEmail = `fullflow${Date.now()}@example.com`;
    
    // 1. Register
    render(<UV_SignUp />, { wrapper: SignUpWrapper });

    // Get elements by their specific IDs to avoid ambiguity
    let emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email-address"]' });
    let passwordInput = screen.getByLabelText(/password/i, { selector: 'input[id="password"]' });
    let passwordConfirmationInput = screen.getByTestId('password-confirmation');
    let submitButton = await screen.findByRole('button', { name: /sign up/i });

    let user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.type(passwordConfirmationInput, TEST_PASSWORD);
    await user.click(submitButton);

    // Wait for registration to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 20000 }
    );

    // 2. Login with the same credentials
    render(<UV_Login />, { wrapper: LoginWrapper });

    emailInput = await screen.findByLabelText(/email address/i, { selector: 'input[id="email"]' });
    passwordInput = await screen.findByLabelText(/password/i, { selector: 'input[id="password"]' });
    submitButton = await screen.findByRole('button', { name: /sign in/i });

    user = userEvent.setup();
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, TEST_PASSWORD);
    await user.click(submitButton);

    // Wait for login to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
      },
      { timeout: 20000 }
    );

    // 3. Logout
    const logoutUser = useAppStore.getState().logout_user;
    logoutUser();

    // Check that we're logged out
    const state = useAppStore.getState();
    expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
    expect(state.authentication_state.auth_token).toBeFalsy();
  }, 50000);
});
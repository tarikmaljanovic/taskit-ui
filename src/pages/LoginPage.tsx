// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useCreateUser } from '../api/queries/useUser';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Toggle between login vs. register forms
  const [showRegister, setShowRegister] = useState(false);

  // -------------------------------
  // Login form states
  // -------------------------------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // React Query login hook
  const {
    mutateAsync: loginUser,
    isError: isLoginError,
    error: loginError
  } = useLogin();

  // -------------------------------
  // Registration form states
  // -------------------------------
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // React Query create user hook
  const {
    mutateAsync: createUser,
    isError: isRegError,
    error: regError
  } = useCreateUser();

  // -------------------------------
  // Form Submissions
  // -------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });
      if (user) {
        // Store user and redirect
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        alert('Invalid credentials or user not found.');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check password match
    if (regPassword !== regConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const newUser = await createUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: 'MEMBER'
      });
      if (newUser) {
        // Store user and redirect
        localStorage.setItem('user', JSON.stringify(newUser));
        navigate('/dashboard');
      } else {
        alert('Could not register user.');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  // Toggle form
  const toggleForm = () => {
    setShowRegister((prev) => !prev);

    // Clear states
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {showRegister ? (
          // ---------- Registration Form ----------
          <>
            <h1 className="login-title">Create Account</h1>
            <form onSubmit={handleRegisterSubmit} className="login-form">
              {/* NAME */}
              <div className="input-group">
                <label htmlFor="reg-name">Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="input-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="input-group">
                <label htmlFor="reg-confirm-password">Confirm Password</label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* ERROR STATE (if any) */}
              {isRegError && (
                <p className="error-text">
                  {(regError as Error)?.message || 'Registration failed.'}
                </p>
              )}

              <button type="submit" className="login-button">
                Sign Up
              </button>
            </form>

            <p className="toggle-text">
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-button"
                onClick={toggleForm}
              >
                Log In
              </button>
            </p>
          </>
        ) : (
          // ---------- Login Form ----------
          <>
            <h1 className="login-title">Welcome</h1>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {/* ERROR STATE (if any) */}
              {isLoginError && (
                <p className="error-text">
                  {(loginError as Error)?.message || 'Login failed.'}
                </p>
              )}

              <button type="submit" className="login-button">
                Log In
              </button>
            </form>

            <p className="toggle-text">
              Don't have an account?{' '}
              <button
                type="button"
                className="toggle-button"
                onClick={toggleForm}
              >
                Register
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

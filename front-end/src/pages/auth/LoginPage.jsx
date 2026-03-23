import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { Users } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const canSubmit = forgot ? email : email && password;

  function handleSubmit(e) {
    e.preventDefault();

    if (forgot) {
      setResetSent(true);
    } else {
      // On successful sign in, navigate to onboarding
      navigate('/onboarding');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
<div className="auth-logo">
  <div className="auth-logo-row">
<div className="logo-mark">
  <Users size={22} color="white" />
</div>
    <h1>PairUp</h1>
  </div>
  <p>Find your NYU CS interview partner</p>
</div>

        {resetSent ? (
          <div className="auth-success">
            <h2>Reset email sent</h2>
            <p>Check your inbox for reset instructions.</p>
            <button
              className="auth-button secondary"
              onClick={() => {
                setForgot(false);
                setResetSent(false);
              }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{forgot ? 'Reset your password' : 'Welcome back'}</h2>

            <label>Email</label>
            <input
              type="email"
              placeholder="your@nyu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!forgot && (
              <>
                <div className="auth-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => setForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="password-row">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="show-hide-btn"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </>
            )}

            <button type="submit" className="auth-button" disabled={!canSubmit}>
              {forgot ? 'Send reset link' : 'Sign in'}
            </button>

            {forgot && (
              <button
                type="button"
                className="auth-button secondary"
                onClick={() => setForgot(false)}
              >
                Back
              </button>
            )}
          </form>
        )}

        {!forgot && !resetSent && (
          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
}
function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7c8f"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7c8f"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94" />
      <path d="M1 1l22 22" />
      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-.47" />
    </svg>
  );
}
export default LoginPage;
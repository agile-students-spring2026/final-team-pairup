import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import "./Auth.css";

import { API_BASE_URL } from "../../config/apiBase";

function LoginPage({ onLoginSuccess }) {
  const location = useLocation();
  const accountDeletedMessage =
    location.state?.accountDeleted && location.state?.message
      ? location.state.message
      : "";
  
  //add a message when the session expires
  // add a message when the session expires (carried via URL search param)
  const sessionExpiredMessage = location.search.includes("session-expired=1")
    ? "Your session expired. Please sign in again."
    : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = forgot
    ? email.trim() && !loading
    : email.trim() && password && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!canSubmit) return;

    if (forgot) {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Failed to send reset link.");
          return;
        }

        setResetSent(true);
      } catch (error) {
        console.error("Forgot password error:", error);
        setErrorMessage("Server error. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("fullName", data.user.fullName);

      onLoginSuccess?.(data.user);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
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
                setErrorMessage("");
              }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{forgot ? "Reset your password" : "Welcome back"}</h2>
            {accountDeletedMessage ? (
              <p className="auth-success-text">{accountDeletedMessage}</p>
            ) : null}
            {sessionExpiredMessage ? (
              <p className="auth-success-text">{sessionExpiredMessage}</p>
            ) : null}

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
                    onClick={() => {
                      setForgot(true);
                      setErrorMessage("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="password-row">
                  <input
                    type={showPw ? "text" : "password"}
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

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <button type="submit" className="auth-button" disabled={!canSubmit}>
              {loading
                ? forgot
                  ? "Sending..."
                  : "Signing in..."
                : forgot
                ? "Send reset link"
                : "Sign in"}
            </button>

            {forgot && (
              <button
                type="button"
                className="auth-button secondary"
                onClick={() => {
                  setForgot(false);
                  setErrorMessage("");
                }}
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
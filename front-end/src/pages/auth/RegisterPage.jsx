import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import "./Auth.css";

const API_BASE = "http://localhost:3000";

function RegisterPage({ onRegisterSuccess }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = name.trim() && email.trim() && password.length >= 8 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!canSubmit) return;

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to create account.");
        return;
      }

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("fullName", data.user.fullName);

      onRegisterSuccess?.(data.user);
    } catch (error) {
      console.error("Register error:", error);
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
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Get started</h2>

          <label>Full name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="your@nyu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-row">
            <input
              type={showPw ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
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

          {password.length > 0 && password.length < 8 && (
            <p className="error-text">Password must be at least 8 characters.</p>
          )}

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <button type="submit" className="auth-button" disabled={!canSubmit}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
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

export default RegisterPage;
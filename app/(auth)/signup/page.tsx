"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signup } from "@/lib/api/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await signup(cleanEmail, password);

      setSuccess(response.message);

      // Give the success message a moment before moving
      // to email verification.
      window.location.href = `/verify-otp?email=${encodeURIComponent(
        response.email,
      )}`;
    } catch (err) {
      const error = err as Error & {
        status?: number;
        code?: string;
      };

      setError(
        error.message || "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background" />

      <section className="auth-container">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            IFC <span>BIZGROWTH</span>
          </Link>

          <p>Discover. Connect. Grow.</p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-badge">GET STARTED</span>

            <h1>Create your account</h1>

            <p>
              Join IFC BIZGROWTH and start discovering businesses or building
              your business presence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>

              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-message auth-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-success" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link href="/login" className="auth-secondary-button">
            Log in
          </Link>

          <p className="auth-terms">
            By creating an account, you agree to our{" "}
            <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <Link href="/" className="auth-back">
          ← Back to IFC BIZGROWTH
        </Link>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signup } from "@/lib/api/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await signup(cleanEmail, password);

      window.location.href = `/verify-otp?email=${encodeURIComponent(
        response.email,
      )}`;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {/* HEADER */}
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link href="/" className="site-logo">
            IFC <span>BIZGROWTH</span>
          </Link>

          <div className="auth-header-right">
            <span>Already have an account?</span>

            <Link href="/login" className="auth-login-link">
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="auth-section">
        <div className="auth-container">
          {/* LEFT SIDE */}
          <div className="auth-intro">
            <span className="auth-eyebrow">
              IFC BIZGROWTH
            </span>

            <h1>
              Give your business
              <br />
              <span>a place to grow.</span>
            </h1>

            <p>
              Create your business account and start building
              your presence on IFC BIZGROWTH.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="auth-benefit-icon">✓</div>

                <div>
                  <strong>Build your business presence</strong>

                  <span>
                    Create and manage your business profile.
                  </span>
                </div>
              </div>

              <div className="auth-benefit">
                <div className="auth-benefit-icon">✓</div>

                <div>
                  <strong>Reach potential customers</strong>

                  <span>
                    Make your business easier to discover.
                  </span>
                </div>
              </div>

              <div className="auth-benefit">
                <div className="auth-benefit-icon">✓</div>

                <div>
                  <strong>Promote and grow</strong>

                  <span>
                    Access advertising and marketing support.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SIGNUP CARD */}
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create your account</h2>

              <p>
                Start your business journey with IFC BIZGROWTH.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  required
                  minLength={8}
                />

                <small>
                  Use at least 8 characters.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>

              <div className="auth-terms">
                <p>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already registered?</span>
            </div>

            <Link
              href="/login"
              className="auth-secondary-button"
            >
              Log in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="auth-footer">
        <p>
          © {new Date().getFullYear()} IFC BIZGROWTH.
          All rights reserved.
        </p>

        <p>
          A product of IFC Bridge Lab
        </p>
      </footer>
    </main>
  );
  }
